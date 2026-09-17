# index_semantic.ps1
# Claude Code "Stop" hook. OPTIONAL Tier-2 indexing: after each turn, incrementally embed any
# NEW transcript/decision chunks into the local vector index (DOCS/_raw/semantic_chunks.jsonl).
# Pure local, ZERO API/model tokens. If the embedder (hooks/embed.py + sentence-transformers)
# isn't installed, this does nothing - the template still works (recall falls back to keyword).
#
# Fails safe: any error / no python / no model -> does nothing, exits 0, never blocks.

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

    $py = (Get-Command python -ErrorAction SilentlyContinue)
    $embed = Join-Path $root 'hooks\embed.py'
    if ($py -and (Test-Path -LiteralPath $embed)) {
        try { & python $embed index $root 2>$null | Out-Null } catch { }
    }
    exit 0
}
catch { exit 0 }
