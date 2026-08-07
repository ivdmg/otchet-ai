# Дорожная Карта Задач (TASKS.md)

Полный декомпозированный план разработки проекта **AI GostDoc** на едином стеке **React + Vite + TypeScript** (Frontend) и **FastAPI (Python 3.11+)** + **Celery / Redis / python-docx** (Backend).

---

## Фаза 1: Спецификация и Проектирование (Specification Phase)
- [x] **Task 1.1:** Подтверждение архитектурного инсайта и согласование SDD подхода.
- [x] **Task 1.2:** Анализ рынка и конкурента `Zachetka.pro` (`docs/COMPETITOR_ANALYSIS.md`).
- [x] **Task 1.3:** Разработка PRD со стеком React + FastAPI + Vite + TS (`docs/PRD.md`).
- [x] **Task 1.4:** Разработка точной ГОСТ-спецификации компилятора (`docs/GOST_RULES.md`).
- [x] **Task 1.5:** Создание спецификации Базы Данных, SQLAlchemy & Pydantic v2 схем (`docs/DB_SCHEMA.md`).
- [x] **Task 1.6:** Проектирование Промпт-Цепочек LLM и JSON-схем (`docs/PROMPT_PIPELINE.md`).
- [x] **Task 1.7:** Создание правил AI-агента (`.antigravityrules`).

---

## Фаза 2: Схемы Данных, DB, ORM & Pydantic v2 (Data Layer)
- [x] **Task 2.1:** Инициализация FastAPI приложения (`Python 3.11+`, `Uvicorn`, `Pydantic v2`).
- [x] **Task 2.2:** Настройка миграций PostgreSQL через Alembic.
- [x] **Task 2.3:** Создание ORM-моделей SQLAlchemy 2.0 Async (`app/models/`).
- [x] **Task 2.4:** Написание Pydantic v2 схем для AST Graph (`app/schemas/ast.py`).
- [x] **Task 2.5:** Написание Pydantic v2 схем для API запросов/ответов (`app/schemas/api.py`).
- [x] **Task 2.6:** Создание Zod-схем для фронтенда React (`frontend/src/schemas/docAstSchema.ts`).
- [x] **Task 2.7:** Создание эталонных JSON AST файлов для Курсовой, Реферата и ВКР.
- [x] **Task 2.8:** Юнит-тестирование Pydantic-валидации при некорректном JSON.

---

## Фаза 3: Биллинг, Эквайринг и Авторизация FastAPI (Auth & Payments)
- [x] **Task 3.1:** Настройка JWT авторизации в FastAPI (`python-jose`, хеширование `passlib`/`bcrypt`).
- [x] **Task 3.2:** Реализация эндпоинтов авторизации (`POST /api/v1/auth/register`, `POST /api/v1/auth/login`).
- [x] **Task 3.3:** Интеграция SDK эквайринга ЮKassa / CloudPayments в FastAPI.
- [x] **Task 3.4:** Эндпоинт создания платежной сессии (`POST /api/v1/payments/create`).
- [x] **Task 3.5:** Вебхук обработчик подписанных уведомлений эквайринга с валидацией HMAC (`POST /api/v1/payments/webhook`).
- [x] **Task 3.6:** Сервисный слой списания/пополнения кредитов с `SELECT FOR UPDATE` блокировкой.
- [x] **Task 3.7:** Интеграционное pytest-тестирование эндпоинтов оплаты.


---

## Фаза 4: Core DOCX Компилятор и TDD (Python DOCX Engine)
- [x] **Task 4.1:** Настройка тестового окружения TDD (`pytest`, `python-docx`, `lxml`) и базового класса `DocxCompiler`.
- [x] **Task 4.2:** TDD компилятора параметров страницы (A4, поля 30/10/20/20 мм, номер страницы на 1 стр.).
- [x] **Task 4.3:** TDD рендерера основного текста (Times New Roman 14pt, 1.5 интервал, 1.25 см красная строка, justification).
- [x] **Task 4.4:** TDD рендерера заголовков 1 и 2 уровня (ПРОПИСНЫЕ, по центру, `page_break_before = True`, 12pt отступы).
- [x] **Task 4.5:** TDD рендерера таблиц (Шапка по центру, границы 0.5pt, подпись `Таблица X.Y — ...`, `w:tblHeader`, `w:cantSplit`).
- [x] **Task 4.6:** TDD рендерера рисунков и диаграмм (Центрирование, подпись `Рисунок X.Y — ...`).
- [x] **Task 4.7:** TDD рендерера сносок (`w:footnote`, 10pt, одинарный интервал, отделительная черта 1.5 см).
- [x] **Task 4.8:** TDD рендерера формул (Бескаркасная таблица, формула по центру, номер `(1.1)` справа).
- [x] **Task 4.9:** TDD рендерера Приложений (`ПРИЛОЖЕНИЕ А`, справа/вверху, с новой страницы).
- [x] **Task 4.10:** TDD сборщика Титульного листа по шаблонам (Курсовая, Реферат, ВКР).

---

## Фаза 5: LLM Pipeline в FastAPI (Prompt Orchestration)
- [x] **Task 5.1:** Настройка абстракции LLM Провайдера (`httpx` / `openai` SDK).
- [x] **Task 5.2:** Реализация Exponential Backoff & Retry Policy через `tenacity` (до 5 попыток при 429/503).
- [x] **Task 5.3:** Реализация сервиса Outline Generator (Промпт 1 $\to$ JSON AST дерева).
- [x] **Task 5.4:** Реализация сервиса Introduction Generator (Промпт 2 $\to$ 6 обязательных блоков).
- [x] **Task 5.5:** Реализация сервиса Body Chapter Generator (Промпт 3 $\to$ Текст + Таблицы + Списки + Сноски).
- [x] **Task 5.6:** Реализация сервиса Conclusion Generator (Промпт 4 $\to$ Выводы по задачам).
- [x] **Task 5.7:** Реализация сервиса Bibliography Generator (Промпт 5 $\to$ ГОСТ Р 7.0.100-2018).
- [x] **Task 5.8:** Интеграция Sanitizer / Repair JSON модуля для автоматического исправления кривого JSON от LLM.

---

## Фаза 6: FastAPI API & Celery Фоновые Задачи (Backend Layer)
- [x] **Task 6.1:** Настройка Celery + Redis воркер-задач и брокера.
- [x] **Task 6.2:** Реализация сохранений чекпоинтов AST в Redis (`doc:{doc_id}:checkpoint`).
- [x] **Task 6.3:** Celery Task пошаговой генерации документа с публикацией прогресса через Redis Pub/Sub / WebSocket.
- [x] **Task 6.4:** WebSocket / SSE эндпоинт в FastAPI для стриминга статуса генерации (`/api/v1/ws/generation/{doc_id}`).
- [x] **Task 6.5:** Эндпоинт точечной перегенерации узла (`POST /api/v1/documents/{doc_id}/spot-regenerate`).
- [x] **Task 6.6:** Эндпоинт возобновления упавшей генерации с последнего чекпоинта (`POST /api/v1/documents/{doc_id}/resume`).
- [x] **Task 6.7:** Эндпоинт компиляции и скачивания готового `.docx` из S3 / Локального хранилища.
- [x] **Task 6.8:** Интеграционные pytest-тесты для FastAPI API (`TestClient` / `httpx`).

---

## Фаза 7: Frontend Разработка (React + Vite + TypeScript)
- [x] **Task 7.1:** Инициализация проекта Vite (`React + TypeScript`), Tailwind CSS, Shadcn UI.
- [x] **Task 7.2:** Разработка Wizard формы (Шаг 1: Исходные данные, тема, загрузка методички).
- [x] **Task 7.3:** Разработка интерактивного древовидного редактора Плана (React AST Tree Editor с Drag-and-Drop).
- [x] **Task 7.4:** Экран пошагового прогресса генерации с WebSocket логами и анимированным прогресс-баром.
- [x] **Task 7.5:** Разработка визуализатора страниц DOCX в браузере (Web DOCX Viewer A4).
- [x] **Task 7.6:** Реализация кнопки и модального окна точечной перегенерации узла (Spot Regeneration UI).
- [x] **Task 7.7:** Личный кабинет пользователя (История документов, Скачивание, Баланс кредитов).
- [x] **Task 7.8:** Виджет пополнения баланса и интеграция формы ЮKassa.
- [x] **Task 7.9:** Интеграция Zustand store для управления состоянием wizard и документа.

---

## Фаза 8: E2E Тестирование, Валидация ГОСТ и Релиз (QA & Launch)
- [ ] **Task 8.1:** End-to-End тестирование полного цикла (React UI $\to$ FastAPI API $\to$ Python DOCX Engine $\to$ Скачивание).
- [ ] **Task 8.2:** Автоматический аудит сгенерированных `.docx` файлов на соответствие ГОСТ 7.32-2017.
- [ ] **Task 8.3:** Нагрузочное тестирование FastAPI и Celery (50 одновременных генераций).
- [ ] **Task 8.4:** Проверка сгенерированного академического текста в антиплагиат-системах.
- [ ] **Task 8.5:** Настройка Dockerfile, Docker Compose и GitHub Actions.
- [ ] **Task 8.6:** Релиз системы AI GostDoc v1.0.
