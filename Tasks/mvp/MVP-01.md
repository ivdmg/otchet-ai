# MVP-01. Основа, БД и вход

Статус: ✅ DONE (backend/local; см. журнал). Исполнитель: backend. Зависимости: —.

Прочитать [summary](../../docs/backend/summary.md), [рефералку/прогресс](../../docs/backend/10-referrals-and-progress.md) и [зарубежные API/прототип](../../docs/backend/11-foreign-api-and-free-prototype.md). Это актуальный MVP до 50 пользователей; старые BE-* задания не добавляются к объёму автоматически.

## Сделать

Один российский VPS, Vite/FastAPI/PostgreSQL, постоянная закрытая папка файлов. Проверить учёт исходников/Markdown в Git и исправить старые пути запуска. Минимальные таблицы: users, sessions, одноразовые auth_tokens, documents с параметрами/утверждённым планом/текстом/путём DOCX, orders, payment_events, jobs и refund records. Не создавать покупной wallet, paid credit_lots, version tree, Redis или S3 adapter для файлов. Минимальные referral/bonus таблицы MVP-09 обязательны. Миграции Alembic. Cookie-auth, CSRF/Origin, безопасный password hash, подтверждение email, reset, owner checks и лимиты. Никаких welcome credits.

## Приёмка и проверки

Чистый запуск и реальные PostgreSQL-миграции; вход/выход/reset; user A не видит работы/файлы B; рестарт не теряет данные; секреты обязательны и отсутствуют в bundle. Реальная БД в тестах блокировок, без подмены SQLite.

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

**Что сделано:** 02.11.2026. B1 local backend принят: изолированный PostgreSQL gd_* migrations/constraints, owner gate, cookie sessions, CSRF/Origin/scrypt, verify/reset/logout mail sink, owner checks и rate limits. Real API/worker/PostgreSQL restart сохранил сессию/данные. Production остаётся deferred.

**Проверки и результаты:** PostgreSQL 16: Alembic upgrade/check — успешно, no new upgrade operations; `venv/Scripts/python.exe -m pytest tests_prototype -q` — 33 passed; добавленные OS kill/recovery tests: `... -m pytest tests_prototype/test_kill_recovery.py -q` — 2 passed (всего 35 разных PostgreSQL проверок). `... -m pytest tests/docx_engine tests/test_ast_schemas.py -q` — 35 passed. Real HTTP auth smoke и реальный API/worker/PostgreSQL restart — PASS. Groq/ЮKassa в интеграционных тестах — явные test doubles, не live proof.

**Блокеры / что нужно от владельца:** Нет блокера принятой локальной backend части. Живые внешние сценарии ждут ключей в MVP-00/02/04/09; production не объявлен готовым.

**Передача:** [BACKEND-HANDOFF](../../docs/backend/BACKEND-HANDOFF.md), [API-CONTRACT](../../docs/backend/API-CONTRACT.md), [LOCAL-RUNBOOK](../../docs/backend/LOCAL-RUNBOOK.md), `docs/backend/openapi.json`.

**Следующий шаг:** Использовать локальный backend; frontend подключает Studio, live E2E по MVP-00 после ключей.
