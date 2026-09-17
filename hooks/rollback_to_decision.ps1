# rollback_to_decision.ps1
# Roll the project back to the checkpoint of a recorded decision - deterministically, no
# guessing. Given a DEC-XXX (or a user message number), it finds the git commit stored with
# that decision and shows you EXACTLY what reverting to it means, then (only with -Apply)
# does it. It also marks every decision AFTER that point as 'superseded' so the tree redraws
# to match reality.
#
# THIS IS WHAT YOU TELL THE AGENT. Instead of explaining in prose ("go back to where we
# decided X"), you point at a node: the agent runs this with the DEC id, and the code + the
# decision tree both return to that exact checkpoint. Zero Chinese whisper - the commit hash
# is the single source of truth.
#
# Usage:
#   ... -Id DEC-004                 # preview (DRY RUN - shows the plan, changes nothing)
#   ... -Msg 7                      # same, by user message number
#   ... -Id DEC-004 -Apply          # actually roll back (git + tree)
#   ... -Id DEC-004 -Apply -Hard    # use 'git reset --hard' instead of 'git revert' (DESTRUCTIVE)

param(
    [string]$Id = "",
    [int]$Msg = 0,
    [switch]$Apply,
    [switch]$Hard
)

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

$root = Find-ProjectRoot $env:CODEX_PROJECT_DIR
if (-not $root) { $root = Find-ProjectRoot (Get-Location).Path }
if (-not $root) { $root = (Get-Location).Path }

$data = Join-Path $root 'DOCS\_raw\decisions.jsonl'
if (-not (Test-Path -LiteralPath $data)) { Write-Host "No decisions.jsonl found."; exit 1 }

# Load all decisions (skip the header comment line).
$rows = @()
foreach ($ln in (Get-Content -LiteralPath $data)) {
    if ([string]::IsNullOrWhiteSpace($ln)) { continue }
    $o = $null; try { $o = $ln | ConvertFrom-Json } catch { continue }
    if (-not $o -or ($o.PSObject.Properties.Name -contains '_comment')) { continue }
    if ($o.PSObject.Properties.Name -contains 'id') { $rows += $o }
}
if ($rows.Count -eq 0) { Write-Host "No decisions recorded yet."; exit 1 }

# Find the target decision by Id or by message number.
$target = $null
if ($Id) { $target = $rows | Where-Object { $_.id -eq $Id } | Select-Object -Last 1 }
elseif ($Msg -gt 0) { $target = $rows | Where-Object { [int]$_.msg -eq $Msg } | Select-Object -Last 1 }
else { Write-Host "Give -Id DEC-XXX or -Msg N."; exit 1 }

if (-not $target) { Write-Host "No decision matched. Check DOCS/decision_tree.svg for valid ids."; exit 1 }
if (-not $target.commit) {
    Write-Host "Decision $($target.id) has no stored commit hash - it predates a git baseline. Cannot auto-roll-back the code."
    exit 1
}

$verb = if ($Hard) { "git reset --hard (DESTRUCTIVE - discards everything after)" } else { "git revert (safe - new commit that undoes the change)" }

Write-Host ""
Write-Host "ROLLBACK TARGET"
Write-Host "  decision : $($target.id)  -  $($target.title)"
Write-Host "  from msg : $($target.msg)"
Write-Host "  chosen   : $($target.chosen)"
Write-Host "  commit   : $($target.commit)"
Write-Host "  method   : $verb"
Write-Host ""

# Which later decisions would be marked superseded. Use the target's last position in the
# file, then take only the rows strictly AFTER it (guard against the PowerShell range
# counting backwards when the target is the final row).
$idx = -1
for ($i = 0; $i -lt $rows.Count; $i++) { if ($rows[$i].id -eq $target.id) { $idx = $i } }
$after = @()
if ($idx -ge 0 -and ($idx + 1) -le ($rows.Count - 1)) {
    $after = $rows[($idx+1)..($rows.Count-1)] | Where-Object { $_ -and $_.id -ne $target.id }
}
if ($after) {
    Write-Host "These later decisions will be marked 'superseded' (tree re-routes to $($target.id)):"
    foreach ($a in $after) { Write-Host "    - $($a.id) (msg $($a.msg)) $($a.title)" }
    Write-Host ""
}

if (-not $Apply) {
    Write-Host "DRY RUN - nothing changed. Re-run with -Apply to do it."
    exit 0
}

# --- APPLY ---
Push-Location $root
try {
    if ($Hard) {
        git reset --hard $target.commit
    } else {
        # Revert everything from the target commit up to HEAD with a single new commit.
        git revert --no-edit "$($target.commit)..HEAD"
    }
    Write-Host "Git rolled back via $verb."
} finally {
    Pop-Location
}

# Mark later decisions superseded by appending correction lines (append-only; never edit history).
$stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
foreach ($a in $after) {
    $corr = [ordered]@{
        id=$a.id; msg=$a.msg; title=$a.title; options=$a.options; chosen=$a.chosen
        parent=$a.parent; status='superseded'; commit=$a.commit; ts=$stamp
        note="superseded by rollback to $($target.id)"
    }
    [System.IO.File]::AppendAllText($data, (($corr|ConvertTo-Json -Compress -Depth 5)+"`r`n"), [System.Text.UTF8Encoding]::new($false))
}

# Redraw the tree.
$render = Join-Path $root 'hooks\render_decision_tree.ps1'
if (Test-Path -LiteralPath $render) { & powershell -NoProfile -ExecutionPolicy Bypass -File $render 2>$null }

Write-Host "Done. Decision tree updated. Review DOCS/decision_tree.svg."
exit 0
