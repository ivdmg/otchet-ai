# Фактический API закрытого личного прототипа

> Обновление требований 02.11.2026: единственный действующий план — [Tasks/PLAN.md](../../Tasks/PLAN.md). Три шага, временная выдача Word/PDF, готовые работы только metadata, mock-оплата после плана и кэшбэк. Этот документ описывает предыдущие решения/реализацию; при конфликте следовать новому плану. Утверждённый дизайн сохранён коммитом 47d6837.


Передача backend, 02.11.2026. Entry point: `app.main:app` → `app/prototype/api.py`. Старые `app/api/v1` routers НЕ подключены. Base URL локально `http://127.0.0.1:8000`, prefix `/api/v1`. Frontend остаётся корневым Vite `src/redesign/Studio.tsx`.

Это sandbox, 300 ₽ / 300 credits за короткую обезличенную тестовую работу. Не тариф для продаж. Российских LLM и платного fallback нет. Проверки API/БД выполнены; живой Groq и ЮKassa требуют ключей и ещё НЕ приняты.

## Доступ, сессия и ошибки

На всех путях, кроме `/health` и webhook, передавать `X-Prototype-Key`: локальный ключ владельца из `.env`. Не вшивать его в публичную сборку. Это отдельный ключ доступа к закрытому стенду, НЕ Groq/ЮKassa secret. В текущем личном запуске Vite proxy подставляет существующий ключ только сервером; UI его не запрашивает. Прямые API-клиенты передают заголовок сами. Provider keys никогда не передаются браузеру.

`fetch(..., {credentials:'include', headers:{'X-Prototype-Key': ownerKey}})`. Не смешивать `localhost` и `127.0.0.1` для frontend/backend. Cookie `gd_session`: HttpOnly, SameSite=Strict, срок 7 суток, отзывается logout/reset. В локальном HTTP `COOKIE_SECURE=false`. Заголовок `X-CSRF-Token` обязателен для authenticated POST/PUT/DELETE; значение выдаётся login и GET me. После reload получить его через me. Изменяющие auth-запросы до входа защищены private gate и проверкой Origin. Разрешённые origin перечислены в `ORIGINS`; посторонний Origin получает 403. Production mode запрещён конфигурацией.

Ответ ошибки: `{"detail":"safe_machine_code"}`. Ошибки provider adapter дополнительно содержат `retryable`, `retry_after` (секунды). 401 — нет/истекла сессия; 403 — private key, Origin, CSRF или email verification; 404 — отсутствует либо чужой объект; 409 — конфликт состояния/недостаток бонусов; 422 — валидация; 429 — лимит; 503 — ключ, provider или integrity error. Pydantic validation `detail` может быть массивом: не предполагать всегда строку. Не показывать traceback/сырые provider payload.

## Auth и referral attribution

| Метод / путь | JSON вход | Результат |
|---|---|---|
| POST `/auth/register` | `email`, `password` (12–128 символов), необязательный `referral_code` | 201: `id,email,verified,referral_code,mail_mode` |
| POST `/auth/verify` | `token` | `verified:true`, одноразовый token, TTL 1 час |
| POST `/auth/login` | `email,password` | `user:{id,email,verified,referral_code},csrf_token` + cookie |
| GET `/auth/me` | — | тот же user и текущий csrf_token |
| POST `/auth/logout` | — | `logged_out:true`, cookie/session удалены |
| POST `/auth/reset-request` | `email` | всегда `accepted:true,mail_mode:private_local_sink` |
| POST `/auth/reset` | `token,password` | `reset:true,login_required:true`, все сессии отозваны |
| GET `/referrals/capture/{code}` | — | `captured:true`, первый referral cookie на 30 дней |

Email подтверждается локальным приватным mail sink, реальная почта не отправляется. Нельзя показывать пользователю фиктивное «письмо отправлено». Token отсутствует в API-ответе/логах; оператор читает локальный файл по runbook. Seed содержит только example.org аккаунты, 0 credits. При регистрации cookie приоритетнее явного referral_code; потом attribution неизменяем. Повтор capture не заменяет первый cookie.

## Каталог, draft, план, заказ

| Метод / путь | Вход / результат |
|---|---|
| GET `/catalog` | `mode:sandbox,price_kopecks:30000,bonus_hundredths:30000,currency:RUB,retention_days:90,types,max_sections:6,scope:short_personal_test,sources_automatically_verified:false,mail_mode` |
| POST `/quote` | Draft ниже → `price_kopecks:30000,bonus_hundredths:30000,campaign:sandbox-v1,storage_days:90` |
| POST `/documents` | Draft → 202 `document_id,job_id,status:planning`; план генерирует worker, не HTTP handler |
| PUT `/documents/{id}/plan` | `{"sections":["Теоретические основы","Практическое применение"]}` → `plan` |
| POST `/documents/{id}/approve` | без body → `approved_plan` (неизменяемый снимок) |
| DELETE `/documents/{id}` | архивировать только неоплаченный draft, отменить его plan job; `archived:true,ai_budget_not_refunded:true` |
| POST `/documents/{id}/orders` | `{"method":"cash"}` либо `{"method":"bonus"}` → 202 Order ниже |
| GET `/orders/{id}` | Order |

Draft: `{"topic":"Обезличенная учебная тема","doc_type":"abstract","anonymized":true}`. Типы `abstract|coursework|vkr`. Topic 8–400 символов. Контакты/URL/control characters отвергаются, но это не полноценный детектор ФИО: владелец обязан вводить только обезличенную тему. ФИО/email/title-page fields не принимаются и не отправляются Groq. Строки плана 3–160 символов, 2–6 уникальных разделов. Не передавать цену, баланс, inviter_id, worker state — лишние поля отвергаются.

План правится только при `plan_ready`; после approve и заказа менять нельзя. При изменении темы архивировать неоплаченный draft и создать новый; AI-бюджет старого не возвращается. Один первоначальный plan job на документ; resume его не создаёт заново. Два неоплаченных draft/user, до 5 планов/user/day, до 10/IP/hour, максимум 20 документов всего. Архивы входят в общий лимит 20: для сброса использовать отдельную `_test` БД, не удалять финансовые записи вручную.

Order: `id,document_id,method,state,amount_kopecks,sandbox:true,checkout_url,job_id,refunded_kopecks,receipt_status,refunds`. Refund item: `id,state,amount_kopecks,error,retry_at`. Денежные значения и бонусы — целые сотые, НЕ float. `checkout_url` сначала null: worker создаёт настоящий test checkout. Poll order каждые 2–5 сек, затем перенаправить на этот URL. Кнопка возврата checkout ничего не подтверждает. Статус только из backend. Одно document_id → один order; повтор того же method возвращает существующий; смена method после создания — 409. После cancel не выставлять новую оплату на тот же документ: создать новый draft.

`cash`: `checking_payment → queued → completed` или `cancelled/payment_attention/refund_pending/refund_attention/refunded/partially_refunded`.
`bonus`: reserve + job в одной transaction; `queued → completed` (capture) либо `bonus_released` (terminal failure). Недостаток или debt → 409 `insufficient_bonus_or_debt`, никакой частичной оплаты/заказа не остаётся. Для UI основное состояние генерации брать из Job; Order может оставаться queued до готовности.

Перед новым заказом резервируется token budget. Модель и budget сохраняются в заказе/job. Нет ключа Groq → 503 `groq_key_missing`; нет test credentials → 503 `yukassa_test_credentials_required`. Не заменять такие ошибки клиентским sample.

## Jobs, прогресс, библиотека и файл

| Метод / путь | Результат |
|---|---|
| GET `/jobs/{id}` | Job snapshot |
| GET `/documents` | `{"items":[Document,...]}` только собственные работы |
| GET `/documents/{id}` | Document |
| GET `/documents/{id}/download` | DOCX binary; owner/cookie/private key обязательны |

Job: `id,document_id,order_id,kind:plan|document,provider:groq,model,status,stage,current_section,completed_units,total_units,percent,heartbeat,retry_at,error,attempts,tokens`. Tokens: `reported,charged_conservative,budget`. Все timestamps — Unix seconds UTC. `status=queued|running|retry|completed|failed|cancelled`. `heartbeat` обновляется при сохранении/claim; внешняя AI-попытка имеет timeout 55 сек, lease 180 сек. `attempts` — неуспешные попытки текущего шага, не оценка оставшегося времени.

Пример snapshot: `{"kind":"document","status":"retry","stage":"section_1","current_section":"Практическое применение","completed_units":2,"total_units":7,"percent":42.5,"error":"ai_rate_limit","retry_at":1793568000}`. `current_section` — название следующего несохранённого шага, `stage` — последний взятый шаг. Основные разделы идут `section_0 ... section_N-1`. Номер раздела можно получить из stage и approved_plan. Веса: intro=5, sections=75/N, conclusion=5, bibliography=5, validation=5, docx=5. Процент не меняется по таймеру/heartbeat. Retry сохраняет checkpoints. Plan имеет отдельный progress 0/100 до оплаты. 100 генерационной работы возможны только после проверенного сохранённого DOCX. После истечения хранения нет download и state=expired; не интерпретировать старый job как новый активный.

Document: `id,topic,doc_type,state,plan,approved_plan,created,expires,order,jobs,download_url`. States `planning|plan_ready|approved|ordered|generating|completed|failed|archived|expired`. Download не вызывает LLM/пересборку. Для скачивания fetch blob с headers/credentials, затем object URL; обычный `<a>` не передаст X-Prototype-Key. Повторное скачивание возвращает тот же сохранённый файл. 90 дней после готовности; worker удаляет истёкший файл и текст checkpoints. Названия источников не равны их проверке: в DOCX и catalog прямо отмечена необходимость ручной проверки.

## Бонусы, платежи и refund

GET `/referrals`: `code,link,terms:sandbox-v1,standard_price_hundredths:30000,registered,qualified,maturation_days:14,available,reserved,debt,pending,held,remaining_to_standard,units:credit_hundredths,history`. `held` — подмножество pending, поставленное оператором на ручную проверку; такие награды не maturate до снятия hold. Доступ к законному refund не блокируется.
History item: `operation_id,kind,amount,created,available_delta,reserved_delta,debt_delta`. Темы, email, имена приглашённых не раскрываются. Делить суммы на 100 для UI. Один credit = 1 ₽. Reward = min(зафиксированный P/5, net_paid/5), округление вниз в сотых. Только первая завершённая денежная покупка нового приглашённого, pending на 14 дней. Пять покупок по 300 ₽ дают 5×60 = 300 credits; до maturity не тратятся. Partial/full refund уменьшает reward; поздний spent reversal даёт debt. Available никогда не отрицательный, debt блокирует новые бонусные заказы, release сначала погашает debt. Деньги за credits не выплачиваются.

POST `/payments/webhook` принимает provider event с `event` и `object.id`. Нет cookie-auth/private key: webhook не даёт привилегий, payload только инициирует authenticated GET к ЮKassa. Сверяются магазин, test=true, RUB, сумма, payment_id, metadata.order_id, paid и статус. Refund events тоже перепроверяются через API; merchant-dashboard refund пересчитывает бонусы. HMAC старой заглушки не используется. Повтор/out-of-order event не создаёт второй job/reward/refund. Reconciler worker восстанавливает payment без webhook и pending refunds. Через 23 часа неопределённого create без provider ID требуется операторская сверка, новый ключ не создаётся.

Refund запрашивает локальный оператор CLI, пользовательского публичного admin endpoint нет. Terminal failure автоматически создаёт refund intent или release. CLI/worker никогда не считают refund завершённым без provider status=succeeded. Ошибка/canceled → refund_attention либо pending с error/retry_at. Чеки: только фактическое receipt_registration от test provider либо not_requested_sandbox; фискальная интеграция production отложена.

## OpenAPI и проверка

`venv/Scripts/python.exe -m app.prototype.manage openapi` выгружает schema из работающего app в `docs/backend/openapi.json`. HTTP-вариант: GET `/api/v1/openapi.json` с X-Prototype-Key. JSON содержит точные paths/request schemas; подробные response shapes описаны выше (endpoint returns dictionaries). Swagger HTML также за private gate; для интерактивной работы нужен клиент, подставляющий этот заголовок.

`venv/Scripts/python.exe -m pytest tests_prototype -q` — PostgreSQL-only, отдельная `_test` DB, явные test doubles внешних ответов. `venv/Scripts/python.exe -m app.prototype.smoke --auth-only` — настоящий HTTP без вызова провайдеров. Полный smoke после ключей: см. LOCAL-RUNBOOK. Реальный provider E2E не выдавать за пройденный по этим unit/integration tests.

Адаптеры сверены с официальными [Groq OpenAI compatibility](https://console.groq.com/docs/openai), [Groq rate limits](https://console.groq.com/docs/rate-limits), [API ЮKassa](https://yookassa.ru/developers/api) и [webhook guide](https://yookassa.ru/developers/using-api/webhooks). Документация не подтверждает доступ конкретного аккаунта.

## Frontend integration correction — 02.11.2026

GET `/catalog` и POST `/quote` доступны до cookie-входа, но только с корректным X-Prototype-Key и разрешённым Origin. Они возвращают исключительно общий sandbox тариф/валидацию обезличенного ввода, не данные пользователя. Это нужно для цены формы до регистрации. Все documents/jobs/orders/referrals/download по-прежнему требуют сессию/owner checks; authenticated mutations — CSRF. Проверка: tests_prototype/test_auth.py::test_private_auth_csrf_reset_owner (включая wrong private key, hostile Origin, отсутствие сессии для документов/рефералки и чужой файл). OpenAPI обновлена из приложения.

Frontend использует same-origin Vite proxy `/api` → `127.0.0.1:8000`; открывать строго `http://127.0.0.1:5173`. PROTOTYPE_KEY читается локальным Vite server из существующего .env и подставляется только в proxy request; браузер не получает его. Cookie/CSRF восстанавливаются через me. Provider secrets не входят в bundle. В production static preview proxy не появляется: для личного теста использовать `npm run dev`, не `npm run preview`.

## Разрешённая владельцем локальная имитация — актуально 02.11.2026

После выдачи владельцем Groq ключа выполнена одна настоящая работа в основном UI. Ключ только backend .env. `MOCK_PAYMENTS=true` включён по прямому разрешению владельца из-за недоступной ЮKassa. Config default=false, production mode по-прежнему запрещён.

- Catalog добавляет `payment_mode: personal_mock|yukassa_test`. Order добавляет тот же discriminator.
- В personal_mock `POST /documents/{id}/orders {method:cash}` создаёт один существующий cash-shaped order с `receipt_status=simulated_no_charge`, без payment_id/checkout; сразу atomically enqueue настоящий worker job. Один document→один order/job сохраняется. Это НЕ verified cash purchase.
- Такие заказы исключены из qualify и не создают денежный refund при failed job; статус `test_failed`. Refund intent для simulated_no_charge отвергается. Реальные bonus/cash правила при flag=false сохранены.
- GET `/documents/{id}/preview` с cookie/private gate и owner check читает тот же сохранённый/проверенный DOCX, возвращает `{paragraphs:[{text,style}]}`. Повторное чтение не запускает LLM. Истёкший/отсутствующий файл 404, integrity 503, чужой документ 404. Таблицы/точная пагинация остаются в скачиваемом DOCX.

39 prototype tests PASS с explicit doubles; отдельное live доказательство 6 calls / 5350 tokens: `evidence/live-generation.json`. Mock payment не является доказательством sandbox ЮKassa/referral acceptance.
