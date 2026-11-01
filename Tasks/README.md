# Задачи: сначала настоящий личный прототип, затем платный MVP

Актуально на 01.11.2026: до 50 пользователей, ориентир 1000–3000 ₽ на первый месяц. Основная спецификация — [короткое summary](../docs/backend/summary.md). Статусы backend обновлены 02.11.2026; frontend подключён, live AI→DOCX проверена; реальные финансы ждут ЮKassa. До продаж MVP-09 обязателен; первым можно выполнить личный прототип MVP-00. Backend реализован в app/prototype; фактическая передача — docs/backend/BACKEND-HANDOFF.md.

## Ближайшая утверждённая цель

Довести до полного личного прохождения локально либо бесплатно: настоящий план/текст/DOCX, сохранение, прогресс, тестовая оплата и рефералка. Боевые деньги/production не нужны для этой приёмки. Следовать [плану исполнения](EXECUTION-PLAN.md): сначала backend, затем frontend.

Готовые промпты: [Backend](prompts/backend-agent.md), [Frontend](prompts/frontend-agent.md). Статусы и результаты обновлять в самих `mvp/MVP-*.md` и в таблице ниже. Локальные B1/B2-worker/B4 выполнены и проверены; live Groq/ЮKassa E2E ждёт env credentials. Production отдельно отложен.

| Задание | Backend prototype | Frontend prototype | Production |
|---|---|---|---|
| MVP-00 | ⛔ BLOCKED | ⛔ BLOCKED (live; код подключён) | ⏭️ Отложено |
| MVP-01 | ✅ DONE | — | ⏭️ Отложено |
| MVP-02 | ⛔ BLOCKED | — | ⏭️ Отложено |
| MVP-03 | ✅ DONE | — | ⏭️ Отложено |
| MVP-04 | ⛔ BLOCKED (sandbox) | — | ⏭️ Отложено |
| MVP-05 | — | ⛔ BLOCKED (live; код подключён) | ⏭️ Отложено |
| MVP-06 | — | ⛔ BLOCKED (live; код подключён) | ⏭️ Отложено |
| MVP-07 | ✅ DONE (local/free) | — | ⏭️ Отложено |
| MVP-08 | ⛔ BLOCKED | ⛔ BLOCKED (live; код подключён) | ⏭️ Отложено |
| MVP-09 | ⛔ BLOCKED | ⛔ BLOCKED (live; код подключён) | ⏭️ Отложено |

## Исходная декомпозиция

| Фаза | Задача | Исполнитель | Зависимости |
|---|---|---|---|
| 0 | [MVP-00: бесплатный настоящий прототип](mvp/MVP-00.md) | Fullstack/владелец | Допустимый API-ключ/аккаунт; отдельно от полного production |
| 1 | [MVP-01: основа, БД и вход](mvp/MVP-01.md) | Backend | — |
| 2 | [MVP-02: LLM, план и DOCX](mvp/MVP-02.md) | Backend | MVP-01 |
| 2 | [MVP-03: надёжный заказ и worker](mvp/MVP-03.md) | Backend | MVP-01, MVP-02 |
| 3 | [MVP-04: ЮKassa, чеки, возвраты](mvp/MVP-04.md) | Backend | MVP-01, MVP-03; юридическая часть MVP-07 |
| 3 | [MVP-05: форма, план, checkout](mvp/MVP-05.md) | Frontend | MVP-01, MVP-02; контракт MVP-04 |
| 4 | [MVP-06: статусы и библиотека](mvp/MVP-06.md) | Frontend | MVP-03, MVP-04, MVP-05 |
| 1–4 | [MVP-07: деплой, backup, правовой минимум](mvp/MVP-07.md) | Backend/владелец | Основа после MVP-01, завершение после MVP-04 |
| 3–4 | [MVP-09: рефералка и бонусная оплата](mvp/MVP-09.md) | Backend + Frontend | MVP-01, MVP-03/04; UI MVP-05/06 |
| 5 | [MVP-08: проверки и первые продажи](mvp/MVP-08.md) | Fullstack/владелец | MVP-01 — MVP-07, MVP-09; отчёт MVP-00 |

Передать агенту конкретный файл и summary. Каждый исполнитель реализует только свой объём, сохраняет существующий визуал, проверяет реальный сценарий и обновляет статус здесь/в задании. Контракты UI/backend согласовать до интеграции. Агентов автоматически не запускать.

## Основные решения

- Один заказ: рубли или реферальные кредиты. 1 кредит покрывает 1 ₽ цены. Пять квалифицированных стандартных покупателей дают стандартную работу; без покупки кредитов и смешанной оплаты.
- Зарубежная нейросеть по API: Groq Free для личного теста, DeepSeek Flash — кандидат для продаж; план и полная работа; форматирование DOCX своим существующим Python-кодом.
- Один VPS в РФ: API, PostgreSQL, один worker, закрытые файлы. Без обязательных Redis/Celery/S3 для файлов и PDF-конвертера.
- Повторы webhook/кликов не дублируют оплату/заказ; конечный технический сбой возвращает исходную денежную оплату или резерв бонусов по способу заказа.
- Нет подарочных полных работ без заработанных бонусов/промокодов, точечных правок, методичек, автоплатежей и планирования нагрузки на 1000 пользователей.
- HTTPS, owner checks, безопасный вход, backup, чеки/правовые обязанности и защита оплаты остаются обязательными.

## Прежние задания

22 файла BE-* в папках 00-foundation — 06-growth оставлены как справочный расширенный план и помечены SUPERSEDED для первого MVP. Не выполнять их следом за MVP-задачами и не считать обязательными зависимостями. При росте можно выбирать из них конкретные нужные части, предварительно сверяя актуальность. Подробные документы docs/backend тоже получили указатель приоритета summary.

Прогресс обязателен по сохранённым шагам pipeline: этап/раздел X из N, без процентов по таймеру и ложного ETA. [Документ 10](../docs/backend/10-referrals-and-progress.md) и [документ 11](../docs/backend/11-foreign-api-and-free-prototype.md) входят в контракт всех MVP-задач.

## Backend передача 02.11.2026

[Фактический отчёт/блокеры/frontend задачи](../docs/backend/BACKEND-HANDOFF.md), [API](../docs/backend/API-CONTRACT.md), [local runbook](../docs/backend/LOCAL-RUNBOOK.md). 35 разных PostgreSQL prototype tests (33 full-run + 2 OS kill tests), 35 DOCX/AST tests; real HTTP auth и real API/worker/PostgreSQL restart — PASS. Provider mocks не являются live proof. Нет GROQ_API_KEY и test credentials ЮKassa: настоящие plan/text/pay/refund/five-referral E2E не выполнены. Код/fixtures доступны, frontend реализация подключена, live-приёмка BLOCKED.

## Срочно: настоящая нейросеть, 02.11.2026

[MVP-10: бесплатная live AI → DOCX](mvp/MVP-10-LIVE-AI.md) — следующий приоритет backend, отдельно от работы frontend и подключения ЮKassa. Статус: ⛔ live BLOCKED — GROQ_API_KEY отсутствует; подготовку runner выполнять сейчас. [Фактическая проверка](../docs/backend/STATUS-2026-11-02.md): manage status подключился к PostgreSQL, ключей Groq/ЮKassa нет, jobs/orders пусты. Код Groq HTTPS adapter уже есть; gRPC не нужен. Настоящий AI smoke не должен ждать платёжного sandbox. Полные платёжные/referral E2E остаются отдельной приёмкой.

## Frontend передача 02.11.2026

[FRONTEND-HANDOFF](../docs/backend/FRONTEND-HANDOFF.md): F1 auth/form/price browser проверены; F2/F3 API integration реализована, live payment/generation/referral не приняты без ключей. Сборка/typecheck PASS, PostgreSQL 35 passed + standalone runner 2 passed, HTTP auth smoke PASS. Для отдельного настоящего AI→DOCX после добавления только Groq ключа: `venv/Scripts/python.exe -m app.prototype.live_ai --run-id first`. Никакие ключи не генерировались; private gate уже существовал и теперь подставляется локальным Vite server, не браузером.

## Текущий результат после ключа владельца — 02.11.2026

**MVP-10 live AI: ✅ DONE, одна настоящая работа.** Основной Studio UI восстановлен, техническая форма убрана. User-authorized local mock payment→настоящая Groq генерация→DOCX→library/relogin/restart проверены. **6 AI calls / 5350 tokens**, дальнейшие вызовы не делались. Build/typecheck PASS, **39 prototype tests passed**. [Актуальная передача](../docs/backend/FRONTEND-HANDOFF.md), [безопасное доказательство](../docs/backend/evidence/live-generation.json). Реальная ЮKassa/возврат/пять qualifying referrals остаются не приняты, общие задания по финансам не закрыты. Старые записи Groq key missing относятся к состоянию до предоставления ключа.
