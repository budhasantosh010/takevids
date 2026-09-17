# Project-local Codex UserPromptSubmit hook.
# Reads Codex's JSON event from stdin and appends the user prompt word-for-word.

$ErrorActionPreference = 'Stop'

function Find-ProjectRoot {
    param([string]$StartPath)

    if ([string]::IsNullOrWhiteSpace($StartPath)) {
        $StartPath = (Get-Location).Path
    }

    $current = [System.IO.Path]::GetFullPath($StartPath)
    while ($true) {
        $agents = Join-Path $current 'AGENTS.md'
        $codex = Join-Path $current '.codex'
        if ((Test-Path -LiteralPath $agents) -and (Test-Path -LiteralPath $codex)) {
            return $current
        }

        $parent = Split-Path -Path $current -Parent
        if ([string]::IsNullOrWhiteSpace($parent) -or $parent -eq $current) {
            return $null
        }
        $current = $parent
    }
}

function Get-TextValue {
    param($Value)

    if ($null -eq $Value) { return $null }
    if ($Value -is [string]) { return [string]$Value }
    if ($Value.PSObject.Properties.Name -contains 'content') {
        return Get-TextValue $Value.content
    }
    if ($Value -is [System.Collections.IEnumerable]) {
        $parts = foreach ($item in $Value) {
            $text = Get-TextValue $item
            if (-not [string]::IsNullOrWhiteSpace($text)) { $text }
        }
        if ($parts) { return ($parts -join "`n") }
    }
    return $null
}

try {
    $raw = [Console]::In.ReadToEnd()
    $data = $null
    if (-not [string]::IsNullOrWhiteSpace($raw)) {
        try { $data = $raw | ConvertFrom-Json } catch { $data = $null }
    }

    $prompt = $null
    if ($data) {
        foreach ($name in @('prompt', 'user_prompt', 'input', 'message')) {
            if ($data.PSObject.Properties.Name -contains $name) {
                $prompt = Get-TextValue $data.$name
                if (-not [string]::IsNullOrWhiteSpace($prompt)) { break }
            }
        }
    }
    if ([string]::IsNullOrWhiteSpace($prompt)) { $prompt = $raw }
    if ([string]::IsNullOrWhiteSpace($prompt)) { exit 0 }

    $startPath = $null
    if ($data -and ($data.PSObject.Properties.Name -contains 'cwd')) {
        $startPath = [string]$data.cwd
    }
    $root = Find-ProjectRoot $startPath
    if (-not $root) { $root = Find-ProjectRoot (Get-Location).Path }
    if (-not $root) { throw 'Could not locate project root containing AGENTS.md and .codex.' }

    $rawDir = Join-Path $root 'DOCS\_raw'
    [System.IO.Directory]::CreateDirectory($rawDir) | Out-Null
    $logFile = Join-Path $rawDir 'user_messages.txt'

    $stamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss K'
    $thread = if ($data -and ($data.PSObject.Properties.Name -contains 'thread_id')) {
        [string]$data.thread_id
    } elseif ($data -and ($data.PSObject.Properties.Name -contains 'session_id')) {
        [string]$data.session_id
    } else {
        'unknown'
    }

    # Running message NUMBER: count existing headers + 1, so decisions can cite which message.
    $msgNum = 1
    if (Test-Path -LiteralPath $logFile) {
        $existing = Select-String -LiteralPath $logFile -Pattern '^===== \[' -AllMatches
        $msgNum = (@($existing).Count) + 1
    }

    $entry = "`r`n===== [$stamp] thread=$thread msg=$msgNum =====`r`n$prompt`r`n"
    [System.IO.File]::AppendAllText($logFile, $entry, [System.Text.UTF8Encoding]::new($false))
    exit 0
}
catch {
    [Console]::Error.WriteLine("Codex prompt logger failed: $($_.Exception.Message)")
    exit 1
}

