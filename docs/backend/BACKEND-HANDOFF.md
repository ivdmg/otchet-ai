# Backend → frontend: AI GostDoc

> Обновление требований 02.11.2026: единственный действующий план — [Tasks/PLAN.md](../../Tasks/PLAN.md). Три шага, временная выдача Word/PDF, готовые работы только metadata, mock-оплата после плана и кэшбэк. Этот документ описывает предыдущие решения/реализацию; при конфликте следовать новому плану. Утверждённый дизайн сохранён коммитом 47d6837.


Передача 02.11.2026. Пользовательский frontend НЕ переделывался. Подключать текущий экспорт App → `src/redesign/Studio.tsx`, исходники в корневом `src`, не `frontend/`. Локальная реализация B1–B4 и независимые проверки выполнены; полноценный живой личный сценарий пока **BLOCKED ключами**, а не VPS/production-юридическим пакетом.

## Что работает

- `app.main:app` подключает только новый `app/prototype` контур FastAPI/SQLAlchemy. Сохранены старые исходники и полезные DOCX handlers/page setup/compiler, чужое не удалялось. Legacy demo/topup/public WS/Celery routers не смонтированы; известный default JWT secret удалён.
- Настоящий постоянный PostgreSQL 16 на loopback 55432, отдельный кластер `.local/pgdata`; gd_* миграции Alembic, foreign keys/unique/check constraints и immutable ledger trigger. Redis/Celery/S3 не нужны.
- Закрытый owner-key gate, cookie sessions, scrypt, CSRF/Origin, verification/reset/logout, приватный dev mail sink, rate limits, owner checks документов/jobs/orders/download. Seed — шесть обезличенных example.org аккаунтов с нулевым бонусным балансом.
- Настоящий Groq HTTP adapter с JSON validation, bounded output, timeout/429/Retry-After, суточным admission/execution budget и консервативным неизвестным расходом. Ни canned output, ни платного/российского fallback в рабочем контуре нет. Plan async; ручной edit/approve; immutable approved snapshot.
- Один durable worker, leases/fencing, один job/order, сохранённые отдельные шаги, process restart recovery; 5/75/5/5/5/5 progress по checkpoints. DOCX собирается из сохранённого текста существующим движком, повторно открывается/проверяется, сохраняется до completed. Disk и временный BYTEA adapters, 5 МБ/20 документов, 90 дней download/worker cleanup.
- ЮKassa test adapter: Basic-auth create/get/refund, стабильные idempotency keys, server-to-server verification магазина/test/RUB/суммы/order metadata/paid; pending reconciliation без webhook. Refund сохраняется как intent, terminal cash fail → refund, bonus fail → release. Больше 23 часов неизвестного create без provider ID → ручная сверка; нет нового ключа/двойного списания.
- Referral attribution first cookie/registration, fixed P/version, reward=min(P/5,net_paid/5), 14 дней, pending/held/available, append-only journal, reserve/capture/release в одной transaction с job/result; partial/full/late refunds, bonus debt. Закрытый CLI test clock только для earned seed rewards, HTTP grant endpoint отсутствует. Ручной hold/release спорной pending reward; автоматического dispute feed нет.
- Воспроизводимые startup/status/stop, seed, HTTP smoke с приватным resume manifest, OpenAPI export, локальный pg_dump + restore в новую DB с проверкой DOCX.

## Проверено фактически

| Команда / сценарий | Доказанный результат | Граница |
|---|---|---|
| `venv/Scripts/python.exe -m alembic upgrade head` + `... -m alembic check` | PostgreSQL migrations применены; no new upgrade operations | Не SQLite/create_all |
| `venv/Scripts/python.exe -m pytest tests_prototype -q` | 33 passed на полном финальном прогоне | Groq/ЮKassa — явные test doubles, не live proof |
| `... -m pytest tests_prototype/test_kill_recovery.py -q` | 2 passed: реальные OS kill до checkpoint и после записи DOCX до DB commit → recovery без второго job | Вместе 35 различных PG prototype tests; review hold/release входит в полный прогон |
| `... -m pytest tests/docx_engine tests/test_ast_schemas.py -q` | 35 passed | Полезные старые DOCX/AST tests сохранены; весь старый demo suite не проверен как новый контракт |
| `... -m app.prototype.smoke --auth-only` | PASS реального HTTP login/me/catalog/referrals/logout | Без provider calls |
| `... -m app.prototype.smoke --wait-seconds 1` | BLOCKED: GROQ_API_KEY отсутствует | Никакой sample generation |
| Real API/worker/PostgreSQL restart | PASS: та же cookie session и library snapshot после полного restart | `.local/restart-proof.json`; библиотека operational DB содержит только seed accounts, AI-работ без ключа нет |
| PostgreSQL backup/restore integration | PASS: новая изолированная restore DB, сохранённый hash и открытие содержимого DOCX | Текст явного TestAI, не живой Groq; private local backup, не production offsite/encrypted |

Покрыты A/B isolation, CSRF/Origin, verify/reset/revocation, no welcome credits, immutable attribution/ledger/negative balance constraints, parallel spend и concurrent checkout/payment confirmation, duplicate/out-of-order verification, lost webhook, wrong amount/merchant/test flag, AI timeouts/429/truncation, budget refusal, сохранённый intro после запуска нового worker process, fencing старого lease, кириллица/таблица/поля DOCX, expiry cleanup, cash terminal refund pending/confirmed через adapter test double, refund timeout и неизвестный create + webhook, пять qualifying purchases → maturity test clock → полный bonus job, failure release, cap/partial/full/late reversal/debt/следующая qualifying purchase после full refund, refund до завершения генерации. Старое описание исходного аудита остаётся историческим, не текущим API.

Все проверки извлекают/сравнивают содержимое DOCX через python-docx/OpenXML. Визуальная приёмка в Word/LibreOffice, качество настоящего русского текста, корректность/актуальность библиографии, реальная длительность/usage/квоты и 3–5 полных Groq работ **не выполнены** без ключа и ручного review.

## Точные внешние блокеры

1. В локальном `.env` отсутствует `GROQ_API_KEY`: требуется разрешённый владельцу Groq Free аккаунт/ключ и фактический live request. Модель по умолчанию `openai/gpt-oss-120b`. Проверить доступ/географию/кабинетные лимиты; paid fallback не включать.
2. Отсутствуют `YUKASSA_SHOP_ID` + `YUKASSA_SECRET_KEY` test_*: требуются test shop и настоящие sandbox successful payment + refund. Adapter/unit mocks этого не заменяют.
3. После ключей пройти полный smoke, пять разных реальных test purchases, mature-seed и credit-funded job; приложить приватные manifests/usage/время, review качества и реального DOCX. До этого MVP-00/02/04/08/09 external acceptance остаётся BLOCKED.

Владелец уже один раз получил безопасный запрос настроить env локально, без секретов в чат. Поиск секретов вне workspace не выполнялся. Обычные аккаунты/клиентские ФИО/email за границу не отправляются: тест только обезличенный. Render не использован и не нужен для локальной приёмки; отсутствие доступа к нему не блокер. Production payments/касса/юридический допуск/настоящая почта/offsite backup/VPS отдельно DEFERRED_PRODUCTION.

## Порядок подключения frontend

1. Следовать [API-CONTRACT](API-CONTRACT.md) и `openapi.json`; убрать привязку к старому JWT/demo API. Login/cookie/CSRF/private owner key, честные mail-sink verify/reset; форма переживает вход. Ключ доступа владелец вводит локально, Groq/ЮKassa secrets в браузер не попадают.
2. Catalog/quote → POST documents → poll plan job → PUT plan → approve. Отказаться от локального timer/sample плана. При смене темы архивировать unpaid draft и создать новый. После order входные данные заблокированы.
3. Cash|bonus через один server order. Cash order сначала checking_payment, checkout_url появляется после worker; poll и открыть hosted URL. Return URL не подтверждает оплату. Не создавать повторный order, пока старый uncertain.
4. Poll jobs раз в 2–5 сек: сохранённый percent/stage/current_section/units/heartbeat/retry/error; без собственного увеличения процентов/ETA. Загрузка GET documents восстанавливает весь сценарий после reload/relogin.
5. Library и fetch-blob download с headers/credentials; убрать client-side example DOCX/PDF и неподключённые uploads/spot regeneration/topup/welcome gifts. Оставить текущий визуал.
6. Referrals: link/capture cookie, actual registered/qualified, pending/held/available/reserved/debt/history; делить hundredths на 100, без тем/имен друзей. Объяснить 5×60=300 только для стандартных первых cash purchases, maturation 14 дней. Bonus недостаток/debt — честная ошибка/дефицит, никакой смешанной оплаты.
7. Failure UI по method: refund_pending/refunded/refund_attention для cash либо bonus_released; показать order ID. Browser E2E на ключах/реальном sandbox ещё требуется; frontend задания MVP-05/06 и совместные строки не закрыты backend-агентом.

## Запуск сейчас

API после проверки оставлен запущенным на `http://127.0.0.1:8000`, один worker активен. Управление `scripts/prototype-status.ps1`, `prototype-stop.ps1`, `prototype-start.ps1`. Подробные команды/fixtures/restore/ограничения в [LOCAL-RUNBOOK](LOCAL-RUNBOOK.md). Schema из app: `venv/Scripts/python.exe -m app.prototype.manage openapi`; private HTTP GET `/api/v1/openapi.json`.

Изменения намеренно не коммитились и чужие untracked исходники не удалялись. `.local/`, секреты .env, пароли/письма/реальные DOCX игнорируются; исключения .gitignore теперь позволяют учитывать Tasks и docs/backend Markdown. Код backend по исходному status был untracked: при будущем commit добавлять нужные файлы адресно, не полагаться только на git diff.

## Frontend дополнение 02.11.2026

Studio подключён к API: см. [FRONTEND-HANDOFF](FRONTEND-HANDOFF.md). Минимальная коррекция backend: catalog/quote доступны с private key до cookie-входа для отображения цены; данные пользователей по-прежнему защищены сессиями/owner/CSRF. OpenAPI обновлена, auth regression проверен. Browser real-provider сценарии всё ещё требуют Groq и тестовой ЮKassa.

Owner AI runner подготовлен без зависимости от ЮKassa: `python -m app.prototype.live_ai --run-id first`; private checkpoints/manifest/DOCX, 2 tests с явными doubles PASS; live всё ещё ждёт ключ владельца. В текущем Vite запуске private key подставляет server proxy (loopback), пользователь не вводит второй ключ.

## Live результат после ключа — 02.11.2026

Прежний Groq-key blocker снят. Пользовательский основной Studio UI→план→правки→approve→разрешённая пользователем mock-оплата→реальный worker→DOCX→relogin/restart/library проверен. 6 вызовов, 5350 токенов; файл скачан и проверен по bytes/checkpoint text. Техническая форма заменена исходными компоновками Studio. 39 prototype tests PASS, build/typecheck PASS, чужой реальный документ/download/preview возвращает 404. API catalog/order payment_mode добавлен; preview endpoint читает реальный DOCX, не LLM. `MOCK_PAYMENTS` default=false, локально true; simulated_no_charge не qualify и не создаёт cash refunds. ЮKassa sandbox/реальные refunds/referrals остаются не приняты. Текущая передача: FRONTEND-HANDOFF.md; безопасное доказательство: evidence/live-generation.json.
