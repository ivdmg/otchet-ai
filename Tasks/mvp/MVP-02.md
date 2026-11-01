# MVP-02. API нейросети, план и DOCX

Статус: ⛔ BLOCKED (backend/local; см. журнал). Исполнитель: backend. Зависимости: MVP-01.

Прочитать [summary](../../docs/backend/summary.md), [рефералку/прогресс](../../docs/backend/10-referrals-and-progress.md) и [зарубежные API/прототип](../../docs/backend/11-foreign-api-and-free-prototype.md). Это актуальный MVP до 50 пользователей; старые BE-* задания не добавляются к объёму автоматически.

## Сделать

Выбрать зарубежную LLM API по 5–10 обезличенным примерам: Groq Free для личного теста, прямой DeepSeek Flash — paid-кандидат. Российские модели исключены. Учитывать TPM/TPD и доступ по документу 11. Генерировать план, сохранить ручные изменения, фиксировать утверждённый снимок. Полную работу генерировать по главам при необходимости; сохранять успешные разделы и собирать DOCX существующим python-docx. Зафиксировать стили/шрифты/таблицы, проверять источники и не обещать уникальность. Одна начальная генерация плана на заказ; лимиты неоплаченных планов по user/IP/глобально, ограничение числа неоплаченных заказов. Стоимость AI учитывать вместе с retry. PDF/методички/абзацные правки исключены.

## Приёмка и проверки

Скачиваемый DOCX содержит именно сгенерированный текст утверждённого плана, открывается в Word/LibreOffice; проверены поля/таблицы/кириллица и реальные источники. Есть замер token/cost/time на короткой и предельной работе; неизвестный расход timeout учтён; выбор модели укладывается в бюджет либо ограничения честно пересмотрены.

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

**Что сделано:** 02.11.2026. B2 код: реальный Groq adapter без canned fallback, async plan/edit/approve, checkpoints и DOCX из сохранённого текста. JSON/timeout/429/budget/unit+PG tests выполнены. Live русский текст/usage/качество/источники и Word/LibreOffice review не приняты без ключа.

**Проверки и результаты:** PostgreSQL 16: Alembic upgrade/check — успешно, no new upgrade operations; `venv/Scripts/python.exe -m pytest tests_prototype -q` — 33 passed; добавленные OS kill/recovery tests: `... -m pytest tests_prototype/test_kill_recovery.py -q` — 2 passed (всего 35 разных PostgreSQL проверок). `... -m pytest tests/docx_engine tests/test_ast_schemas.py -q` — 35 passed. Real HTTP auth smoke и реальный API/worker/PostgreSQL restart — PASS. Groq/ЮKassa в интеграционных тестах — явные test doubles, не live proof.

**Блокеры / что нужно от владельца:** Для live приёмки локально настроить GROQ_API_KEY, YUKASSA_SHOP_ID и test_* YUKASSA_SECRET_KEY; секреты в чат/Markdown не отправлять. Затем настоящие Groq plan/text/DOCX, sandbox pay/refund и пять qualifying first purchases → earned bonus job. Запрос владельцу сделан один раз; ключи отсутствуют. VPS/production-пакет/Render не блокируют local prototype.

**Передача:** [BACKEND-HANDOFF](../../docs/backend/BACKEND-HANDOFF.md), [API-CONTRACT](../../docs/backend/API-CONTRACT.md), [LOCAL-RUNBOOK](../../docs/backend/LOCAL-RUNBOOK.md), `docs/backend/openapi.json`.

**Следующий шаг:** Настроить env и пройти полный real-provider smoke; frontend подключает действующий Studio по контракту.

### Отдельная AI-приёмка подготовлена 02.11.2026

`app.prototype.live_ai` использует существующие Groq adapter/Content validation/DOCX compiler, checkpoint resume и private manifest. ЮKassa не требуется; публичного обхода оплаты нет. Runner tests: 2 passed с explicit doubles; live без ключа корректно BLOCKED. Владелец добавит свой GROQ_API_KEY позже; не генерировать ключи. См. FRONTEND-HANDOFF и MVP-10.

## Актуальное уточнение владельца и проверка — 02.11.2026

Владелец предоставил Groq ключ и разрешил **имитацию оплаты** до получения ЮKassa, попросив экономить квоту и вернуть основной UI. Ключ установлен только в игнорируемый backend .env. Упрощённая техническая форма убрана, действующие StudioWorkspace/ProductFlow используют исходные product layouts Studio. Выполнен один живой browser E2E: настоящий план→ручные правки/2 раздела→approve→явная mock-оплата→настоящий worker текст→скачанный/открытый DOCX→relogin/library/restart. Groq openai/gpt-oss-120b: **6 AI-вызовов, 5350 reported tokens**, план 4 s, текст 122 s с rate waits. Дополнительные live-работы не запускались.

**Проверки:** build/typecheck PASS; PostgreSQL suite **39 passed** с explicit external doubles; живое доказательство отдельно `docs/backend/evidence/live-generation.json`. Owner download/preview 200, другой пользователь document/download/preview 404. Скачанный DOCX bytes совпадает с серверным, checkpoint paragraphs присутствуют. Повторные чтения/перезапуск не расходовали новые AI tokens.

**Граница:** MOCK_PAYMENTS=true не означает реальную sandbox покупку/возврат. simulated_no_charge не квалифицирует referrals и не создаёт cash refunds; это покрыто новыми tests. ЮKassa/refund/пять покупателей/bonus live по-прежнему не приняты. Качество/библиография требуют ручного просмотра; 3–5 новых работ сознательно не выполнялись по ограничению владельца.

[Текущая передача и запуск](../../docs/backend/FRONTEND-HANDOFF.md). Предыдущие записи об отсутствующем Groq ключе — историческое состояние до его предоставления.
