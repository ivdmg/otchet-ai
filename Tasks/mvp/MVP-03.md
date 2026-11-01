# MVP-03. Надёжное выполнение одного заказа

Статус: ✅ DONE (backend/local; см. журнал). Исполнитель: backend. Зависимости: MVP-01, MVP-02.

Прочитать [summary](../../docs/backend/summary.md), [рефералку/прогресс](../../docs/backend/10-referrals-and-progress.md) и [зарубежные API/прототип](../../docs/backend/11-foreign-api-and-free-prototype.md). Это актуальный MVP до 50 пользователей; старые BE-* задания не добавляются к объёму автоматически.

## Сделать

Один worker опрашивает durable jobs в PostgreSQL, API возвращает job ID и реальный статус. Уникальный job/order и атомарный claim с ограниченным временем владения/attempt token предотвращают двойную запись результата. Подтверждение оплаты и постановка задания — одна transaction. После рестарта worker восстанавливает checkpoint; зависшие задания сверяются, retry ограничен. Файл сначала пишется во временный путь, затем атомарно публикуется после проверки; completed только с валидным DOCX. До создания новой оплаты резервировать расчётный API-бюджет; stop-loss запрещает новые заказы, но не бросает уже оплаченные. После окончательного сбоя денежный заказ создаёт refund_required для MVP-04, бонусный выполняет release по MVP-09. Job хранит completed_units/total_units, фиксированные веса шагов, current_section, progress и retry_at. Процент только по сохранённым шагам, 100% после реального DOCX. Контракт документа 10 обязателен.

## Приёмка и проверки

Двойной клик/webhook не создаёт две работы; kill до/после сохранения главы и публикации файла не теряет заказ; повторное скачивание не вызывает AI. Устаревший worker не перезаписывает новый результат. Генерация продолжается без браузера. Не создавать отдельную сложную outbox/Celery систему: очередь уже в той же БД.

## Границы

Никаких подарочных работ без покупки или заработанных бонусов/промокодов, покупки кредитов (реферальный баланс обязателен), перегенерации абзацев, PDF, загрузки методичек, S3 для пользовательских файлов и инфраструктуры на 1000 пользователей. Простые сохранения и защита денег обязательны. Переиспользовать полезный существующий код. Обновить статус в [реестре](../README.md), перечислить изменения, проверки и реальные блокировки. Порядок реализации и автономной передачи — в Tasks/EXECUTION-PLAN.md; личный прототип является ближайшей целью, production-часть отдельно.


## Журнал автономного исполнения

Порядок и определения статусов: [EXECUTION-PLAN](../EXECUTION-PLAN.md). Заполнять в ходе реализации, не закрывать по одному наличию файлов.

| Часть | Статус |
|---|---|
| Backend / локальный или бесплатный прототип | ✅ DONE — backend; frontend не закрыт |
| Frontend / браузерная интеграция | — |
| Production, реальные продажи/деньги | ⏭️ DEFERRED_PRODUCTION |

- [x] Своя реализация соответствует актуальному summary и контракту.
- [x] Приёмка своей части проверена; команды и результаты записаны ниже.
- [x] Живые external проверки отделены от unit mocks/sandbox и недоступных сценариев.
- [x] Инструкция/передача и индекс Tasks обновлены.

**Что сделано:** 02.11.2026. B2 durable worker принят локально: async HTTP admission, unique job/order, PostgreSQL claim/lease/fencing, checkpoints, immutable approved plan, weighted progress, DOCX before completed, failure refund intent/release. Реальные OS worker kill до checkpoint и после записи DOCX до commit восстановлены без второго job. Live provider приёмка отдельно MVP-00/02/04.

**Проверки и результаты:** PostgreSQL 16: Alembic upgrade/check — успешно, no new upgrade operations; `venv/Scripts/python.exe -m pytest tests_prototype -q` — 33 passed; добавленные OS kill/recovery tests: `... -m pytest tests_prototype/test_kill_recovery.py -q` — 2 passed (всего 35 разных PostgreSQL проверок). `... -m pytest tests/docx_engine tests/test_ast_schemas.py -q` — 35 passed. Real HTTP auth smoke и реальный API/worker/PostgreSQL restart — PASS. Groq/ЮKassa в интеграционных тестах — явные test doubles, не live proof.

**Блокеры / что нужно от владельца:** Нет блокера принятой локальной backend части. Живые внешние сценарии ждут ключей в MVP-00/02/04/09; production не объявлен готовым.

**Передача:** [BACKEND-HANDOFF](../../docs/backend/BACKEND-HANDOFF.md), [API-CONTRACT](../../docs/backend/API-CONTRACT.md), [LOCAL-RUNBOOK](../../docs/backend/LOCAL-RUNBOOK.md), `docs/backend/openapi.json`.

**Следующий шаг:** Использовать локальный backend; frontend подключает Studio, live E2E по MVP-00 после ключей.
