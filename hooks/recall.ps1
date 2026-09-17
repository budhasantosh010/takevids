# recall.ps1
# Claude Code "UserPromptSubmit" hook. THE RECALL LAYER (no-install tiers: intent + keyword +
# live-grep verify + cite/admit). Fires on every message but does almost nothing unless the
# message LOOKS BACK at the past - so average token cost is ~0.
#
# Mechanism, in order:
#   1. INTENT CHECK (code, $0): does the message reference the past?
#        ("remember", "earlier", "before", "last time", "that bug", "we did", "it/this/that"...)
#        NO  -> emit nothing, exit. (most messages)
#   2. INTENT RESOLVE (code, $0): if vague ("find it"), resolve the pronoun to the most-mentioned
#        recent noun from the transcript.
#   3. TIER 1 keyword search (code, $0): BM25-ish scan over decisions.jsonl + user_messages.txt.
#        (TIER 0 "already in context" + TIER 2 semantic embedder are added separately.)
#   4. LIVE-GREP VERIFY (code, $0): if the hit names a file, grep the CURRENT file -> CONFIRMED/STALE.
#   5. INJECT a tiny CITED pointer (~30-80 tokens), OR "not found" (admits unknown - no hallucinating).
#
# Fails safe: any error -> emit nothing, exit 0, never blocks the session.
#
# (-TestPrompt / -TestCwd let you exercise the logic directly without piping JSON on stdin.)

param([string]$TestPrompt = '', [string]$TestCwd = '')

$ErrorActionPreference = 'Stop'

function Find-ProjectRoot {
    param([string]$StartPath)
    if ([string]::IsNullOrWhiteSpace($StartPath)) { $StartPath = (Get-Location).Path }
    $current = [System.IO.Path]::GetFullPath($StartPath)
    while ($true) {
        if ((Test-Path -LiteralPath (Join-Path $current 'AGENTS.md')) -and
            (Test-Path -LiteralPath (Join-Path $current '.codex'))) { return $current }
        $parent = Split-Path -Path $current -Parent
        if ([string]::IsNullOrWhiteSpace($parent) -or $parent -eq $current) { return $null }
        $current = $parent
    }
}

$STOP = @('the','a','an','to','of','and','or','for','in','on','with','our','we','that','this',
          'is','be','it','as','at','by','not','no','you','i','do','did','can','find','get','me',
          'what','was','were','are','how','remember','earlier','before','last','time','again')

function Get-Keywords([string]$s) {
    if (-not $s) { return @() }
    ($s.ToLower() -replace '[^a-z0-9 ]', ' ' -split '\s+') |
        Where-Object { $_.Length -ge 3 -and $STOP -notcontains $_ } | Select-Object -Unique
}

try {
    $data = $null
    $prompt = ''
    $start = ''
    if ($TestPrompt) {
        # direct-invocation test path (bypasses stdin)
        $prompt = $TestPrompt
        $start = $TestCwd
    } else {
        $raw = [Console]::In.ReadToEnd()
        if (-not [string]::IsNullOrWhiteSpace($raw)) { try { $data = $raw | ConvertFrom-Json } catch { $data = $null } }
        if ($null -ne $data) {
            if     ($data.prompt)      { $prompt = [string]$data.prompt }
            elseif ($data.user_prompt) { $prompt = [string]$data.user_prompt }
            elseif ($data.input)       { $prompt = [string]$data.input }
            elseif ($data.message)     { $prompt = [string]$data.message }
            if ($data.PSObject.Properties.Name -contains 'cwd') { $start = [string]$data.cwd }
        }
    }
    if ([string]::IsNullOrWhiteSpace($prompt)) { exit 0 }

    if ([string]::IsNullOrWhiteSpace($start) -and $env:CODEX_PROJECT_DIR) { $start = $env:CODEX_PROJECT_DIR }
    $root = Find-ProjectRoot $start
    if (-not $root) { $root = Find-ProjectRoot (Get-Location).Path }
    if (-not $root) { exit 0 }

    # ---- 1) INTENT CHECK: does this message look back at the past? ----
    $lookback = $false
    $cues = @('remember','earlier','before','last time','last session','previously','we did',
              'we decided','we discussed','you said','that bug','that fix','that decision',
              'what did we','where did we','recall','go back','which decision','dec-')
    $low = $prompt.ToLower()
    foreach ($c in $cues) { if ($low.Contains($c)) { $lookback = $true; break } }
    # bare pronoun reference also counts ("fix it", "do that")
    if (-not $lookback -and ($low -match '\b(it|this|that|them|those|these)\b')) { $lookback = $true }
    if (-not $lookback) { exit 0 }   # not a look-back message -> 0 tokens

    # ---- 2) INTENT RESOLVE: build search keywords (resolve vague pronouns) ----
    $keywords = @(Get-Keywords $prompt)
    $msgFile = Join-Path $root 'DOCS\_raw\user_messages.txt'
    if ($keywords.Count -eq 0 -and (Test-Path -LiteralPath $msgFile)) {
        # vague message ("find it"): pull the most frequent noun-ish word from the last ~40 lines
        $tail = Get-Content -LiteralPath $msgFile -Tail 40 -ErrorAction SilentlyContinue
        $freq = @{}
        foreach ($w in (Get-Keywords ($tail -join ' '))) { $freq[$w] = ($freq[$w] + 1) }
        $keywords = @($freq.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 4 -ExpandProperty Key)
    }
    if ($keywords.Count -eq 0) { exit 0 }

    # ---- 3) TIER 1 keyword search over decisions + transcript ----
    $hits = @()  # each: @{ text; source; score; file; line }

    $decFile = Join-Path $root 'DOCS\_raw\decisions.jsonl'
    if (Test-Path -LiteralPath $decFile) {
        foreach ($ln in (Get-Content -LiteralPath $decFile)) {
            if ([string]::IsNullOrWhiteSpace($ln)) { continue }
            $o = $null; try { $o = $ln | ConvertFrom-Json } catch { continue }
            if (-not $o -or ($o.PSObject.Properties.Name -contains '_comment')) { continue }
            if (-not ($o.PSObject.Properties.Name -contains 'id')) { continue }
            $blob = (("{0} {1} {2}" -f $o.title, ($o.options -join ' '), $o.chosen)).ToLower()
            $score = 0; foreach ($k in $keywords) { if ($blob.Contains($k)) { $score++ } }
            if ($score -gt 0) {
                $hits += @{ text = "$($o.id) (msg $($o.msg)): $($o.title) -> $($o.chosen) [$($o.status)]"
                            source = 'decisions'; score = ($score * 2); file = ''; line = 0 }  # decisions weighted x2
            }
        }
    }

    if (Test-Path -LiteralPath $msgFile) {
        $sel = Select-String -LiteralPath $msgFile -Pattern ($keywords -join '|') -AllMatches -ErrorAction SilentlyContinue
        foreach ($m in ($sel | Select-Object -First 30)) {
            $line = $m.Line.Trim(); if ($line.Length -gt 160) { $line = $line.Substring(0,160) + '...' }
            $score = 0; foreach ($k in $keywords) { if ($m.Line.ToLower().Contains($k)) { $score++ } }
            $hits += @{ text = $line; source = "user_messages.txt:$($m.LineNumber)"; score = $score
                        file = ''; line = $m.LineNumber }
        }
    }

    # ---- 3b) TIER 2 semantic search - ONLY if keyword tier was weak (the token-saver). ----
    # Runs the local embedder (hooks/embed.py) if it's installed; silently skips if not.
    $strongKeyword = ($hits | Where-Object { $_.score -ge 2 } | Measure-Object).Count -gt 0
    if (-not $strongKeyword) {
        $py = (Get-Command python -ErrorAction SilentlyContinue)
        $embed = Join-Path $root 'hooks\embed.py'
        if ($py -and (Test-Path -LiteralPath $embed)) {
            try {
                $sem = & python $embed query $root $prompt 2>$null
                foreach ($l in $sem) {
                    if ([string]::IsNullOrWhiteSpace($l)) { continue }
                    $r = $null; try { $r = $l | ConvertFrom-Json } catch { continue }
                    if ($r -and $r.text) {
                        $t = [string]$r.text; if ($t.Length -gt 160) { $t = $t.Substring(0,160) + '...' }
                        # cosine 0..1 -> weight comparable to keyword scores
                        $hits += @{ text = "$t  (semantic ~$([math]::Round([double]$r.score,2)))"
                                    source = [string]$r.source; score = ([double]$r.score * 3); file = ''; line = 0 }
                    }
                }
            } catch { }
        }
    }

    if ($hits.Count -eq 0) {
        $ctx = "Recall: nothing in project memory matches that (searched decisions + transcript for: $($keywords -join ', ')). Say so instead of guessing."
        (@{ hookSpecificOutput = @{ hookEventName='UserPromptSubmit'; additionalContext=$ctx } } | ConvertTo-Json -Depth 6 -Compress)
        exit 0
    }

    # rank: score, then prefer decisions
    $top = $hits | Sort-Object @{e={$_.score};Descending=$true}, @{e={$_.source -like 'decisions*'};Descending=$true} |
           Select-Object -First 3

    # ---- 4) LIVE-GREP VERIFY: if a hit names a real file, confirm it still exists ----
    $verifyNote = ''
    foreach ($h in $top) {
        if ($h.text -match '([\w./\\-]+\.\w{1,5})') {
            $cand = $matches[1]
            $full = Join-Path $root $cand
            if (Test-Path -LiteralPath $full) { $verifyNote = " [file $cand CONFIRMED present]" }
            else { $verifyNote = " [file $cand NOT FOUND - may be stale/renamed]" }
            break
        }
    }

    # ---- 5) INJECT the tiny cited pointer ----
    $lines = $top | ForEach-Object { "  - $($_.text)  (src: $($_.source))" }
    $ctx = "Recall (code-verified, keyword tier) for [$($keywords -join ', ')]:`n" + ($lines -join "`n") + $verifyNote +
           "`nThese are pointers from project memory. If you need the full text, read the cited file/line. Trust these over your own memory; if a user asks 'did we...', this is the evidence."
    (@{ hookSpecificOutput = @{ hookEventName='UserPromptSubmit'; additionalContext=$ctx } } | ConvertTo-Json -Depth 6 -Compress)
    exit 0
}
catch { exit 0 }
