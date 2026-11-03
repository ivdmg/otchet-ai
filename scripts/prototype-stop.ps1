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
        # Windows venv python.exe is a launcher; its real Python child must also stop.
        $children = Get-CimInstance Win32_Process | Where-Object { $_.ParentProcessId -eq $processId -and $_.Name -eq 'python.exe' }
        foreach ($child in $children) {
            if ($child.CommandLine -notlike "*$expected*" -or $child.CommandLine -notlike "*$($record.python)*") {
                throw "Unexpected child of PID $processId; refusing to stop it"
            }
            Stop-Process -Id $child.ProcessId -ErrorAction SilentlyContinue
        }
        Stop-Process -Id $processId -ErrorAction SilentlyContinue
    }
}
Remove-Item -LiteralPath '.local/processes.json'
Write-Output 'Application stopped; PostgreSQL, jobs and documents preserved. Expired leases recover on next start.'
