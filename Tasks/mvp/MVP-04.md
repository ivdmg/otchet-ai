# MVP-04. ЮKassa, чеки и полный возврат

Статус: ⛔ BLOCKED (backend/local; см. журнал). Исполнитель: backend. Зависимости: MVP-01, MVP-03; юридическая часть MVP-07.

Прочитать [summary](../../docs/backend/summary.md), [рефералку/прогресс](../../docs/backend/10-referrals-and-progress.md) и [зарубежные API/прототип](../../docs/backend/11-foreign-api-and-free-prototype.md). Это актуальный MVP до 50 пользователей; старые BE-* задания не добавляются к объёму автоматически.

## Сделать

Разовая оплата конкретного snapshot заказа в рублях/копейках; цену определяет сервер. Hosted checkout СБП/карта; уникальный idempotency key. Полностью отключить fake gateway и paid credit topup endpoints в production. Расход реферальных бонусов реализует MVP-09. Verified cash order completion/refund идемпотентно меняет реферальный учёт. Webhook сверять authenticated API запросом к ЮKassa: payment ID, магазин, paid/status, amount, RUB, local order. Запись события/paid+job атомарна и идемпотентна. Reconciler проверяет pending payments и возвраты при пропавшем webhook. Фискальная схема утверждена под продавца; статусы чека/ошибки доступны оператору. На конечную техническую ошибку автоматический полный refund по исходной оплате, повтор create refund тем же ключом. Неподтверждённый refund не считать завершённым; alert и ручной retry. Качество/прочие претензии — обращение с решением владельца, без сложного admin app.

## Приёмка и проверки

Sandbox: success/cancel, fake/duplicate/out-of-order event, wrong sum/merchant, network timeout, paid-with-lost-webhook, failed generation, failed refund, receipt failure. Один payment не возвращается дважды; отчёт позволяет сверить оплату/работу/чек/возврат. Боевые платежи только после реальных реквизитов и допуска.

## Границы

Никаких подарочных работ без покупки или заработанных бонусов/промокодов, покупки кредитов (реферальный баланс обязателен), перегенерации абзацев, PDF, загрузки методичек, S3 для пользовательских файлов и инфраструктуры на 1000 пользователей. Простые сохранения и защита денег обязательны. Переиспользовать полезный существующий код. Обновить статус в [реестре](../README.md), перечислить изменения, проверки и реальные блокировки. Порядок реализации и автономной передачи — в Tasks/EXECUTION-PLAN.md; личный прототип является ближайшей целью, production-часть отдельно.


## Журнал автономного исполнения

Порядок и определения статусов: [EXECUTION-PLAN](../EXECUTION-PLAN.md). Заполнять в ходе реализации, не закрывать по одному наличию файлов.

| Часть | Статус |
|---|---|
| Backend / локальный или бесплатный прототип | ⛔ BLOCKED — backend; frontend не закрыт |
| Frontend / браузерная интеграция | — |
| Production, реальные продажи/деньги | ⏭️ DEFERRED_PRODUCTION |

- [ ] Своя реализация соответствует актуальному summary и контракту.
- [ ] Приёмка своей части проверена; команды и результаты записаны ниже.
- [x] Живые external проверки отделены от unit mocks/sandbox и недоступных сценариев.
- [x] Инструкция/передача и индекс Tasks обновлены.

**Что сделано:** 02.11.2026. B3 код: настоящий ЮKassa test HTTP create/get/refund, server-side test/shop/RUB/amount/metadata verification, durable stable keys, reconciler, refund state machine/unknown response handling. Mock/PG приёмка выполнена; реальный sandbox success/refund не проверен без test credentials. Production фискализация deferred.

**Проверки и результаты:** PostgreSQL 16: Alembic upgrade/check — успешно, no new upgrade operations; `venv/Scripts/python.exe -m pytest tests_prototype -q` — 33 passed; добавленные OS kill/recovery tests: `... -m pytest tests_prototype/test_kill_recovery.py -q` — 2 passed (всего 35 разных PostgreSQL проверок). `... -m pytest tests/docx_engine tests/test_ast_schemas.py -q` — 35 passed. Real HTTP auth smoke и реальный API/worker/PostgreSQL restart — PASS. Groq/ЮKassa в интеграционных тестах — явные test doubles, не live proof.

**Блокеры / что нужно от владельца:** Для live приёмки локально настроить GROQ_API_KEY, YUKASSA_SHOP_ID и test_* YUKASSA_SECRET_KEY; секреты в чат/Markdown не отправлять. Затем настоящие Groq plan/text/DOCX, sandbox pay/refund и пять qualifying first purchases → earned bonus job. Запрос владельцу сделан один раз; ключи отсутствуют. VPS/production-пакет/Render не блокируют local prototype.

**Передача:** [BACKEND-HANDOFF](../../docs/backend/BACKEND-HANDOFF.md), [API-CONTRACT](../../docs/backend/API-CONTRACT.md), [LOCAL-RUNBOOK](../../docs/backend/LOCAL-RUNBOOK.md), `docs/backend/openapi.json`.

**Следующий шаг:** Настроить env и пройти полный real-provider smoke; frontend подключает действующий Studio по контракту.
