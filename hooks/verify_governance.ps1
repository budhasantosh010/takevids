$ErrorActionPreference = 'Stop'

$root = Split-Path -Path $PSScriptRoot -Parent
$checks = @(
    @{ File='AGENTS.md'; Text='DOCS/ANTI_DRIFT_PROTOCOL.md' },
    @{ File='AGENTS.md'; Text='three consecutive' },
    @{ File='DOCS\ANTI_DRIFT_PROTOCOL.md'; Text='Maximum active implementation scope' },
    @{ File='DOCS\ANTI_DRIFT_PROTOCOL.md'; Text='Context reload checkpoint' },
    @{ File='DOCS\ANTI_DRIFT_PROTOCOL.md'; Text='Evidence before continuation' },
    @{ File='DOCS\ANTI_DRIFT_PROTOCOL.md'; Text='Three-strike stop rule' },
    @{ File='DOCS\ANTI_DRIFT_PROTOCOL.md'; Text='No silent fallback' },
    @{ File='DOCS\CHANGE_POLICY.md'; Text='Requirement ID' },
    @{ File='DOCS\CHANGE_POLICY.md'; Text='one coherent change' },
    @{ File='DOCS\CHANGE_RECORD_TEMPLATE.md'; Text='Rollback' },
    @{ File='DOCS\REQUIREMENTS.md'; Text='Required evidence level' },
    @{ File='.gitignore'; Text='DOCS/_raw/user_messages.txt' }
)

$failed = $false
foreach ($check in $checks) {
    $path = Join-Path $root $check.File
    if ((Test-Path -LiteralPath $path) -and
        (Select-String -LiteralPath $path -SimpleMatch $check.Text -Quiet)) {
        Write-Host "[PASS] $($check.File) contains $($check.Text)"
    } else {
        Write-Host "[FAIL] $($check.File) missing $($check.Text)"
        $failed = $true
    }
}

if (Test-Path -LiteralPath (Join-Path $root '.git')) {
    Push-Location $root
    try {
        $remote = git remote
        if ($remote) {
            Write-Host "[WARN] Git remote configured: $remote"
        } else {
            Write-Host '[PASS] Git repository has no remote'
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Host '[WARN] Git has not been initialized yet'
}

if ($failed) { exit 1 }
exit 0

