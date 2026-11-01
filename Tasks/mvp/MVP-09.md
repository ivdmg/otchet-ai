# MVP-09. Рефералка и оплата бонусными кредитами

Статус: ⛔ BLOCKED (backend/local; см. журнал). Исполнитель: backend + frontend с согласованным контрактом. Зависимости backend: MVP-01, MVP-03, денежный контракт MVP-04; UI: MVP-05/06. Выполняется до MVP-08 и первых продаж, не отложено на рост.

Основная спецификация — [рефералка](../../docs/backend/10-referrals-and-progress.md) и [summary](../../docs/backend/summary.md).

## Backend

Случайный referral code/link, attribution cookie 30 дней, один inviter при регистрации, self-referral запрет. Четыре небольших сущности attribution/reward/bonus_account/bonus_entries, append-only операции и уникальные IDs. Pending после первой квалифицированной завершённой денежной покупки, available через 14 дней без спора; не за клики/регистрации/повторные/бонусные покупки. Reward=min(P/5,net_paid/5), integer hundredths, versioned terms/P.

Полная оплата рублями **или** кредитами, без смешивания и без покупки credits. В бонусном сценарии reserve+job атомарны, capture по настоящему DOCX, release на terminal fail. Возврат денежного заказа пересчитывает reward; поздняя отмена потраченного reward создаёт только bonus debt без денежных требований. Release при долге сначала гасит debt, остаток available. Банковский refund нельзя блокировать из-за рефералки. Никакой автоматической выдачи бонуса по непроверенному событию клиента.

## Frontend

Сохранить видимый баланс, личную ссылку/копирование, «приглашённые» и «покупатели», pending/available/history и понятное правило пяти стандартных покупателей. Удалить покупку/пополнение кредитов и демопрофиль/деморефералов. Не раскрывать темы/имена/email друзей без основания. На checkout выбор рублей/бонусов, при недостатке объяснить дефицит; после оплаты/резерва реальный order status. При ошибке показывать денежный refund либо возврат бонусов в зависимости от способа.

## Проверка

Пять разных покупателей по 300 ₽ → по 60 кредитов после задержки → бонусная работа за 300; до maturity эти деньги недоступны. Покупка 150 ₽ → 30, 500 ₽ → cap 60. Повторный webhook/worker не дублирует reward, два параллельных credit spend не уводят баланс в минус. Self-referral, подмена inviter, бонусная покупка, full/partial refund, late reversal spent reward, bonus debt + failed-job release, cancelled first purchase + next qualifying purchase, cancelled/failed job без новой оплаты. Общий IP не автоматический бан; подозрительное — ручной review. Протестировать на PostgreSQL с конкурентными операциями.

Правовой режим бонусов/условия/ПД-cookie и рекламных материалов проверить в MVP-07; шаблон не является заключением. Модель маленькая, не возрождать прежнюю систему покупки paid credit lots.

## Журнал автономного исполнения

Порядок и определения статусов: [EXECUTION-PLAN](../EXECUTION-PLAN.md). Заполнять в ходе реализации, не закрывать по одному наличию файлов.

| Часть | Статус |
|---|---|
| Backend / локальный или бесплатный прототип | ⛔ BLOCKED — backend; frontend не закрыт |
| Frontend / браузерная интеграция | ⛔ BLOCKED — реализация готова к live-проверке; нужны provider credentials |
| Production, реальные продажи/деньги | ⏭️ DEFERRED_PRODUCTION |

- [ ] Своя реализация соответствует актуальному summary и контракту.
- [ ] Приёмка своей части проверена; команды и результаты записаны ниже.
- [x] Живые external проверки отделены от unit mocks/sandbox и недоступных сценариев.
- [x] Инструкция/передача и индекс Tasks обновлены.

**Что сделано:** 02.11.2026. B3 bonus/referral backend реализован: first attribution, P/version, 14-day maturity/hold, append-only journal, atomic reserve/capture/release, reward cap/net paid, partial/full/late reversal/debt. PostgreSQL tests пяти qualifying test-double purchases и полной bonus job, concurrency, failure release — PASS. Пять настоящих sandbox purchases + Groq bonus job и frontend ещё не проверены.

**Проверки и результаты:** PostgreSQL 16: Alembic upgrade/check — успешно, no new upgrade operations; `venv/Scripts/python.exe -m pytest tests_prototype -q` — 33 passed; добавленные OS kill/recovery tests: `... -m pytest tests_prototype/test_kill_recovery.py -q` — 2 passed (всего 35 разных PostgreSQL проверок). `... -m pytest tests/docx_engine tests/test_ast_schemas.py -q` — 35 passed. Real HTTP auth smoke и реальный API/worker/PostgreSQL restart — PASS. Groq/ЮKassa в интеграционных тестах — явные test doubles, не live proof.

**Блокеры / что нужно от владельца:** Для live приёмки локально настроить GROQ_API_KEY, YUKASSA_SHOP_ID и test_* YUKASSA_SECRET_KEY; секреты в чат/Markdown не отправлять. Затем настоящие Groq plan/text/DOCX, sandbox pay/refund и пять qualifying first purchases → earned bonus job. Запрос владельцу сделан один раз; ключи отсутствуют. VPS/production-пакет/Render не блокируют local prototype.

**Передача:** [BACKEND-HANDOFF](../../docs/backend/BACKEND-HANDOFF.md), [API-CONTRACT](../../docs/backend/API-CONTRACT.md), [LOCAL-RUNBOOK](../../docs/backend/LOCAL-RUNBOOK.md), `docs/backend/openapi.json`.

**Следующий шаг:** Настроить env и пройти полный real-provider smoke; frontend подключает действующий Studio по контракту.

## Frontend F1–F4 — 02.11.2026

**Реализация:** действующий Studio подключён к cookie/CSRF API, серверным quote/plan/approve/order/job/library/download/referrals. Нет demo credit topup, client sample DOCX и timer progress. Локальный Vite proxy подставляет существующий private key сервером, браузер его не запрашивает; provider ключи не создавались. Для отдельного AI→DOCX подготовлен `app.prototype.live_ai`, требующий только Groq ключ, без платёжного обхода в публичном UI.

**Проверено:** typecheck/build PASS; PostgreSQL prototype suite 35 passed; runner tests отдельно 2 passed (явные provider doubles); real HTTP auth smoke PASS; browser register/verify/login/logout/relogin, сохранение формы/reload, API price/referral/empty library, честный groq_key_missing; mobile 390×844. Это не live AI/payment/refund/referral acceptance.

**Блокер приёмки:** пользователь добавит GROQ_API_KEY позже. Ключ не запрашивается повторно. Test checkout/refund/пять qualifying purchases требуют отдельно test ЮKassa. Все доступные независимые frontend-работы выполнены; исходная полная приёмка остаётся открыта.

**Передача:** [FRONTEND-HANDOFF](../../docs/backend/FRONTEND-HANDOFF.md) — точные команды, ограничения и доказательства. Совместные задания полностью не закрыты. Production ⏭️ DEFERRED_PRODUCTION.

## Актуальное уточнение владельца и проверка — 02.11.2026

Владелец предоставил Groq ключ и разрешил **имитацию оплаты** до получения ЮKassa, попросив экономить квоту и вернуть основной UI. Ключ установлен только в игнорируемый backend .env. Упрощённая техническая форма убрана, действующие StudioWorkspace/ProductFlow используют исходные product layouts Studio. Выполнен один живой browser E2E: настоящий план→ручные правки/2 раздела→approve→явная mock-оплата→настоящий worker текст→скачанный/открытый DOCX→relogin/library/restart. Groq openai/gpt-oss-120b: **6 AI-вызовов, 5350 reported tokens**, план 4 s, текст 122 s с rate waits. Дополнительные live-работы не запускались.

**Проверки:** build/typecheck PASS; PostgreSQL suite **39 passed** с explicit external doubles; живое доказательство отдельно `docs/backend/evidence/live-generation.json`. Owner download/preview 200, другой пользователь document/download/preview 404. Скачанный DOCX bytes совпадает с серверным, checkpoint paragraphs присутствуют. Повторные чтения/перезапуск не расходовали новые AI tokens.

**Граница:** MOCK_PAYMENTS=true не означает реальную sandbox покупку/возврат. simulated_no_charge не квалифицирует referrals и не создаёт cash refunds; это покрыто новыми tests. ЮKassa/refund/пять покупателей/bonus live по-прежнему не приняты. Качество/библиография требуют ручного просмотра; 3–5 новых работ сознательно не выполнялись по ограничению владельца.

[Текущая передача и запуск](../../docs/backend/FRONTEND-HANDOFF.md). Предыдущие записи об отсутствующем Groq ключе — историческое состояние до его предоставления.
