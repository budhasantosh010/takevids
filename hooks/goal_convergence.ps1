# goal_convergence.ps1
# THE GREEN LINE. After each turn, cheaply answers "are we still heading toward the ROOT goal,
# or have we drifted?" - using ONLY code (zero model tokens). It compares the ROOT goal (first
# line of decisions.jsonl) against the active decisions, open blockers, and recent thrash.
#
# It writes DOCS/GOAL_STATUS.md (a tiny human-readable status) and, when run as a hook, emits a
# one-line additionalContext ONLY IF the status CHANGED since last time (so it costs ~0 tokens on
# average). The nuanced "are we 100%? is the error negligible?" verdict is NOT done here - that
# needs the model and is run on demand, not every turn.
#
# Fails safe: any error -> emits nothing, exits 0, never blocks the session.

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

function Get-Words([string]$s) {
    if (-not $s) { return @() }
    $stop = @('the','a','an','to','of','and','or','for','in','on','with','our','we','that','this','is','be','it','as','at','by','not','no')
    ($s.ToLower() -replace '[^a-z0-9 ]', ' ' -split '\s+') |
        Where-Object { $_.Length -ge 3 -and $stop -notcontains $_ }
}

try {
    # Tolerate Stop-hook stdin JSON (has cwd) or empty.
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

    $dataFile = Join-Path $root 'DOCS\_raw\decisions.jsonl'
    if (-not (Test-Path -LiteralPath $dataFile)) { exit 0 }

    # Load decisions (skip the header comment).
    $rows = @()
    foreach ($ln in (Get-Content -LiteralPath $dataFile)) {
        if ([string]::IsNullOrWhiteSpace($ln)) { continue }
        $o = $null; try { $o = $ln | ConvertFrom-Json } catch { continue }
        if (-not $o -or ($o.PSObject.Properties.Name -contains '_comment')) { continue }
        if ($o.PSObject.Properties.Name -contains 'id') { $rows += $o }
    }
    if ($rows.Count -eq 0) { exit 0 }

    # ROOT goal = the first parent=ROOT line (fallback: first row).
    $rootRow = ($rows | Where-Object { $_.parent -eq 'ROOT' } | Select-Object -First 1)
    if (-not $rootRow) { $rootRow = $rows[0] }
    $goalText = [string]$rootRow.title

    # Latest status per decision id (append-only: last line wins).
    $latest = @{}
    foreach ($r in $rows) { $latest[[string]$r.id] = $r }
    $active = $latest.Values | Where-Object { $_.status -ne 'superseded' -and $_.status -ne 'rejected' }
    $superseded = @($latest.Values | Where-Object { $_.status -eq 'superseded' }).Count
    $pending = @($latest.Values | Where-Object { $_.status -eq 'pending' }).Count

    # Open blockers from BUILD_TRACKER: count only real table rows marked blocked (the red marker),
    # NOT the legend line that merely defines what BLOCKED means.
    $blocked = 0
    $bt = Join-Path $root 'DOCS\BUILD_TRACKER.md'
    if (Test-Path -LiteralPath $bt) {
        foreach ($l in (Get-Content -LiteralPath $bt)) {
            if ($l -match '^\s*\|' -and $l -match '❌') { $blocked++ }   # a table row containing the ❌ marker
        }
    }

    # Cheap "are recent decisions about the goal?" proxy: word overlap of the last few decision
    # titles with the goal text.
    $goalWords = @(Get-Words $goalText)
    $recent = $active | Select-Object -Last 3
    $overlap = 0; $totalRecentWords = 0
    foreach ($r in $recent) {
        $w = @(Get-Words ([string]$r.title))
        $totalRecentWords += $w.Count
        foreach ($x in $w) { if ($goalWords -contains $x) { $overlap++ } }
    }
    $onTopic = ($totalRecentWords -gt 0 -and $overlap -gt 0)

    # Decide the flag (pure heuristic, deterministic).
    $flag = 'ON-TRACK'
    if ($blocked -gt 0) { $flag = 'BLOCKED' }
    elseif ($superseded -ge 2 -and -not $onTopic) { $flag = 'DRIFTING' }
    elseif (-not $onTopic -and $active.Count -ge 3) { $flag = 'DRIFTING' }

    $line = "GOAL: $goalText | Status: $flag | active=$($active.Count) superseded=$superseded pending=$pending blocked=$blocked | recent-on-topic=$onTopic"

    # Write the human-readable status file (always; it's tiny and local).
    $statusFile = Join-Path $root 'DOCS\GOAL_STATUS.md'
    $body = @"
# Goal status (auto-generated, code-only, zero tokens)

ROOT goal: $goalText

Status: $flag

- active decisions: $($active.Count)
- superseded (rolled back / changed): $superseded
- pending: $pending
- open blockers (BUILD_TRACKER): $blocked
- recent work overlaps goal terms: $onTopic

Note: this is a cheap CODE proxy, not a judgment. For the real "are we 100%? is the error
negligible?" verdict, ask the agent to run a goal-convergence judgment (on demand, at milestones).
"@
    [System.IO.File]::WriteAllText($statusFile, $body, [System.Text.UTF8Encoding]::new($false))

    # Inject the one-liner ONLY IF it changed since last time (keeps average token cost ~0).
    $stamp = Join-Path $root 'DOCS\_raw\.goal_status_last'
    $prev = ''
    if (Test-Path -LiteralPath $stamp) { $prev = (Get-Content -LiteralPath $stamp -Raw).Trim() }
    if ($line.Trim() -ne $prev) {
        [System.IO.File]::WriteAllText($stamp, $line, [System.Text.UTF8Encoding]::new($false))
        $out = @{ hookSpecificOutput = @{ hookEventName = 'Stop'; additionalContext = $line } }
        $out | ConvertTo-Json -Depth 6 -Compress
    }
    exit 0
}
catch { exit 0 }
