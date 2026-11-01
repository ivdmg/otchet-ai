# BE-015. Реальная ЮKassa, СБП и чеки

> Прежний расширенный план. Для первой версии этот файл не выполнять: использовать [новый реестр MVP](../README.md) и [summary.md](../../docs/backend/summary.md). Полезные проверки можно переиспользовать в пределах новых заданий; полный объём и прежние зависимости больше не обязательны.


Статус: SUPERSEDED для первого MVP. Приоритет: P0. Зависимости: BE-003, BE-007, BE-009, BE-010.

## Контекст

Прочитать [обзор архитектуры](../../docs/backend/README.md) и связанные спецификации. Это отдельное задание для последующего агента, не отчёт об уже выполненной реализации.

## Объём

Полностью заменить fake PaymentService provider adapter. Product snapshot/idempotent create, hosted checkout, server-side return URL. Webhook durable inbox и authenticated GET сверка ID/merchant/amount/RUB/paid/status; провайдерный payload, а не необязательный X-Signature. Reconcile pending и receipts по утверждённой НПД/ККТ схеме. Только sandbox до допуска продавца.

## Результат и приёмка

Forged event не начисляет ничего; один paid payment даёт один grant; lost webhook восстанавливается; browser redirect не подтверждает оплату; статусы чека видны оператору.

## Проверка

Sandbox success/cancel/timeout, duplicate/out-of-order/concurrent notifications, wrong amount/merchant/currency, unavailable DB/provider, receipt fail/retry.

## Область изменений

payments endpoints/adapter, inbox/reconciliation/fiscal queues; real money после BE-020.

## Передача результата

Обновить статус в [реестре](../README.md), описать миграции/конфиги и выполненные проверки с результатами. Если внешних реквизитов/договоров нет, отделить готовый код и sandbox от блокируемого боевого запуска. Не отмечать DONE по одному наличию файлов или mock-тестов. Не менять визуальный дизайн без необходимости задачи; не делать deploy/покупку/боевой платёж автоматически.

