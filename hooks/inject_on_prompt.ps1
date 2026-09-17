# inject_on_prompt.ps1
# Codex "UserPromptSubmit" hook.
#
# THE "did you remember what I said?" FIX. Fires on EVERY message you send. It injects the
# decisions/requirements catalog + a pointer to the raw transcript ALONGSIDE your prompt - so
# the answer to "remember the thing I said?" is already on screen, even after a compaction.
#
# This runs IN ADDITION to log_user_message.ps1 (which saves your words). This one only ADDS
# context for the model; it never blocks. On any error: emit nothing, exit 0.

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

    $reminder = "Reminder: the project DOCS are authoritative over your memory. If this message refers to something said earlier and you're unsure, READ DOCS/_raw/user_messages.txt instead of guessing."
    $ctx = if ($lines.Count -gt 0) {
        $reminder + "`nActive rules:`n- " + ($lines -join "`n- ")
    } else {
        $reminder
    }

    $out = @{ hookSpecificOutput = @{ hookEventName = 'UserPromptSubmit'; additionalContext = $ctx } }
    $out | ConvertTo-Json -Depth 6 -Compress
    exit 0
}
catch { exit 0 }
