# MVP-08. Проверить и запустить первые продажи

Статус: ⛔ BLOCKED (backend/local; см. журнал). Исполнитель: release. Зависимости: MVP-01 — MVP-07, MVP-09; отчёт MVP-00.

Прочитать [summary](../../docs/backend/summary.md), [рефералку/прогресс](../../docs/backend/10-referrals-and-progress.md) и [зарубежные API/прототип](../../docs/backend/11-foreign-api-and-free-prototype.md). Это актуальный MVP до 50 пользователей; старые BE-* задания не добавляются к объёму автоматически.

## Сделать

Проверить основной end-to-end сценарий и все денежные сбои. Устранить текущие P0: публичные WS/SSE отключить либо защитить, default secret убрать, fake payment/topup paths закрыть; реальный referral bonus spend сохранить. Выполнить user A/B, duplicate webhook/start, restart, API budget и backup checks. Владелец проверяет 5–10 собственных работ до приёма реальных заказов. После допуска первые реальные продажи без welcome quotas/промокодов, с обязательной рефералкой MVP-09. Считать расходы и причины претензий, улучшать качество в рамках модели/промптов; масштабирование не входит.

## Приёмка и проверки

Работа и возврат подтверждены на sandbox, нет открытых P0 и необоснованных обещаний; ссылки на реальные файлы/чеки/логи проверок доступны в отчёте без ПД/секретов. Есть список реальных затрат и лимиты общего числа/объёма заказов. Код/конфиги готовы; боевой запуск после допуска владельца.

## Границы

Никаких подарочных работ без покупки или заработанных бонусов/промокодов, покупки кредитов (реферальный баланс обязателен), перегенерации абзацев, PDF, загрузки методичек, S3 для пользовательских файлов и инфраструктуры на 1000 пользователей. Простые сохранения и защита денег обязательны. Переиспользовать полезный существующий код. Обновить статус в [реестре](../README.md), перечислить изменения, проверки и реальные блокировки. Порядок реализации и автономной передачи — в Tasks/EXECUTION-PLAN.md; личный прототип является ближайшей целью, production-часть отдельно.


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

**Что сделано:** 02.11.2026. B4 backend implementation/передача завершены: API-CONTRACT, LOCAL-RUNBOOK, BACKEND-HANDOFF, актуальный OpenAPI, smoke runner и safe zero-credit seeds. Независимые проверки завершены, но исходная live sandbox/E2E приёмка ждёт ключей и frontend. Продажи не запускались.

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
