Set-Location (Join-Path $PSScriptRoot '..')
if (Test-Path '.local/processes.json') {
    $record = Get-Content '.local/processes.json' -Raw | ConvertFrom-Json
    Get-Process -Id $record.api,$record.worker -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,StartTime
}
& venv/Scripts/python.exe -m app.prototype.manage status
try { Invoke-RestMethod 'http://127.0.0.1:8000/health' | ConvertTo-Json } catch { Write-Output 'API is not running' }
