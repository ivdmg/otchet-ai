$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$py = (Resolve-Path 'venv/Scripts/python.exe').Path
$pidFile = Join-Path $PWD '.local/processes.json'
if (Test-Path $pidFile) { throw 'Process record exists. Run prototype-status.ps1 / prototype-stop.ps1 first.' }
if (Get-NetTCPConnection -State Listen -LocalPort 8000 -ErrorAction SilentlyContinue) { throw 'Port 8000 is occupied; no process was changed.' }
$api = Start-Process -FilePath $py -ArgumentList @('-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8000','--no-access-log') -WorkingDirectory $PWD -WindowStyle Hidden -PassThru -RedirectStandardOutput "$PWD/.local/api.out.log" -RedirectStandardError "$PWD/.local/api.err.log"
$worker = Start-Process -FilePath $py -ArgumentList @('-m','app.prototype.worker') -WorkingDirectory $PWD -WindowStyle Hidden -PassThru -RedirectStandardOutput "$PWD/.local/worker.out.log" -RedirectStandardError "$PWD/.local/worker.err.log"
@{ api = $api.Id; worker = $worker.Id; python = $py } | ConvertTo-Json | Set-Content $pidFile
Write-Output 'API: http://127.0.0.1:8000; one durable worker started. Private process records: .local/processes.json'
