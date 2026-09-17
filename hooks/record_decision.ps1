# record_decision.ps1
# Appends ONE decision to DOCS/_raw/decisions.jsonl. The agent calls this whenever a real
# decision is made, supplying the facts; this script stamps the git commit hash + timestamp.
#
# Usage (from the project root):
#   powershell -NoProfile -ExecutionPolicy Bypass -File hooks\record_decision.ps1 `
#       -Id DEC-004 -Msg 7 -Title "package manager" `
#       -Options "npm,pnpm,yarn" -Chosen "pnpm" -Parent DEC-001 -Status chosen
#
# -Status: chosen | rejected | superseded | pending   (default: chosen)
# -Parent: the DEC-XXX this branches from, or ROOT for the main goal/trunk.
# Only -Id, -Title are strictly required; the rest are optional.

param(
    [Parameter(Mandatory=$true)][string]$Id,
    [int]$Msg = 0,
    [Parameter(Mandatory=$true)][string]$Title,
    [string]$Options = "",
    [string]$Chosen = "",
    [string]$Parent = "ROOT",
    [string]$Status = "chosen"
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

try {
    $root = Find-ProjectRoot $env:CODEX_PROJECT_DIR
    if (-not $root) { $root = Find-ProjectRoot (Get-Location).Path }
    if (-not $root) { $root = (Get-Location).Path }

    # Stamp the current git commit (so this decision is a rollback checkpoint). '' if no git.
    $commit = ''
    try { $commit = (git -C $root rev-parse --short HEAD 2>$null) } catch { $commit = '' }
    if (-not $commit) { $commit = '' }

    $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

    $optsArr = @()
    if ($Options) { $optsArr = $Options.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ } }

    $obj = [ordered]@{
        id      = $Id
        msg     = $Msg
        title   = $Title
        options = $optsArr
        chosen  = $Chosen
        parent  = $Parent
        status  = $Status
        commit  = $commit
        ts      = $stamp
    }
    $line = ($obj | ConvertTo-Json -Compress -Depth 5)

    $file = Join-Path $root 'DOCS\_raw\decisions.jsonl'
    [System.IO.File]::AppendAllText($file, $line + "`r`n", [System.Text.UTF8Encoding]::new($false))

    Write-Host "Recorded $Id (msg $Msg, status $Status, commit $commit)."

    # Immediately re-render the tree so the picture is always current.
    $render = Join-Path $root 'hooks\render_decision_tree.ps1'
    if (Test-Path -LiteralPath $render) {
        & powershell -NoProfile -ExecutionPolicy Bypass -File $render 2>$null
    }
    exit 0
}
catch {
    [Console]::Error.WriteLine("record_decision failed: $($_.Exception.Message)")
    exit 1
}
