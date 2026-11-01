$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if (-not (Test-Path 'venv/Scripts/python.exe')) { python -m venv venv }
& venv/Scripts/python.exe -m pip install -r requirements-prototype.txt
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed' }
New-Item -ItemType Directory -Force '.local' | Out-Null
if (-not (Test-Path '.env')) {
    & venv/Scripts/python.exe -c "from pathlib import Path; import secrets; Path('.env').write_text('DATABASE_URL=postgresql+psycopg://gostdoc@127.0.0.1:55432/gostdoc_proto\nPROTOTYPE_KEY='+secrets.token_urlsafe(32)+'\nAPP_ENV=development\nGROQ_API_KEY=\nYUKASSA_SHOP_ID=\nYUKASSA_SECRET_KEY=\n',encoding='utf-8')"
}
$pgBin = 'C:/Program Files/PostgreSQL/16/bin'
$pgData = Join-Path $PWD '.local/pgdata'
if (-not (Test-Path (Join-Path $pgData 'PG_VERSION'))) {
    & "$pgBin/initdb.exe" -D $pgData -U gostdoc -A trust --encoding=UTF8 --locale=C
    if ($LASTEXITCODE -ne 0) { throw 'initdb failed' }
}
& "$pgBin/pg_ctl.exe" -D $pgData status
if ($LASTEXITCODE -ne 0) {
    & "$pgBin/pg_ctl.exe" -D $pgData -l "$PWD/.local/postgres.log" -o '-h 127.0.0.1 -p 55432' -w start
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL start failed' }
}
foreach ($dbName in @('gostdoc_proto','gostdoc_proto_test')) {
    $exists = & "$pgBin/psql.exe" -h 127.0.0.1 -p 55432 -U gostdoc -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$dbName'"
    if ($exists -ne '1') {
        & "$pgBin/createdb.exe" -h 127.0.0.1 -p 55432 -U gostdoc $dbName
        if ($LASTEXITCODE -ne 0) { throw 'Database creation failed' }
    }
}
& venv/Scripts/python.exe -m alembic upgrade head
if ($LASTEXITCODE -ne 0) { throw 'Migration failed' }
& venv/Scripts/python.exe -m app.prototype.manage status
