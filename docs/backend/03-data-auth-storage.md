# 03. База данных, вход и файлы

> Обновление требований 02.11.2026: единственный действующий план — [Tasks/PLAN.md](../../Tasks/PLAN.md). Три шага, временная выдача Word/PDF, готовые работы только metadata, mock-оплата после плана и кэшбэк. Этот документ описывает предыдущие решения/реализацию; при конфликте следовать новому плану. Утверждённый дизайн сохранён коммитом 47d6837.


> Актуальный MVP: [summary.md](summary.md), [рефералка/прогресс](10-referrals-and-progress.md), [зарубежные API/бесплатный тест](11-foreign-api-and-free-prototype.md) приоритетнее этого расширенного документа. Реферальный бонусный баланс обязателен; покупка кредитов/промокоды не нужны. Российские LLM исключены. Старые предложения по paid wallet, S3 работ, PDF и масштабированию отложены. Аудит безопасности и применимые юридические обязанности сохраняются.


## Какие БД нужны

**Одна PostgreSQL** для пользователей, работ, JSONB AST, версий, очереди операций и финансового учёта. Redis для Celery и краткоживущих ограничителей; при его потере пользовательские документы и деньги сохраняются. S3 — файловое объектное хранилище, не замена SQL. MongoDB, Elasticsearch, vector DB и отдельная БД авторизации до появления конкретного сценария не нужны.

PostgreSQL на том же VPS снижает счёт, но делает машину единой точкой отказа. Обязательны отдельный persistent volume и резервные копии за пределами VPS в РФ. Managed PostgreSQL рассматривать после платного пилота при наличии бюджета на восстановление/доступность.

## Целевая схема

Все timestamps timezone-aware UTC, наружу ISO 8601. Деньги — BIGINT копейки либо Decimal NUMERIC, никогда float. Публичные ID случайные UUID. FK и CHECK — на уровне БД, не только Pydantic.

| Таблица | Основные поля/ограничения |
|---|---|
| users | id, email_normalized UNIQUE, password_hash, verified_at, status, created_at; не выдавать welcome credits по default |
| user_profiles | user_id PK/FK, необязательные имя/настройки титульного листа; минимум ПД |
| sessions | token_hash UNIQUE, user_id, expires_at, idle_expires_at, revoked_at, last_seen_at |
| auth_tokens | token_hash UNIQUE, purpose, user_id, expires_at, used_at; одноразовость атомарно |
| legal_acceptances | user_id, document_type, version/hash, accepted_at, action/context; неизменяемая история |
| documents | user_id, title, doc_type enum, status, current_version_id, revision, deleted_at |
| document_versions | document_id, revision UNIQUE per doc, schema_version, input_json, approved_outline_json, ast_jsonb, hash, parent_version_id |
| generation_jobs | user_id, document_id, version_id, operation_key UNIQUE, status, stage, progress, lease_owner, lease_until, fencing_token, heartbeat, attempts, cost_ceiling |
| generation_steps | job_id+step_key UNIQUE, input_hash, output JSONB, provider_request_id, status, usage/cost |
| document_files | version_id, format, object_key UNIQUE, size, sha256, state, created_at; UNIQUE(version_id, format, render_version) |
| uploads | owner_id, object_key, sha256, detected_type, size, scan_state, expires_at |
| products / quotes | версия цены, credit_amount, amount_kopecks, лимиты; quote user_id/input_hash/expires_at |
| orders / payments | owner, product snapshot, amount_kopecks, currency, status; UNIQUE(provider,provider_payment_id), provider idempotency key |
| payment_events | provider+dedupe_key UNIQUE, object_id, verified_at, processed_at, безопасный payload/hash |
| wallets | user_id UNIQUE, available/reserved nonnegative; update в той же transaction что ledger |
| wallet_entries | operation_id UNIQUE, user_id, kind grant/reserve/capture/release/revoke, delta, job/payment/refund link, created_at |
| credit_lots | payment_id или promo_id, issued, reserved, consumed, reversed; трассировка купленных/бонусных единиц |
| refunds / refund_requests | order_id, amount, reason, request state, provider_refund_id UNIQUE, финансовый/fiscal status |
| receipts | payment/refund link, kind advance/full_settlement/refund, provider receipt ID, status, retries |
| outbox | operation_id UNIQUE, topic, aggregate_id, payload, attempts, next_attempt_at, delivered_at |
| audit_events / deletion_requests | actor, действие, target, время; сведения минимизировать; отдельно процесс удаления |
| llm_usage | job/step, model+version, input/output/cache tokens, unit price snapshot, estimated/actual cost, outcome |

Ledger отражает обязательства сервиса; это не пользовательский банковский счёт, кредиты не переводятся другим людям и не выводятся произвольно. Возврат исходной покупки возможен по правилам потребительского договора. Paid и promo credits различимы; списание по детерминированному FIFO внутри категории. Сначала правило категории утверждается в тарифе, затем реализуется.

Индексы: `(user_id, created_at DESC, id)` для списков; `(document_id, revision)`; partial UNIQUE активного изменяющего job на document_id; jobs `(status,next_attempt_at)`; outbox `(delivered_at,next_attempt_at)`; payment provider ID UNIQUE. GIN на весь AST без конкретного запроса не создавать. Не возвращать большие JSON всех работ в списке.

Существующий `transactions` сохранить для миграции/истории, но не смешивать в одной записи банковский платёж, выдачу единиц и их расход. Добавить явную связь расхода с job и денежного возврата с исходным payment. Удалить каскадное физическое удаление обязательной финансовой истории вместе с user; личную часть разрывать/минимизировать по утверждённому retention.

## Регистрация и сессии

MVP: email+пароль, без SMS и без обязательного Google/Telegram OAuth. Это уменьшает число интеграций. Социальный вход не делает хранение данных бесплатным и не отменяет 152-ФЗ.

Email нормализовать согласованно без удаления точек/`+tag` во всех доменах; уникальность в БД, обработка гонки регистрации. Пароли хешировать Argon2id с параметрами, измеренными на VPS. Старый bcrypt проверять в совместимой ветке, при успешном входе rehash; молчаливое обрезание новых паролей запрещено. При миграции пользователей с длинными старыми паролями отдельно оценить обязательный reset.

Случайная opaque session cookie `HttpOnly; Secure; SameSite=Lax; Path=/`, предпочтительно `__Host-` без Domain. Токен ≥256 бит энтропии, в БД только hash; абсолютный TTL 7 дней, idle TTL 24 часа — предлагаемые продуктовые настройки. Login/password reset меняют session ID; выход отзывает сессию, смена пароля отзывает все остальные. Для mutation — CSRF token + проверка Origin, cookie SameSite сама по себе недостаточна.

Email verification/reset: одноразовый случайный токен, hash в БД, TTL 24 часа/30 минут соответственно; письмо без пароля. Повторная отправка ограничена. Forgot-password отвечает одинаково для существующего и отсутствующего email. Почтовый провайдер с согласованной обработкой данных, SPF/DKIM/DMARC, обработка bounce, лимиты; не считать почту гарантированно бесплатной. Нельзя выдавать trial на непроверенный email.

OAuth Яндекс можно добавить позднее: PKCE/state, привязка после повторной аутентификации, никаких автоматических merge только по одинаковому email. Админские операции — отдельная роль, MFA, аудит и минимальные разрешения.

## S3 и объём PDF

Текстовый PDF не обязательно большой. Расчётное допущение: **2 МБ на комплект DOCX+PDF**, а не измеренный факт. При 1000 пользователях × 2 работы/месяц × 2 МБ = 4 ГБ новых файлов/месяц; 90 дней ≈12 ГБ без загрузок, старых версий и backups. Если комплект 10 МБ — 60 ГБ за 90 дней. Замерить p50/p95 на реальных шаблонах, особенно с изображениями.

Bucket private, public ACL запрещены. Object key вида `documents/{user_uuid}/{document_uuid}/{version_uuid}/{sha256}.pdf`; ФИО/email/название темы в ключ не включать. В БД хранить key, не вечный URL и не presigned URL. После проверки owner API выдаёт ссылку на 60–120 секунд либо проксирует скачивание. Подписанная ссылка является временным секретом; отзыв аккаунта не обрывает уже выданную ссылку до TTL.

Storage adapter: put/get/head/delete/sign_url, server-side quotas и контроль размера. Загрузка сначала в карантин; незавершённые multipart и orphan objects удаляет reconciler. PUT может пройти, а commit БД упасть: запись file state и повторная сверка обязательны. Версия становится ready после HEAD/проверки размера/checksum всех обязательных файлов.

Cloud.ru S3 — кандидат из-за free tier, окончательно проверить регион, договор, quotas и доступность аккаунту. Альтернативы — S3 Timeweb/Yandex Cloud. Не поднимать MinIO на том же VPS исключительно ради S3 API: это не offsite backup и не повышает доступность.

## Предлагаемые сроки хранения

Это продуктовые предложения, не универсальные сроки закона; перед запуском согласовать их с политикой и договором.

| Данные | Предлагаемое правило |
|---|---|
| Работы, AST и финальные файлы | 90 дней после последнего изменения, предупреждение за 7 дней; позднее платный архив |
| Методички/исходные загрузки | До 7 дней после обработки, если не нужны для действующего заказа |
| Temp/render files | Удаление по завершении; sweeper максимум 24 часа |
| Полные промпты/ответы для отладки | По умолчанию не хранить; временный opt-in до 7 дней с удалением ПД |
| Технические логи | 14 дней; security audit до 90 дней при обоснованной цели |
| Backups | 7 ежедневных + 4 еженедельных, шифрование, РФ, ограниченный доступ |
| Платежи/чеки/претензии | Отдельный обязательный срок по статусу продавца и документам; подтвердить с бухгалтером, не удалять по правилу 90 дней |

Удаление аккаунта: отозвать сессии, остановить jobs, удалить активные документы/файлы, удалить данные у обработчиков, минимизировать обязательные финансовые записи, сохранить основание и срок остаточного хранения. Tombstone без избыточных ПД повторно применяется после восстановления backup, чтобы удалённый пользователь не «воскрес». В политике описать ограниченный срок исчезновения из резервных копий; backup не доступен приложению как активная БД.

## Уточнение действующей минимальной схемы

В первом MVP пользовательские DOCX на постоянном диске VPS, а не обязательно S3. Для обязательной рефералки добавить только referral_attributions/rewards и bonus_accounts/entries по [документу 10](10-referrals-and-progress.md). Paid credit lots и продажу кредитов не вводить. Заказы имеют funding_type=cash|bonus, фиксированную цену и ссылку на bonus reservation либо provider payment. Job хранит durable step progress и retry state. Для закрытого free-прототипа допускается временный BYTEA adapter по [документу 11](11-foreign-api-and-free-prototype.md); не использовать Render ephemeral disk как постоянное хранилище.
