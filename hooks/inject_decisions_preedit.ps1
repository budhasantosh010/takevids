# inject_decisions_preedit.ps1
# Codex "PreToolUse" hook (match: apply_patch|Edit|Write - Codex edits via apply_patch).
#
# THE "pnpm not npm at step 15" FIX. Right before the model edits a file - even deep in a long,
# sloppy session - this hook fires and injects the DECISIONS catalog next to the tool call. The
# rules arrive AT THE MOMENT OF ACTION, so a forgetful (or compacted) model still sees them.
#
# It does NOT block edits - it only ADDS the rules as model-visible context.
# On any error: emit nothing, exit 0 - never block an edit because of this hook.

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
    $raw = [Console]::In.ReadToEnd()
    $data = $null
    if (-not [string]::IsNullOrWhiteSpace($raw)) { try { $data = $raw | ConvertFrom-Json } catch { $data = $null } }

    $start = $null
    if ($data -and ($data.PSObject.Properties.Name -contains 'cwd')) { $start = [string]$data.cwd }
    elseif ($env:CODEX_PROJECT_DIR) { $start = $env:CODEX_PROJECT_DIR }
    $root = Find-ProjectRoot $start
    if (-not $root) { $root = Find-ProjectRoot (Get-Location).Path }
    if (-not $root) { exit 0 }

    $dec = Join-Path $root 'DOCS\DECISIONS.md'
    $req = Join-Path $root 'DOCS\REQUIREMENTS.md'

    $lines = New-Object System.Collections.Generic.List[string]
    foreach ($f in @($dec, $req)) {
        if (Test-Path -LiteralPath $f) {
            Select-String -LiteralPath $f -Pattern '^##\s+(DEC|REQ)-\d' |
                ForEach-Object { $lines.Add($_.Line.TrimStart('#',' ')) }
        }
    }

    # Nothing recorded yet -> stay silent (don't nag on a fresh template).
    if ($lines.Count -eq 0) { exit 0 }

    $ctx = "Active project rules (from DOCS/DECISIONS.md + REQUIREMENTS.md) - honor these in this edit; if this change conflicts with one, STOP and flag it:`n- " + ($lines -join "`n- ")

    $out = @{ hookSpecificOutput = @{
        hookEventName = 'PreToolUse'
        additionalContext = $ctx
    } }
    $out | ConvertTo-Json -Depth 6 -Compress
    exit 0
}
catch { exit 0 }
