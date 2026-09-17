# render_decision_tree.ps1
# Draws the decision history three ways from DOCS/_raw/decisions.jsonl - pure code, ZERO tokens:
#
#   1. DOCS/decision_tree.txt          THE BIG PICTURE - cumulative text diagram with the
#                                      left "main goal" spine + legend. Code-drawn char by char,
#                                      so the layout is EXACT and never shifts. (Regenerated each
#                                      turn; the previous version is snapshotted to history first.)
#   2. DOCS/decision_tree/msg_<NNN>_<id>.mmd + .svg
#                                      ONE small mermaid+svg PER message (ROOT goal -> message ->
#                                      its options -> picked). Small = mermaid lays it out cleanly.
#                                      Append-only: existing ones are NEVER overwritten = history.
#                                      Only the newest (missing-svg) one is rendered each turn (fast).
#   3. DOCS/decision_tree_history/<timestamp>_decision_tree.txt
#                                      timestamped snapshot of the cumulative text before redraw.
#
# Runs as the Stop hook and is also called by record_decision.ps1.
# Fails safe: any error -> prints nothing, exits 0, never blocks the session.

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

function San([string]$s) {
    if (-not $s) { return "" }
    ($s -replace '["\[\]\(\)\{\}|<>]', ' ' -replace '\s+', ' ').Trim()
}

# The color legend, shared by text + every mermaid (so it's identical everywhere).
$LEGEND_TEXT = @(
    'LEGEND:  [ROOT]=main goal/trunk   {MSG}=message/fork   ( )=option not taken',
    '         <PICKED>=chosen path      |GOAL CHECK|=convergence    : : =green feedback loop'
)
function Add-MermaidLegend([System.Text.StringBuilder]$sb) {
    # Horizontal legend: a small COLORED SWATCH box next to each label, chained left-to-right,
    # sitting directly above the goal box. Invisible chain (~~~) forces the horizontal layout.
    [void]$sb.AppendLine('  subgraph LG[" "]')
    [void]$sb.AppendLine('    direction LR')
    [void]$sb.AppendLine('    Lg[" "]:::goal')
    [void]$sb.AppendLine('    Lg ~~~ LgT["goal/trunk"]:::txt')
    [void]$sb.AppendLine('    LgT ~~~ Lm[" "]:::msg')
    [void]$sb.AppendLine('    Lm ~~~ LmT["message/fork"]:::txt')
    [void]$sb.AppendLine('    LmT ~~~ Lo[" "]:::opt')
    [void]$sb.AppendLine('    Lo ~~~ LoT["option"]:::txt')
    [void]$sb.AppendLine('    LoT ~~~ Lp[" "]:::pick')
    [void]$sb.AppendLine('    Lp ~~~ LpT["picked"]:::txt')
    [void]$sb.AppendLine('    LpT ~~~ Lc[" "]:::conv')
    [void]$sb.AppendLine('    Lc ~~~ LcT["goal-check"]:::txt')
    [void]$sb.AppendLine('  end')
}
function Add-MermaidClasses([System.Text.StringBuilder]$sb) {
    [void]$sb.AppendLine('  classDef goal fill:#30363d,stroke:#8b949e,color:#fff;')
    [void]$sb.AppendLine('  classDef msg  fill:#1b3a5c,stroke:#388bfd,color:#fff;')
    [void]$sb.AppendLine('  classDef opt  fill:#21262d,stroke:#8b949e,color:#fff;')
    [void]$sb.AppendLine('  classDef pick fill:#1f6f3f,stroke:#2ea043,color:#fff;')
    [void]$sb.AppendLine('  classDef conv fill:#3d2c00,stroke:#d4a72c,color:#fff;')
    [void]$sb.AppendLine('  classDef txt fill:#0d1117,stroke:#0d1117,color:#8b949e,font-size:11px;')
}

try {
    $root = $null
    try {
        $raw = [Console]::In.ReadToEnd()
        if (-not [string]::IsNullOrWhiteSpace($raw)) {
            $d = $raw | ConvertFrom-Json
            if ($d -and ($d.PSObject.Properties.Name -contains 'cwd')) { $root = Find-ProjectRoot ([string]$d.cwd) }
        }
    } catch { }
    if (-not $root) { $root = Find-ProjectRoot $env:CODEX_PROJECT_DIR }
    if (-not $root) { $root = Find-ProjectRoot (Get-Location).Path }
    if (-not $root) { exit 0 }

    $data = Join-Path $root 'DOCS\_raw\decisions.jsonl'
    if (-not (Test-Path -LiteralPath $data)) { exit 0 }

    # Load decisions (skip header). Keep the LAST line per id (append-only: latest wins).
    $order = @(); $latest = @{}
    foreach ($ln in (Get-Content -LiteralPath $data)) {
        if ([string]::IsNullOrWhiteSpace($ln)) { continue }
        $o = $null; try { $o = $ln | ConvertFrom-Json } catch { continue }
        if (-not $o -or ($o.PSObject.Properties.Name -contains '_comment')) { continue }
        if (-not ($o.PSObject.Properties.Name -contains 'id')) { continue }
        $id = [string]$o.id
        if (-not $latest.ContainsKey($id)) { $order += $id }
        $latest[$id] = $o
    }
    if ($order.Count -eq 0) { exit 0 }
    $rows = $order | ForEach-Object { $latest[$_] }

    $rootRow = ($rows | Where-Object { $_.parent -eq 'ROOT' } | Select-Object -First 1)
    if (-not $rootRow) { $rootRow = $rows[0] }
    $goal = San ([string]$rootRow.title)
    $children = $rows | Where-Object { $_ -ne $rootRow }

    # ---------- 1) CUMULATIVE TEXT DIAGRAM (left spine, exact, code-drawn) ----------
    $t = New-Object System.Collections.Generic.List[string]
    foreach ($lg in $LEGEND_TEXT) { $t.Add($lg) }
    $t.Add('')
    $t.Add("[ROOT] MAIN GOAL: $goal")
    $t.Add('  |')
    $t.Add('  |   (main thread - long-term vision & final output kept intact)')
    $t.Add('  |')
    foreach ($r in $children) {
        $msg = if ($r.msg) { [int]$r.msg } else { 0 }
        $title = San ([string]$r.title)
        $status = if ($r.status) { [string]$r.status } else { 'chosen' }
        $tag = switch ($status) { 'superseded' {' (superseded)'} 'rejected' {' (rejected)'} 'pending' {' (pending)'} default {''} }
        $commit = if ($r.commit) { "  [$($r.commit)]" } else { '' }
        $t.Add("  +-- {MSG $msg} $title$tag$commit")
        $opts = @(); if ($r.options) { $opts = @($r.options) }
        $chosen = San ([string]$r.chosen)
        if ($opts.Count -gt 0) {
            foreach ($opt in $opts) {
                $os = San ([string]$opt)
                if ($chosen -and $os -eq $chosen) { $t.Add("  |     <PICKED: $os>") }
                else { $t.Add("  |     ( $os )") }
            }
        } elseif ($chosen) {
            $t.Add("  |     <PICKED: $chosen>")
        }
        $t.Add('  |')
    }
    $t.Add('  v')
    $t.Add('[ROOT] EXPECTED MAIN FINAL GOAL  (the north star)')
    $t.Add('  ^')
    $t.Add('  : : green feedback loop')
    $t.Add('  +-- |GOAL CHECK|  how close to the ROOT goal?  ON-TRACK? 100%? error so low it does not matter?')
    $textOut = ($t -join "`r`n")

    $txtFile = Join-Path $root 'DOCS\decision_tree.txt'
    # snapshot previous text into history before overwriting
    if (Test-Path -LiteralPath $txtFile) {
        $histDir = Join-Path $root 'DOCS\decision_tree_history'
        [System.IO.Directory]::CreateDirectory($histDir) | Out-Null
        $stamp = (Get-Date -Format 'yyyy-MM-dd_HHmmss')
        Copy-Item -LiteralPath $txtFile -Destination (Join-Path $histDir ($stamp + '_decision_tree.txt')) -Force
    }
    [System.IO.File]::WriteAllText($txtFile, $textOut, [System.Text.UTF8Encoding]::new($false))

    # ---------- 1b) FULL TIMELINE: EVERY user message in tree shape, each tagged with its
    #               decision ("DEC-XXX picked Y") or "(no decision)". Best of both worlds:
    #               complete like the transcript, structured like the tree. Code-only, $0.
    $msgFile = Join-Path $root 'DOCS\_raw\user_messages.txt'
    if (Test-Path -LiteralPath $msgFile) {
        # map: message number -> decision row (for quick tagging)
        $decByMsg = @{}
        foreach ($r in $children) { if ($r.msg) { $decByMsg[[int]$r.msg] = $r } }

        $f = New-Object System.Collections.Generic.List[string]
        foreach ($lg in $LEGEND_TEXT) { $f.Add($lg) }
        $f.Add('')
        $f.Add('FULL TIMELINE - every user message in decision-tree shape. Each message is tagged')
        $f.Add('with the decision it produced, or "(no decision)". Full text is in _raw/user_messages.txt.')
        $f.Add('')
        $f.Add("[ROOT] MAIN GOAL: $goal")
        $f.Add('  |')

        # parse user_messages.txt: each block starts with "===== [stamp] ... msg=N ====="
        $curMsg = 0; $curText = New-Object System.Collections.Generic.List[string]
        $flush = {
            if ($curMsg -gt 0) {
                $preview = (($curText -join ' ') -replace '\s+', ' ').Trim()
                if ($preview.Length -gt 70) { $preview = $preview.Substring(0,70) + '...' }
                $dec = $decByMsg[$curMsg]
                if ($dec) {
                    $ch = San ([string]$dec.chosen)
                    $f.Add("  +-- {MSG $curMsg} ""$preview""   -> $($dec.id) <PICKED: $ch>")
                } else {
                    $f.Add("  +-- {MSG $curMsg} ""$preview""   -> (no decision)")
                }
            }
        }
        foreach ($ln in (Get-Content -LiteralPath $msgFile)) {
            if ($ln -match '^===== \[.*\bmsg=(\d+)\b') {
                & $flush
                $curMsg = [int]$matches[1]; $curText = New-Object System.Collections.Generic.List[string]
            } elseif ($ln -notmatch '^# ' -and -not [string]::IsNullOrWhiteSpace($ln)) {
                if ($curText.Count -lt 4) { $curText.Add($ln) }
            }
        }
        & $flush
        $f.Add('  |')
        $f.Add('  v')
        $f.Add('[ROOT] EXPECTED MAIN FINAL GOAL  (the north star)')
        $f.Add('  +-- |GOAL CHECK|  how close to the ROOT goal?  ON-TRACK? 100%? error negligible?')

        $fullFile = Join-Path $root 'DOCS\decision_tree_FULL.txt'
        if (Test-Path -LiteralPath $fullFile) {
            $histDir2 = Join-Path $root 'DOCS\decision_tree_history'
            [System.IO.Directory]::CreateDirectory($histDir2) | Out-Null
            $stamp2 = (Get-Date -Format 'yyyy-MM-dd_HHmmss')
            Copy-Item -LiteralPath $fullFile -Destination (Join-Path $histDir2 ($stamp2 + '_decision_tree_FULL.txt')) -Force
        }
        [System.IO.File]::WriteAllText($fullFile, ($f -join "`r`n"), [System.Text.UTF8Encoding]::new($false))
    }

    # ---------- 2) PER-MESSAGE mermaid + svg (small, clean, append-only) ----------
    $perDir = Join-Path $root 'DOCS\decision_tree'
    [System.IO.Directory]::CreateDirectory($perDir) | Out-Null

    foreach ($r in $children) {
        $id = San ([string]$r.id)
        $msg = if ($r.msg) { [int]$r.msg } else { 0 }
        $base = ('msg_{0:D3}_{1}' -f $msg, $id)
        $mmdPath = Join-Path $perDir ($base + '.mmd')
        $svgPath = Join-Path $perDir ($base + '.svg')

        $title = San ([string]$r.title)
        $opts = @(); if ($r.options) { $opts = @($r.options) }
        $chosen = San ([string]$r.chosen)

        $sb = New-Object System.Text.StringBuilder
        [void]$sb.AppendLine('flowchart TD')
        Add-MermaidLegend $sb
        [void]$sb.AppendLine("  GOAL([""ROOT GOAL: $goal""]):::goal")
        [void]$sb.AppendLine('  LG -.-> GOAL')
        [void]$sb.AppendLine("  M{{""MESSAGE $msg - $title""}}:::msg")
        [void]$sb.AppendLine('  GOAL --> M')
        $i = 0
        if ($opts.Count -gt 0) {
            foreach ($opt in $opts) {
                $os = San ([string]$opt); $i++
                $cls = if ($chosen -and $os -eq $chosen) { 'pick' } else { 'opt' }
                [void]$sb.AppendLine("  M --> o$i[""$os""]:::$cls")
                if ($cls -eq 'pick') { [void]$sb.AppendLine("  o$i -->|picked| NEXT[""next message...""]:::opt") }
            }
        } elseif ($chosen) {
            [void]$sb.AppendLine("  M --> o1[""$chosen""]:::pick")
            [void]$sb.AppendLine("  o1 -->|picked| NEXT[""next message...""]:::opt")
        }
        Add-MermaidClasses $sb
        [System.IO.File]::WriteAllText($mmdPath, $sb.ToString(), [System.Text.UTF8Encoding]::new($false))

        # Render svg ONLY if missing (past ones are frozen = fast; append-only history).
        if (-not (Test-Path -LiteralPath $svgPath)) {
            try { $null = & npx --yes @mermaid-js/mermaid-cli -i $mmdPath -o $svgPath 2>$null } catch { }
        }
    }

    exit 0
}
catch { exit 0 }
