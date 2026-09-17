$ErrorActionPreference = 'Stop'

$root = Split-Path -Path $PSScriptRoot -Parent
$required = @(
    'AGENTS.md',
    '.codex\config.toml',
    '.codex\hooks.json',
    '.gitignore',
    'hooks\log_user_message.ps1',
    'hooks\inject_context.ps1',
    'hooks\inject_on_prompt.ps1',
    'hooks\inject_decisions_preedit.ps1',
    'hooks\record_decision.ps1',
    'hooks\render_decision_tree.ps1',
    'hooks\rollback_to_decision.ps1',
    'hooks\recall.ps1',
    'hooks\goal_convergence.ps1',
    'hooks\index_semantic.ps1',
    'hooks\embed.py',
    'hooks\verify_project_setup.ps1',
    'hooks\verify_governance.ps1',
    'DOCS\INDEX.md',
    'DOCS\STARTUP_MESSAGE.md',
    'DOCS\BOOTSTRAP_PROMPT.md',
    'DOCS\CURRENT_STATE.md',
    'DOCS\HANDOVER_RUNBOOK.md',
    'DOCS\PROJECT_LOG.md',
    'DOCS\BUILD_TRACKER.md',
    'DOCS\REQUIREMENTS.md',
    'DOCS\DECISIONS.md',
    'DOCS\FAILURE_REGISTRY.md',
    'DOCS\CHANGE_POLICY.md',
    'DOCS\CHANGE_RECORD_TEMPLATE.md',
    'DOCS\ANTI_DRIFT_PROTOCOL.md',
    'DOCS\GIT_RUNBOOK.md',
    'DOCS\STATECHART.md',
    'DOCS\changes\README.md',
    'DOCS\plans\README.md',
    'DOCS\runs\README.md',
    'DOCS\_raw\user_messages.txt'
)

$failed = $false
foreach ($relative in $required) {
    if (Test-Path -LiteralPath (Join-Path $root $relative)) {
        Write-Host "[PASS] $relative"
    } else {
        Write-Host "[FAIL] $relative"
        $failed = $true
    }
}

try {
    Get-Content -LiteralPath (Join-Path $root '.codex\hooks.json') -Raw |
        ConvertFrom-Json | Out-Null
    Write-Host '[PASS] .codex/hooks.json is valid JSON'
} catch {
    Write-Host '[FAIL] .codex/hooks.json is invalid JSON'
    $failed = $true
}

$placeholders = Get-ChildItem -LiteralPath $root -File -Recurse |
    Where-Object { $_.Extension -in @('.md', '.toml', '.json', '.ps1') } |
    Select-String -Pattern '<PROJECT_NAME>|<PROJECT_ROOT>|<DATE>|<OWNER>' -List

if ($placeholders) {
    Write-Host '[WARN] Project placeholders remain:'
    $placeholders | ForEach-Object { Write-Host "       $($_.Path)" }
} else {
    Write-Host '[PASS] No standard placeholders remain'
}

Write-Host ''
Write-Host 'Manual integrated check: trust /hooks, send one prompt, and confirm one transcript entry.'

if ($failed) { exit 1 }
exit 0

