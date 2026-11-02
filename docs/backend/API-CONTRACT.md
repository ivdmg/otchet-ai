# Studio API v2 — 02.11.2026

Продуктовый источник: Tasks/PLAN.md. UI http://127.0.0.1:5173/; API /api/v1 через Vite server-only private gate. Verified gd_session cookie, CSRF на mutations, Origin allowlist, owner checks, no-store. Не передавать prototype/API keys в bundle/URL.

## Каталог и ввод

GET /catalog: version, types с price (копейки), max_pages/default_pages, input/output/repair budgets, retention_hours24, front_matter_included=true.
POST /quote принимает Draft и возвращает server price/version/settings.
Draft: topic8..400, doc_type abstract|coursework|vkr, pages strict integer1..10/25/80, chapters2|3, subject<=200, notes<=4000, anonymized=true,input_version=personal-2026-11-v2. Цена19900/49000/139000; defaults10/25/60. Invalid input отклоняется до LLM.

## Черновик → план → заказ

POST /drafts сохраняет settings без LLM. POST /documents создаёт draft+plan job. POST /documents/{id}/generate-plan — единственный initial plan сохранённого draft. PostgreSQL counters:3/час,5/сутки/account и общий token/day admission cap. Ручные правки бесплатны.
PUT /documents/{id}/plan: {chapters:[{title,sections:[string]}]},2..3главы,1..4параграфа; инвалидирует approval. POST /documents/{id}/approve возвращает SHA256(settings+outline+catalog version) и price. DELETE /documents/{id} архивирует только unordered draft.
POST /documents/{id}/orders: {method:cash|bonus,approval_hash}. Stale409; atomic mock-confirm либо integer bonus reserve + один order/job; replay идемпотентен. После заказа inputs locked. Token preflight/admission до оплаты; LLM вне SQL-lock.
MOCK_PAYMENTS=true только закрытый development/test. cash_charged=false, receipt_status=simulated_no_charge, provider payment_id отсутствует. UI явно сообщает тестовую оплату. Нет topup/смешанной оплаты. Реальный адаптер сохранён, production deferred.
GET /orders/{id}: owner status/amount/refunds/payment_mode/job_id.

## Генерация и выдача

GET /jobs/{id}, GET /documents/{id}: safe status/progress/tokens/latency; не возвращают checkpoints/body. Job.units/targets/weights фиксируются до enqueue:5+70+5+5+5+5+5=100. Нет timer progress,100 только после verified Word+PDF.
Groq HTTPS openai/gpt-oss-120b, bounded input/output/retries. Resume сохраняет sections, не повторяет plan.
DOCX A4,TNR14,1.5,поля30/10/20/20; Word COM (или внутренний SOFFICE) конвертирует тот же текст. Проверяются hashes, кириллица, paragraphs/table cells и actual_pages.
GET /deliveries/{opaque_id}/pdf?inline=true — application/pdf inline; /docx и /pdf без inline — attachment. Cookie-auth без secrets в URL. Другой owner404; expiry410. TTL24h от completion; не удалять после первого скачивания.

## Metadata / retention

GET /documents: drafts=settings/plan; terminal items=название/тип/requested+actual pages/date/status, без AST/jobs/path/download/delivery. Legacy preview/download endpoints удалены. Library ready не имеет open/download actions.
Worker sweeper удаляет managed body/checkpoints/files после24h; active jobs исключены. Ledger сохраняется. Старые unmanaged данные не трогать автоматически.
Новые backups metadata-only JSON без generated files/checkpoints. Legacy body restore требует отдельного owner migration preview.

## Баланс

GET /referrals: available/reserved/debt/pending/history, integer hundredths;1credit=1рубль. Registration gifts/topup отсутствуют.
Cashback5% net cash/versioned unique operation, после двух файлов; bonus/error→0. Refund reverses cashback+referral; нехватка available→debt, release сначала гасит debt.
Новые attribution personal-mock-v2,P19900,min(P/5,net_paid/5),14дней pending. Старые frozen P/version сохранены. Один inviter/self-referral forbidden; работы друзей скрыты. Mock ledger не переносить в production.

## Приёмка и ограничения

429 limits/admission;409 stale/locked/insufficient;410 expired;503 sanitized provider code. Полный текст/секреты не логировать.
Исторический live:3→4стр.,10→11стр.;25/80 не подтверждены. Точность объёма и библиография требуют дальнейшей приёмки. 02.11.2026 новые Groq calls блокируются403: Access denied. Please check your network settings. Ключ присутствует; это не доказательство невалидного ключа.
