# 09. Источники, допущения и решения

> Актуальный MVP: [summary.md](summary.md), [рефералка/прогресс](10-referrals-and-progress.md), [зарубежные API/бесплатный тест](11-foreign-api-and-free-prototype.md) приоритетнее этого расширенного документа. Реферальный бонусный баланс обязателен; покупка кредитов/промокоды не нужны. Российские LLM исключены. Старые предложения по paid wallet, S3 работ, PDF и масштабированию отложены. Аудит безопасности и применимые юридические обязанности сохраняются.


Проверено 01.11.2026. Ссылки на тарифы — отправная точка, окончательные условия определяются договором/кабинетом. Веб-страницы могут меняться. Все расчёты нагрузки и budgets в соседних документах — наши допущения, а не результаты production benchmark.

## Источники

| Тема | Первичный документ или текст нормы | Что проверялось |
|---|---|---|
| VPS | [Timeweb Cloud](https://timeweb.cloud/services/cloud-servers) | Конфигурации и цена на странице |
| Бесплатная ВМ | [Cloud.ru docs](https://cloud.ru/docs/virtual-machines/ug/topics/overview__free-tier) | Eligibility, CPU, IP, disk, restore |
| Бесплатный S3 | [Cloud.ru storage docs](https://cloud.ru/docs/s3e/ug/topics/overview__free-tier) | Space/requests/traffic и общий лимит организации |
| PDF trial | [CloudConvert pricing](https://cloudconvert.com/pricing) | Кредиты/сутки и условия free |
| PDF self-hosted | [Gotenberg installation](https://gotenberg.dev/docs/getting-started/installation), [conversion](https://gotenberg.dev/docs/convert-with-libreoffice/convert-to-pdf), [configuration](https://gotenberg.dev/docs/configuration) | Образы, endpoint, ограничения LibreOffice |
| LLM РФ | [Yandex AI Studio](https://aistudio.yandex.ru/ru/docs/ai-studio/pricing) | Вход/выход и режимы тарификации |
| GigaChat | [Тарифы](https://developers.sber.ru/docs/ru/gigachat/api/tariffs) | Разделение статусов и коммерческих условий |
| Иностранный LLM | [DeepSeek docs](https://api-docs.deepseek.com/quick_start/pricing/) | Нельзя полагаться на старые model aliases/цены |
| Webhook | [ЮKassa](https://yookassa.ru/developers/using-api/webhooks) | Настоящая проверка уведомлений |
| Чеки | [ЮKassa receipts](https://yookassa.ru/developers/payment-acceptance/receipts/basics) | Различие НПД и ИП/компаний |
| Комиссии | [ЮKassa fees](https://yookassa.ru/fees/), [СБП: ЦБ](https://cbr.ru/PSystem/sfp/) | Итоговый договор требуется отдельно |
| НПД | [ФНС](https://npd.nalog.ru/), [FAQ](https://npd.nalog.ru/faq/), [ИП на НПД](https://www.nalog.gov.ru/rn77/taxation/taxes/vibor_sn//go_to_npd/) | Ставки/условия/ККТ |
| Локализация | [152-ФЗ ст.18](https://www.consultant.ru/document/cons_doc_LAW_61801/cbf4e15b7c330f9372e876cdf2bc928bad7950ef/) | Актуальная норма о сборе данных |
| Согласие | [152-ФЗ ст.9](https://www.consultant.ru/document/cons_doc_LAW_61801/6c94959bc017ac80140621762d2ac59f6006b08c/) | Отдельное оформление |
| Инциденты/удаление | [152-ФЗ ст.21](https://www.consultant.ru/document/cons_doc_LAW_61801/d3fe43a7c415353b17faab255bc0de92bea127da/) | Обязанности оператора |
| Уведомления | [152-ФЗ ст.22](https://www.consultant.ru/document/cons_doc_LAW_61801/d996966e22e1320c9de1ab82d9f6be12c3d9d765/) | Уведомление об обработке |
| Трансграничная передача | [152-ФЗ ст.12](https://www.consultant.ru/document/cons_doc_LAW_61801/e4ebbe1780de623c7cf32a59ca82a7bb523a25dd/) | Отдельный режим передачи |
| Возврат | [ЗоЗПП ст.32](https://www.consultant.ru/document/cons_doc_LAW_305/758e2cfdf136a621c8f66dcb3372b772c7b5e6e8/), [Роспотребнадзор: расходы](https://26.rospotrebnadzor.ru/press-center/pr/9388/), [требования потребителя](https://zpp.rospotrebnadzor.ru/npa/federal/obslug/192115) | Отказ, доказательство затрат и недостатки |
| Реклама | [Письмо ФАС](https://www.garant.ru/products/ipo/prime/doc/71999568/) | Реклама услуг по написанию аттестационных работ |

Не подтверждено: конкретный PDF сервис с 50 бесплатными запросами ежедневно, итоговая комиссия для нашей категории, подключение продавца на НПД, доступный владельцу cloud free tier, фактический размер PDF, production throughput, себестоимость ВКР. На эти пункты нельзя ссылаться как на уже решённые.

## Предварительно принятые технические решения

| ID | Решение | Пересмотр |
|---|---|---|
| ADR-01 | Сохранить модульный FastAPI монолит и Vite | Только при измеренной проблеме стека |
| ADR-02 | PostgreSQL источник истины, Redis только delivery/cache | Не вводить ещё БД без сценария |
| ADR-03 | Приватный S3 в РФ, PDF из DOCX локально | По замерам RAM/рендера и требованиям шаблонов |
| ADR-04 | Серверные cookie-сессии | OAuth добавить после полноценного входа |
| ADR-05 | Outbox + lease + idempotent ledger | Обязательные условия платного запуска |
| ADR-06 | ЮKassa hosted checkout, без recurring | После onboarding и утверждения фискальной схемы |
| ADR-07 | LLM выбирать benchmark и правовой проверкой | Не закреплять deepseek-chat по старому конфигу |

## Решения владельца до соответствующей фазы

1. **До инфраструктуры:** бюджет первой недели/месяца; есть ли подходящий старый Cloud.ru аккаунт; выбрать российский регион. По умолчанию планировать платный VPS 4 ГБ с возможностью 8 ГБ.
2. **До тарифа:** разовая работа либо пакеты кредитов; формат/объём бесплатного trial; входят ли PDF и DOCX, сколько правок. По умолчанию ограниченный trial по приглашению и оба формата одной версии.
3. **До внешних данных:** реквизиты оператора, правовые основания и список обработчиков. Это нельзя достоверно вывести из исходников.
4. **До реальной оплаты:** статус продавца, предмет договора, разрешённая эквайером категория, чеки, возвраты, подтверждённые комиссии.
5. **До продвижения:** заключение по текущему позиционированию учебных работ и рекламным материалам.
6. **До увеличения нагрузки:** фактический benchmark, допустимые RPO/RTO и предел расходов.

Эти вопросы не мешают сейчас готовить код интерфейсов и тестовую инфраструктуру. Регистрацию бизнеса, покупку серверов, подачу уведомлений и подключение боевых платежей выполняют отдельно по реальным данным владельца; в рамках исследования такие действия не предпринимались.

## Актуальные изменения после уточнений владельца

ADR для MVP: рефералка обязательна, кредиты только бонусные; оплата cash|bonus. Источник правил — [документ 10](10-referrals-and-progress.md). Российские LLM больше не кандидаты. Выбор Groq Free для личного теста/DeepSeek Flash для paid benchmark условен доступностью и качеством; free-прототип Render/локально до покупки VPS. Источники текущих тарифов/квот/ограничений и расчёты — [документ 11](11-foreign-api-and-free-prototype.md). Они заменяют прежние рекомендации Yandex/GigaChat и отмену рефералки; старые таблицы оставлены как история исследования.
