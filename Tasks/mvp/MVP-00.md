# MVP-00. Настоящий личный прототип без платного сервера

Статус: ⛔ BLOCKED (backend/local; см. журнал). Исполнитель: backend/fullstack. До покупки VPS и до боевых платежей. Независимо от полной production auth/referral интеграции; не объявляет остальные задания выполненными.

Прочитать [план прототипа](../../docs/backend/11-foreign-api-and-free-prototype.md) и [summary](../../docs/backend/summary.md).

## Сделать

1. Проверить фактический доступ владельца к Groq Free и большой текстовой модели, зафиксировать RPM/RPD/TPM/TPD, поддержку JSON/русского текста и условия географии. Ключ не помещать в browser bundle. Если недоступно, проверить допустимый OpenRouter :free; без подтверждения не обходить ограничения и не включать платный fallback.
2. Подключить локально реальную цепочку план→разделы→python-docx и сохранённый прогресс по правилам документа 10. Один job, bounded tokens, 429 Retry-After, checkpoint. Использовать собственные обезличенные темы.
3. Подготовить закрытый Render Free стенд: статическая Vite сборка и FastAPI на одном origin, временная PostgreSQL, executor в web-процессе, persistent jobs/steps. Для прототипа DOCX BYTEA до 5 МБ, максимум 20 файлов, export до истечения DB. tmp не источник истины. Начать с коротких текстов/малых разделов, измерить RAM.
4. Ограничить доступ владельцу, настоящие оплаты/публичную регистрацию выключить. Реальная AI генерация обязательна, оплата ЮKassa sandbox; тестовые бонусы вводить только отдельным test fixture/тестовым qualifying payment, production ручную раздачу не добавлять.
5. Проверить допустимость аккаунта/бесплатного плана Render и дату истечения free DB. Если недоступен — предоставить рабочий локальный прототип. Никаких автоматических покупок, paid upgrades и искусственного обхода sleep.

## Приёмка

3–5 настоящих полных работ, скачиваемый не sample DOCX, сохранённые checkpoints и реальный usage. В отчёте модель/провайдер/квоты/latency/качество, 429, restart, reload и sleep recovery. Процент не растёт при задержанном LLM, 100% только после файла. Отдельно указать, что free cloud не обеспечивает непрерывную фоновую работу и не предназначен для клиентов/ПД/боевых денег. Невозможность аккаунта/ключа честно зафиксировать; без ключа не называть fake ответ реальной проверкой. Для выполняющего агента допустим закрытый бесплатный deploy при доступной учётке/условиях; локального полного прохождения достаточно. Платный тариф/боевые деньги автоматически не включать.

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

**Что сделано:** 02.11.2026. Локальная цепочка backend и smoke/fixtures реализованы. Живой Groq/ЮKassa E2E не выполнен без ключей. Frontend/browser часть не закрыта.

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
