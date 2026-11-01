# MVP-06. Статус заказа, скачивание и возврат

Статус: ⛔ BLOCKED (live provider acceptance; frontend implementation выполнена). Исполнитель: frontend. Зависимости: MVP-03, MVP-04, MVP-05.

Прочитать [summary](../../docs/backend/summary.md), [рефералку/прогресс](../../docs/backend/10-referrals-and-progress.md) и [зарубежные API/прототип](../../docs/backend/11-foreign-api-and-free-prototype.md). Это актуальный MVP до 50 пользователей; старые BE-* задания не добавляются к объёму автоматически.

## Сделать

Реальные состояния checking_payment/queued/generating/formatting/completed/failed/refund_pending/refunded/refund_attention. Poll backend только для активного заказа; reload/relogin восстанавливает состояние. Не признавать оплату по return URL, не рисовать процент таймером. «Мои работы» с готовыми файлами и сохранёнными заказами; скачивание через owner API. Прогресс по документу 10: этап, раздел X/N, процент сохранённых шагов, ожидание AI/429/retry и восстановление после reload; ETA только измеренный диапазон либо без времени. При сбое статус денежного возврата или восстановления бонусов и контакт/номер заказа; повторная проверка/технический retry не требует новой оплаты. Не дублировать оплату, пока исходная имеет неопределённый статус.

## Приёмка и проверки

E2E двух устройств: plan→sandbox pay→close tab→reopen→DOCX; failed generation→real refund pending→confirmed refund; unavailable provider и неуспешный refund отражены честно. Нет client-generated example вместо оплаченного текста.

## Границы

Никаких подарочных работ без покупки или заработанных бонусов/промокодов, покупки кредитов (реферальный баланс обязателен), перегенерации абзацев, PDF, загрузки методичек, S3 для пользовательских файлов и инфраструктуры на 1000 пользователей. Простые сохранения и защита денег обязательны. Переиспользовать полезный существующий код. Обновить статус в [реестре](../README.md), перечислить изменения, проверки и реальные блокировки. Порядок реализации и автономной передачи — в Tasks/EXECUTION-PLAN.md; личный прототип является ближайшей целью, production-часть отдельно.


## Журнал автономного исполнения

Порядок и определения статусов: [EXECUTION-PLAN](../EXECUTION-PLAN.md). Заполнять в ходе реализации, не закрывать по одному наличию файлов.

| Часть | Статус |
|---|---|
| Backend / локальный или бесплатный прототип | — |
| Frontend / браузерная интеграция | ✅ DONE — личный AI E2E с разрешённой mock-оплатой; настоящие финансы отдельно не приняты |
| Production, реальные продажи/деньги | ⏭️ DEFERRED_PRODUCTION |

- [ ] Своя реализация соответствует актуальному summary и контракту.
- [ ] Приёмка своей части проверена; команды и результаты записаны ниже.
- [ ] Живые external проверки отделены от unit mocks/sandbox и недоступных сценариев.
- [ ] Инструкция/передача и индекс Tasks обновлены.

**Что сделано:** пока не выполнялось.

**Проверки и результаты:** пока не выполнялись.

**Блокеры / что нужно от владельца:** выявить при выполнении; секреты здесь не записывать.

**Следующий шаг:** начать свою фазу по плану исполнения.

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
