# 07. Безопасность

> Актуальный MVP: [summary.md](summary.md), [рефералка/прогресс](10-referrals-and-progress.md), [зарубежные API/бесплатный тест](11-foreign-api-and-free-prototype.md) приоритетнее этого расширенного документа. Реферальный бонусный баланс обязателен; покупка кредитов/промокоды не нужны. Российские LLM исключены. Старые предложения по paid wallet, S3 работ, PDF и масштабированию отложены. Аудит безопасности и применимые юридические обязанности сохраняются.


## Главные угрозы

| Угроза | Защита и проверка |
|---|---|
| Чужая работа по ID, WS/SSE или file URL | Owner scope на каждом чтении/изменении/stream/download; тесты user A против user B |
| Поддельный webhook, повторы и перестановка событий | Серверная сверка провайдера, durable inbox, unique operations, monotonic state |
| Двойной расход/зачисление | PostgreSQL transactions, row locks/conditional updates, UNIQUE и CHECK, реальные concurrent tests |
| Кража аккаунта/XSS/CSRF | HttpOnly sessions, CSRF/Origin, output escaping, CSP, reset/отзыв сессий |
| Бесплатные аккаунты сжигают LLM budget | Invite trial, verified email, per-user/IP и global quotas, cost reservations |
| Методичка запускает код/читает сеть | Карантин, type/size checks, sandbox, запрет макросов/внешних URL, отдельный parser worker |
| Prompt injection/выдуманные ссылки | Документ трактуется как данные, structured output, отсутствие произвольных tools, проверка источников |
| Утечка через logs/observability/LLM | Минимизация, redaction, российское хранение, allowlist обработчиков |
| Потеря VPS/удаление S3 | Offsite backups, least-privilege credentials, restore drill, tombstones |

## Политика входа и API

Начальные лимиты для уточнения после беты: login 5 попыток/15 минут на account + дополнительный IP bucket; register 3/час/IP; reset 3/час/account; upload 10 МБ/файл и суммарная квота user; один active generation/user. NAT университетов требует настройки, нельзя банить весь вуз из-за одного пользователя. На login использовать progressive delay/проверку, а не бессрочную блокировку чужого аккаунта по внешним запросам.

Только HTTPS, cookies Secure/HttpOnly, защищённые mutation endpoints. Один origin сокращает CORS: произвольные origins с credentials не разрешать. GET не меняет баланс/документ. Role и user_id берутся из server session, никогда из доверенного поля запроса. Admin API отдельно проверяет permission и повторную аутентификацию для возврата/выгрузки.

Server-side enum/limits для doc_type, pages, chapters, prompt length, upload counts, AST depth/nodes. Нельзя позволить клиенту запросить миллион страниц или изменить свой статус `paid`, balance, file path через PATCH. Исключения наружу без response.text провайдера и stacktrace.

## Рендеринг и загрузки

Считать текст LLM и пользователя недоверенным. React text nodes безопаснее raw HTML; запретить unsanitized `dangerouslySetInnerHTML` и строковую вставку имени/темы в HTML. В существующем `pdfExport.ts` значения интерполируются в HTML: до повторного использования требуется escaping/безопасный renderer.

Загрузки: расширение + magic bytes + MIME, максимум распакованного размера/числа ZIP entries для DOCX, защита zip-slip/zip-bomb, limits страниц/изображений. `.docm`/макросы не принимать. Извлечённый текст не исполнять и не использовать как system prompt. Парсинг/антивирус при необходимости изолированы; metadata/внешние relationships не должны заставлять обращаться к произвольному URL или локальному файлу.

S3: private buckets, scoped IAM для приложения, отдельная backup identity. Приложение не должно иметь право удалить все backup generations. Ключи не в Vite env с публичным префиксом и не в bundle. Не логировать presigned URL, cookie, reset token, Authorization, card details.

## Инфраструктура и разработка

- Default secret/password/mock provider → ошибка запуска production. Secrets rotatable, доступ по минимуму.
- БД/Redis/render API доступны только во внутренней сети. SSH по ключам с ограничением источников; разные Unix identities/контейнеры.
- Версии Python/runtime и пакетов зафиксировать после совместимости; dependency/security scan, SBOM по возможности. Не обещать отсутствие уязвимостей только по успешным тестам.
- SQL параметры через ORM; raw SQL только с bindings. Не включать SQL echo с пользовательскими параметрами в production.
- Health публично минимален; readiness проверяет БД/broker без утечки credentials. Документация API в production ограничена по принятой политике.
- Audit админского просмотра/изменения денег; ограниченный доступ к содержимому работ даже у поддержки, явный сценарий доступа по обращению.
- Уведомление об инциденте, сохранение доказательств и отзыв ключей описать в runbook, назначить ответственного.

## Release gate

До любой внешней беты: закрыты найденные P0, нет реальных данных в demo, проверены user A/B, stop-loss работает конкурентно, доступны restore и удаление данных. До оплаты: проверены forged/duplicate/out-of-order webhook, refund race, чек и reconciliation. До увеличения concurrency: kill-worker/Redis restart/timeout не приводят к лишнему capture или потере работ.
