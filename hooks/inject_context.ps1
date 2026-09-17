# inject_context.ps1
# Codex "SessionStart" hook (fires on: startup, resume, AND compact).
#
# THE COMPACTION FIX. When a session compacts, the model loses the earlier words. But
# SessionStart fires again with source=compact right after - so this hook RE-INJECTS the
# project "spine" (verified state + the catalog of decisions/requirements/failures) straight
# back into the model's view. The ground truth survives compaction, every time.
#
# Output is JSON with hookSpecificOutput.additionalContext - Codex adds it as developer context.
# On any error we emit nothing and exit 0, so a session is NEVER blocked by this hook.

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

    $docs = Join-Path $root 'DOCS'
    $parts = New-Object System.Collections.Generic.List[string]
    $parts.Add("=== PROJECT SPINE (auto-injected). These DOCS are authoritative; they win over your memory. Follow AGENTS.md. ===")

    $cs = Join-Path $docs 'CURRENT_STATE.md'
    if (Test-Path -LiteralPath $cs) {
        $parts.Add("`n--- CURRENT_STATE.md (verified-now truth) ---`n" + (Get-Content -LiteralPath $cs -Raw))
    }

    foreach ($f in @('DECISIONS.md','REQUIREMENTS.md','FAILURE_REGISTRY.md')) {
        $p = Join-Path $docs $f
        if (Test-Path -LiteralPath $p) {
            $heads = Select-String -LiteralPath $p -Pattern '^##\s+(DEC|REQ|FAIL)-\d' |
                     ForEach-Object { $_.Line }
            if ($heads) { $parts.Add("`n--- $f (catalog - open the file for detail) ---`n" + ($heads -join "`n")) }
        }
    }

    $parts.Add("`nIf unsure what the user said earlier, READ DOCS/_raw/user_messages.txt before answering - do not guess.")

    $ctx = ($parts -join "`n")
    $out = @{ hookSpecificOutput = @{ hookEventName = 'SessionStart'; additionalContext = $ctx } }
    $out | ConvertTo-Json -Depth 6 -Compress
    exit 0
}
catch { exit 0 }
