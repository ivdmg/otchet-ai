# Локальный закрытый AI GostDoc

## Текущая эксплуатация Studio v2 — 02.11.2026

Этот раздел и API-CONTRACT.md заменяют исторические инструкции ниже. URL: http://127.0.0.1:5173/ . Запуск существующего PostgreSQL: `pg_ctl -D .local/pgdata -l .local/postgres.log -o "-h 127.0.0.1 -p 55432" -w start` из PostgreSQL16/bin. Затем `venv/Scripts/python.exe -m alembic upgrade head`, `./scripts/prototype-start.ps1`, `npm.cmd run dev`. Не выполнять initdb/reset поверх существующих данных. Stale process record обрабатывает prototype-stop.ps1 с проверкой PID/executable.

Проверки текущего контракта: `venv/Scripts/python.exe -m pytest tests_prototype/test_studio_v2.py tests_prototype/test_providers.py tests_prototype/test_auth.py -q`, `npm.cmd run typecheck`, `npm.cmd run build`. Legacy sections/300руб/90days не являются контрактом v2. Seed verified accounts имеют нулевой баланс; credentials только .local/private/seed-accounts.json. Секреты .env не выводить и не переносить в browser.

MOCK_PAYMENTS=true только private development/test. Не включать ЮKassa/production. Конвертер PDF_CONVERTER=word использует установленный Word2016: только generated DOCX, macros disabled, новый WINWORD PID, watchdog110s/512MiB, subprocess120s, файлы5/20MiB. Уже открытые документы владельца не трогаются. Опциональный SOFFICE требует отдельной приёмки. Word/PDF проходят hash/text/table/page verification.

Новые managed файлы .local/private/documents имеют TTL24h от completion; worker sweeper при каждом tick/старте, active jobs исключены. Terminal failure также24h. Metadata manifests: .local/private/review-2026-11-02; Downloads — пользовательские копии. Старые unmanaged данные/backup не удалять массово.

Новый `manage backup --directory NEW_DIR` сохраняет metadata.json/manifest.json без generated body/files/checkpoints. `manage restore-test --directory DIR --target-database NEW_restore_test` восстанавливает только в новую БД; active jobs требуют reconciliation, никакого автоматического списания. Legacy backup с body требует owner preview/срока удаления, старый restore отклоняется. Mock ledger не переносить в production.

`manage refund --order UUID --amount-kopecks N --operation-id UNIQUE` для mock фиксирует simulated refund без provider calls. `manage recover-converter --job UUID` разрешает повтор только converter/formatting неистёкшего mock PDF failure, сохраняет sections и simulated refund. `manage mature-seed` применяет test clock только к earned referral rewards, не выдаёт gift balance.

Внешний блокер текущей live-приёмки: Groq generation и GET /openai/v1/models возвращают HTTP403 «Access denied. Please check your network settings.». Ключ присутствует; не объявлять его невалидным/квоту исчерпанной без доказательств. Не менять сетевую безопасность и не включать платный fallback. Исторически проверены3→4 и10→11стр.;25/80 live и точное попадание в объём не приняты. После восстановления доступа повторить браузерный сценарий и длинные объёмы.

---

## Исторические инструкции (не применять при противоречии v2)

> Обновление требований 02.11.2026: единственный действующий план — [Tasks/PLAN.md](../../Tasks/PLAN.md). Три шага, временная выдача Word/PDF, готовые работы только metadata, mock-оплата после плана и кэшбэк. Этот документ описывает предыдущие решения/реализацию; при конфликте следовать новому плану. Утверждённый дизайн сохранён коммитом 47d6837.


02.11.2026. Рабочая папка `C:\Users\Ivan\Desktop\otchet ai`. Только обезличенный личный sandbox. Production/боевые ключи запрещены конфигурацией. Установленный PostgreSQL 16 используется отдельным кластером `.local/pgdata`, loopback `127.0.0.1:55432`, DB `gostdoc_proto`. Существующий Windows service/его базы не изменялись. Тестовая DB: `gostdoc_proto_test`.

## Подготовка и запуск в PowerShell

```powershell
Set-Location 'C:\Users\Ivan\Desktop\otchet ai'
./scripts/prototype-init.ps1
./scripts/prototype-start.ps1
./scripts/prototype-status.ps1
```

Init устанавливает `requirements-prototype.txt`, при отсутствии создаёт локальный .env с случайным PROTOTYPE_KEY, отдельный кластер/DB и выполняет Alembic. Существующий .env не перезаписывает. Путь PostgreSQL по умолчанию `C:/Program Files/PostgreSQL/16/bin`. Новый закрытый entrypoint `app.main:app`; Redis/Celery не нужны. API `http://127.0.0.1:8000`, frontend `http://127.0.0.1:5173` (запуск из корня `npm run dev -- --host 127.0.0.1`). Frontend подключён к закрытому API через Vite proxy. Открывать 127.0.0.1:5173; `npm run dev`. Существующий PROTOTYPE_KEY подставляется серверным Vite proxy; UI не просит дополнительный ключ. Форма хранится локально, библиотека/план/баланс — на сервере. См. FRONTEND-HANDOFF.md.

Два обычных терминала вместо background scripts:

```powershell
venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --no-access-log
venv/Scripts/python.exe -m app.prototype.worker
```

Один worker защищён PostgreSQL advisory lock; jobs имеют leases/fencing tokens. Не запускать старый Celery/API routers. Все процессы читают .env при старте. После изменения env остановить и запустить API/worker. Start script отказывается занимать чужой порт/перезаписывать process record; stop проверяет PID, executable и command line и не останавливает посторонние процессы.

```powershell
./scripts/prototype-stop.ps1
# PostgreSQL/все данные остаются; для полного остановa только этого кластера:
& 'C:/Program Files/PostgreSQL/16/bin/pg_ctl.exe' -D "$PWD/.local/pgdata" -m fast -w stop
# Повторный init поднимет этот кластер; существующие данные не удалит.
```

При аварии worker job возвращается после истечения 180-секундного lease. Сохранённые разделы/утверждённый план не генерируются повторно. Timeout неизвестного внешнего расхода учитывается консервативно. Pending payment/refund сверяются worker, а не браузером. Если process record остался после аварии, status/stop штатно уберёт его, проверив принадлежность PID.

## Env без значений секретов

Образец `.env.example`. Обязательны DATABASE_URL (postgresql+psycopg), случайный PROTOTYPE_KEY ≥32 символов, APP_ENV=development либо test. Для настоящих внешних запросов владелец один раз локально заполняет `GROQ_API_KEY`, `YUKASSA_SHOP_ID`, `YUKASSA_SECRET_KEY` тестового магазина (`test_*`), затем перезапускает процессы. В чат секреты не отправлять. На момент передачи ключей нет, live E2E блокирован. Наличие статуса true в manage status доказывает только конфигурацию, не доступ провайдера.

Настройки: `GROQ_MODEL=openai/gpt-oss-120b`, `RETURN_URL=http://127.0.0.1:5173/` (выбрать тот же hostname, что UI), `ORIGINS`, `COOKIE_SECURE=false` для локального HTTP, `STORAGE=disk|bytea`, `DATA_DIR=.local/private`, `DAILY_TOKENS=160000`, `TPM=7000`, `JOB_BUDGET=24000`, `MAX_DOCS=20`. Это лимиты всего приложения, не каждого пользователя. Один HTTP-вызов резервирует 3500 токенов, output ≤1200 (plan ≤700), 429 учитывает Retry-After. Из-за conservative accounting работа может остановиться по budget раньше фактической free quota; нет автоматического paid fallback. Дополнительный резерв admission препятствует началу новых покупок при исчерпании бюджета. Уже оплаченные задания ждут доступной execution quota, сохранённые шаги не бросаются.

По [публичным Groq limits](https://console.groq.com/docs/rate-limits) у gpt-oss-120b указаны 30 RPM / 1000 RPD / 8K TPM / 200K TPD; точный доступ/лимиты/география проверяются в кабинете владельца. Текущие фактические token/time/качество ещё не измерены без ключа. Модель сохраняется в job, бюджет/модель денежного заказа фиксируются до checkout.

## Почта и безопасные аккаунты

```powershell
venv/Scripts/python.exe -m app.prototype.manage seed
venv/Scripts/python.exe -m app.prototype.smoke --auth-only
```

Seed создаёт ровно 6 verified `proto-...@example.org` аккаунтов, один inviter и пять invited, **нулевые** балансы. Случайный пароль/IDs находятся только в приватном `.local/private/seed-accounts.json`; команда не печатает пароль. Файл игнорируется Git. Повтор seed не дублирует fixture. Это dev-fixture для личного теста, не публичная регистрация и не выдача credits. После очистки `_test` DB использовать новый DATA_DIR, чтобы не читать старый seed manifest.

Обычная регистрация требует verify, а reset отзывает все сессии. Реального SMTP нет. Для своего тестового аккаунта оператор узнаёт путь к письму:

```powershell
venv/Scripts/python.exe -m app.prototype.manage mail-path --email YOUR_TEST_EMAIL --kind verify
venv/Scripts/python.exe -m app.prototype.manage mail-path --email YOUR_TEST_EMAIL --kind reset
```

Прочитать указанный локальный файл самому и передать token только POST verify/reset, не в URL, чат или лог. Token одноразовый, срок 1 час. Это приватный mail sink, НЕ доказательство доставляемости реальных писем. Для UI должны быть честные инструкции локального теста.

## Настоящая генерация, оплата и пять рефералов

После настройки ключей и restart:

```powershell
venv/Scripts/python.exe -m app.prototype.smoke --account 1 --method cash --run-id first
```

Runner делает реальный HTTP login → draft → ждёт Groq plan → approve → order. Worker создаёт ЮKassa test redirect; checkout_url сохраняется только в `.local/private/smoke-1-first.json`. Открыть его вручную и пройти тестовую оплату в ЮKassa. Runner ждёт до 900 секунд, backend сам сверяет paid server-to-server. При истечении ожидания повторить ровно ту же команду: manifest восстанавливает документ/order, повторная покупка не создаётся. Не удалять manifest при неопределённом платеже. Другое `--run-id` создаёт новую работу, её AI-расход реален даже в free quota.

Платёж/файл считаются подтверждёнными только после успешного runner и записанных `jobs/tokens/docx` в manifest. Прямой LLM и настоящий sandbox checkout/refund не проверены на передаче. Скрипт с отсутствующим ключом честно завершается BLOCKED до генерации, не выдаёт пример за результат.

Повторить cash для account 2,3,4,5 (по одному новому покупателю). Все пять должны реально завершиться. Проверить account 0 referral snapshot: pending=30000 hundredths, available=0. Для ускорения 14 дней **только приватных seed-наград**:

```powershell
venv/Scripts/python.exe -m app.prototype.manage mature-seed
venv/Scripts/python.exe -m app.prototype.smoke --account 0 --method bonus --run-id earned
```

`mature-seed` не начисляет деньги/подарки: он применяет test clock только к уже заработанным pending rewards seed-inviter. В HTTP нет test-clock/grant endpoint. Производственный срок остаётся 14 дней. Для пяти полных работ может понадобиться несколько дней Groq free quota; не увеличивать лимиты выше разрешений кабинета и не подключать paid API без отдельного решения владельца.

Ручной test refund по существующему verified cash order:

```powershell
venv/Scripts/python.exe -m app.prototype.manage refund --order ORDER_UUID --amount-kopecks 30000 --operation-id personal-refund-unique-1
```

CLI создаёт intent. Worker создаёт refund у test provider и сверяет succeeded; смотреть GET order/refunds. Повтор с тем же operation-id безопасен. Технический terminal failure worker делает intent автоматически, bonus failure — release. Для реального отрицательного E2E нужен действительно оплаченный test order и зафиксированная ошибка AI, затем подтверждённый sandbox refund; mocks этого не доказывают. `payment_attention/refund_attention` требуют сверки владельца; не менять operation/idempotency key, чтобы «попробовать ещё раз» после неизвестного ответа. Спустя 23 часа неопределённого create без provider ID автоматический повтор запрещён; необходима проверка кабинета/поддержки.

Webhook можно подключить при наличии допустимой закрытой внешней ссылки на `/api/v1/payments/webhook`. Для локального стенда публичный tunnel не нужен: worker polling проверяет pending платежи и refunds. Refund из кабинета импортируется через проверенный refund webhook; без публичного webhook внешние ручные refunds нужно отдельно сверять владельцу. Не заявлять, что локальный стенд получает уведомления из интернета.

Подозрительную unmatured reward или открытый спор оператор может поставить на ручную проверку CLI `manage reward-review --invited-user USER_UUID --decision hold --operation-id UNIQUE_ID`; снять после проверки — `--decision release` с новым operation-id. Состояние held исключено из maturity, отражается в referral API/append-only history. Эта операция не блокирует банковский refund и не создаёт денежный долг. Автоматический импорт споров/антифрод из кабинета не реализован: на личном стенде это обязанность оператора.

## Данные, backup/restore и тесты

SQLAlchemy/Alembic gd_* tables в PostgreSQL. Документы `.local/private/documents`, временный файл публикуется os.replace, путь attempt-specific. Библиотека переживает API/worker/DB restart. Для BYTEA файл хранится в БД; лимит 5 МБ/документ, всего максимум 20 drafts/documents. После 90 дней worker удаляет исходный файл/текст checkpoints и выключает download. Истёкшие backup-копии оператор удаляет отдельно; шифрование/offsite и автоматический production-retention backup не реализованы.

Для согласованного local backup диск+БД остановить API/worker (не PostgreSQL), выбрать новую папку, выполнить backup, снова запустить приложение:

```powershell
./scripts/prototype-stop.ps1
venv/Scripts/python.exe -m app.prototype.manage backup --directory .local/backup-NEW_UNIQUE_NAME
./scripts/prototype-start.ps1
venv/Scripts/python.exe -m app.prototype.manage restore-test --directory .local/backup-NEW_UNIQUE_NAME --target-database gostdoc_manual_restore_test
```

Restore создаёт только **новую** DB с окончанием `_restore_test`, не перезаписывает существующую. Файлы копируются в DATA_DIR/restores/DB/documents, пути переназначаются только в восстановленной БД; проверяются SHA256/OpenXML каждого файла. Для чтения восстановленного приложения явно выбрать эту DB в отдельной конфигурации. Source DB не меняется. Команда backup сохраняет PostgreSQL dump и DOCX, но не секреты .env/mail/seed-пароль. Локальные snapshots приватные, не encrypted/offsite backup для клиентов.

```powershell
venv/Scripts/python.exe -m alembic upgrade head
venv/Scripts/python.exe -m alembic check
venv/Scripts/python.exe -m pytest tests_prototype -q
venv/Scripts/python.exe -m pytest tests/docx_engine tests/test_ast_schemas.py -q
venv/Scripts/python.exe -m app.prototype.manage openapi
```

Первый набор использует настоящую отдельную PostgreSQL `_test` DB, миграции/constraints/concurrency/backup, но **явные** test doubles Groq/ЮKassa. Конфигурация TEST_DATABASE_URL по умолчанию на 55432; суффикс `_test` обязателен. Fixture TRUNCATE только gd_* в test DB. Legacy suite auth/payments/Celery проверяет старый demo contract и не является приёмкой нового приложения; весь legacy suite не объявлен зелёным. Сохранённые DOCX/AST tests проверяются отдельно.

Reset только выбранных тестовых данных (публичного reset нет): в отдельном PowerShell временно установить DATABASE_URL с `_test` DB, затем `venv/Scripts/python.exe -m app.prototype.manage reset-test-db`, удалить env override после команды. Команда откажется сбрасывать обычную `gostdoc_proto`. Ничего рекурсивно не удалять и не делать DROP существующей пользовательской DB. Обычную рабочую библиотеку массово не сбрасывать.

## Render и production

Облако не развёртывалось: для ближайшей цели достаточно локального сценария. BYTEA adapter реализован и проверен; готовая конфигурация Render/executor внутри web-процесса не реализована и не нужна локальному запуску. Не запускать отдельный paid worker. Если позже выбирать Render Free, отдельно проверить аккаунт/географию, sleep/ephemeral disk, expiry DB и допустимость доступа, привязать executor к web lifecycle; автоматических paid upgrades нет. Production VPS, бизнес/касса/SMTP, юридический пакет, реальные клиенты/ПД, гарантия источников/антиплагиата — DEFERRED_PRODUCTION либо ручная проверка качества, не основание блокировать локальную реализацию.

Frontend return URL: `RETURN_URL=http://127.0.0.1:5173/`; не смешивать с localhost. После смены env перезапустить API/worker. Возврат из ЮKassa не подтверждает оплату: открыть «Мои работы», выбрать существующий заказ, дождаться server reconciliation.

## Подготовленная проверка после одного AI-ключа

Добавить только GROQ_API_KEY в существующий .env; новые ключи агент не создаёт. `./scripts/prototype-run.ps1 -RestartBackend` перечитает backend env. Owner-only настоящая AI-проверка без ЮKassa: `venv/Scripts/python.exe -m app.prototype.live_ai --run-id first`; выход `.local/private/live-ai/first/result.docx` и manifest рядом. Без ключа — exit 2 groq_key_missing, без sample. Повтор продолжает checkpoints; один процесс на run-id. Это не оплаченный E2E и не публичный checkout bypass. [Полная frontend передача](FRONTEND-HANDOFF.md).

## Текущее состояние после живой проверки — 02.11.2026

Groq ключ установлен владельцем, одна настоящая UI/worker работа завершена. Использовать основной http://127.0.0.1:5173/ , не отдельный стенд. Техническая упрощённая форма убрана, восстановлены product layouts Studio. Файл есть в библиотеке и Downloads.

В .env включён MOCK_PAYMENTS=true по прямому разрешению владельца: кнопка «Тестовая оплата» не списывает деньги, job настоящий. Имитация не начисляет referral reward и не требует ЮKassa. Чтобы перейти к ЮKassa sandbox, выключить MOCK_PAYMENTS и добавить test credentials; production по-прежнему запрещён. AI_MAX_ATTEMPTS=2 ограничивает автоматические внешние повторы для сохранения квоты; локальные rate-limit ожидания не расходуют вызовы.

6 live calls / 5350 tokens уже использованы на проверку, повторные live runners автоматически не запускать. Для ручных проб — «Новая работа»→тема→план→правки→approve→тестовая оплата→файл. Повторное скачивание/preview не расходует AI. Последний полный отчёт: FRONTEND-HANDOFF.md.
