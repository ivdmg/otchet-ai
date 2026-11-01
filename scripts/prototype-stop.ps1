$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if (-not (Test-Path '.local/processes.json')) { Write-Output 'No recorded application processes'; exit 0 }
$record = Get-Content '.local/processes.json' -Raw | ConvertFrom-Json
foreach ($kind in @('api','worker')) {
    $processId = $record.$kind
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$processId" -ErrorAction SilentlyContinue
    if ($processInfo) {
        $expected = if ($kind -eq 'api') { 'uvicorn app.main:app' } else { 'app.prototype.worker' }
        if ($processInfo.CommandLine -notlike "*$expected*" -or $processInfo.ExecutablePath -ne $record.python) {
            throw "PID $processId no longer belongs to this prototype; refusing to stop it"
        }
        Stop-Process -Id $processId
    }
}
Remove-Item -LiteralPath '.local/processes.json'
Write-Output 'Application stopped; PostgreSQL, jobs and documents preserved. Expired leases recover on next start.'
