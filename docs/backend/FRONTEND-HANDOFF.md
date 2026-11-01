# Frontend handoff — актуально 02.11.2026

**Настоящая AI-генерация проверена в основном продукте.** Временная упрощённая техническая форма убрана. Действующий путь: `src/App.tsx → src/redesign/Studio.tsx → StudioWorkspace.tsx / ProductFlow.tsx`. Форма с типами работ и карточкой заказа, редактор плана, анимированная генерация, документ и библиотека используют исходные layout/classes/Chrome/AiOrb Studio. Нет отдельной тестовой страницы или второго приложения.

## Открыть / запустить

http://127.0.0.1:5173/ — основной продукт. API, один worker и Vite оставлены запущенными. В текущем браузере открыт генератор и сохранён вход тестового владельца; готовая работа находится в «Моих работах».

```powershell
Set-Location 'C:\Users\Ivan\Desktop\otchet ai'
./scripts/prototype-run.ps1
# Только при смене backend env:
./scripts/prototype-run.ps1 -RestartBackend
```

Ключ, предоставленный владельцем, установлен только в игнорируемый backend `.env` (`GROQ_API_KEY`). В исходниках frontend, bundle, Markdown и публичных env его нет. Vite loopback proxy подставляет уже существующий private gate только сервером. `.env` не отдаётся браузеру, auth cookie HttpOnly и CSRF сохранены. Не требуется вводить второй технический ключ. Production/public deployment не включён.

## Оплата для ручных тестов

По прямому разрешению владельца включён **`MOCK_PAYMENTS=true`**, только для закрытого локального прототипа. После утверждения плана кнопка «Тестовая оплата 300 ₽» явно объясняет имитацию и отсутствие списаний. Карта, ЮKassa и её реквизиты не нужны. AI при этом настоящий.

Это отдельный режим, не ЮKassa sandbox-success: order помечен `receipt_status=simulated_no_charge`, API отдаёт `payment_mode=personal_mock`, provider payment ID/checkout отсутствуют. Двойной клик возвращает тот же order/job. Такие заказы никогда не квалифицируют реферальную награду, не расходуют бонусы и не создают денежные refund intents. При сбое — `test_failed`, а не выдуманный денежный возврат. Конфигурация приложения вообще запрещает production; по умолчанию MOCK_PAYMENTS=false. Чтобы позже проверять настоящую тестовую ЮKassa: выключить флаг, добавить её test credentials и перезапустить backend. Реальные платёжные/referral правила не заменены имитацией.

## Подтверждённая живая проверка

Одна работа, чтобы сохранить владельцу квоту; дополнительные live-прогоны не запускались.

- Тема: «Сохранение данных в учебных информационных системах», тип реферат.
- Groq, `openai/gpt-oss-120b`, настоящий plan через worker: 298 reported tokens, 4 секунды.
- В браузере отредактированы заголовки, план сокращён до двух основных разделов и утверждён.
- Тестовая имитация оплаты запустила настоящий persistent job. Сохранены introduction, 2 раздела, conclusion, bibliography, validation и DOCX.
- Генерация текста: 5052 reported tokens, 122 секунды включая локальные rate-limit паузы. Всего **6 успешных AI-вызовов / 5350 токенов**; conservative charged тоже 5350, неизвестных оплаченных повторов нет. Точный остаток квоты аккаунта не запрашивался и не выдуман.
- Во время локального ограничения UI сохранял 42,5%, затем восстановил те же сохранённые этапы после reload; таймер не двигал процент.
- DOCX скачан кнопкой основного интерфейса: `C:/Users/Ivan/Downloads/gostdoc-750ddec2-92a4-42c2-9460-01b3beab3525.docx`.
- 41970 bytes, 10351 текстовый символ, 38 paragraphs. Открыт через python-docx; все реальные checkpoint paragraphs и отредактированные заголовки присутствуют; скачанные bytes совпадают с сохранёнными backend bytes/SHA256.
- Backend/worker перезапущены после готовности. Browser logout→login→«Мои работы»→открытие текста прошли; новый AI job не создавался и токены не увеличились.
- Реальный HTTP owner download/preview — 200; другой существующий пользователь document/download/preview — 404. Повторные чтения/скачивания/preview не вызывают AI.

Безопасное машинное доказательство: [evidence/live-generation.json](evidence/live-generation.json). Снимки: [библиотека](evidence/product-library-live.png), [документ](evidence/product-docx-live.png), [восстановленная форма](evidence/product-form-ready.png), [мобильная форма 390×844](evidence/product-form-mobile.png). Скриншот отдельно не является доказательством оплаты; финансовая часть здесь намеренно имитируется.

## Проверки кода

- `npm run build` (tsc -b + Vite) — PASS.
- `npm run typecheck` — PASS; `git diff --check` — PASS.
- `venv/Scripts/python.exe -m pytest tests_prototype -q` — **39 passed**, 1 upstream Starlette/httpx deprecation warning. В этих тестах PostgreSQL настоящий, внешние provider/gateway — explicit doubles. Live доказательство выше выполнено отдельно.
- Добавлены regression tests: mock order idempotency; нет referral reward при имитации; отказ cash refund; terminal mock failure без refund intent; owner preview/download. Standalone AI checkpoint runner также протестирован; для него live-вызовы повторно не тратились.
- Runtime/bundle checks: frontend слушает только 127.0.0.1:5173, direct API без private key — 403, Vite `/.env` — 403. Оба реальных секрета отсутствуют в dist assets.

## Важно для ручной проверки качества

Это короткий AI-черновик, не готовая к сдаче большая курсовая/ВКР. Библиография автоматически не проверяется; в полученном тексте есть позиции, требующие проверки и исправления. Никаких гарантий оценки/оригинальности/AI-detector. Предпросмотр показывает текст сохранённого DOCX; точную разбивку страниц/таблицы следует смотреть в Word. Титульник пока с обезличенными placeholder полями, пользовательские ФИО за границу не передаются.

Реферальный баланс/ссылка/история подключены к API, без подарочных остатков. Пять **настоящих** qualifying test ЮKassa покупок, реальные refunds и bonus-funded live job остаются отдельной будущей приёмкой: имитация не даёт основания закрыть их. Production продажи, касса, настоящая почта и hosting не включались. 3–5 дополнительных AI-работ сознательно не запускались по просьбе владельца сохранить квоту.

Чужие/untracked изменения сохранены; commit не создавался. Ни одного нового API-ключа агент не создавал.
