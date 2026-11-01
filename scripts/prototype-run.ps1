param([switch]$RestartBackend)
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if (!(Test-Path -LiteralPath '.env')) { throw 'Existing local .env is required; this script does not generate keys.' }
if ($RestartBackend -and (Test-Path -LiteralPath '.local/processes.json')) { & "$PSScriptRoot/prototype-stop.ps1" }
if (!(Test-Path -LiteralPath '.local/processes.json')) { & "$PSScriptRoot/prototype-start.ps1" }
if (Get-NetTCPConnection -State Listen -LocalPort 5173 -ErrorAction SilentlyContinue) {
    Write-Output 'Frontend port 5173 is already in use. The prototype URL is http://127.0.0.1:5173/ ; no process was stopped.'
} else { & npm.cmd run dev }
