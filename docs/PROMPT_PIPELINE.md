# Спецификация Промпт-Цепочки LLM (PROMPT_PIPELINE.md)

Настоящий документ содержит архитектурную спецификацию промпт-цепочки (Prompt Chain Architecture) для модели LLM в системе **AI GostDoc**. Промпты спроектированы для гарантированного получения валидного JSON Graph AST без клише и "воды".

---

## 1. Общие принципы и Глобальные Негативные Ограничения (Global Negative Constraints)

Все промпты системы наследуют базовые ограничения для прохождения антиплагиат-детекторов и соответствия научному стилю речи:

### Глобальный список запрещенных фраз и слов-клише (Blacklist):
* `В данном исследовании...` / `В этой работе...` / `В рамках данной статьи...`
* `Важно отметить...` / `Необходимо подчеркнуть...` / `Следует обратить внимание...`
* `Таким образом, подводя итоги...` / `Как видно из всего вышесказанного...`
* `Безусловно...` / `Несомненно...` / `Является актуальной темой...`
* `В современном мире...` / `С каждым днем все больше...`
* Использование местоимений первого лица (`я`, `мы`, `наш`). Разрешен строго обезличенный научный стиль (`рассмотрено`, `проанализировано`, `установлено`).

---

## 2. Промпт 1: Outline Generator (Генератор Плана Документа)

Промпт предназначен для первоначальной генерации подробного дерева структурных элементов академической работы.

### System Prompt
```text
You are an expert Academic Architect specializing in Russian educational standards (GOST 7.32-2017).
Your task is to design a strict, logically complete document outline (AST tree) for a {doc_type} on the topic: "{topic}".
Target page count: {target_pages} pages.

RULES:
1. Divide the work into Introduction, 2-3 logical Chapters (each having 2-3 Sections), Conclusion, and Bibliography.
2. Ensure each section topic logically develops the main theme without overlaps.
3. Output MUST be strictly formatted as JSON conforming to the requested schema. Do not add any markdown commentary outside JSON.
```

### Output JSON Schema (Pydantic / JSON Schema)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "OutlineASTSchema",
  "type": "object",
  "properties": {
    "doc_type": { "type": "string", "enum": ["coursework", "abstract", "vkr"] },
    "title": { "type": "string" },
    "chapters": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "title": { "type": "string" },
          "sections": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": { "type": "string" },
                "target_paragraphs": { "type": "integer" },
                "include_table": { "type": "boolean" }
              },
              "required": ["title", "target_paragraphs", "include_table"]
            }
          }
        },
        "required": ["title", "sections"]
      }
    }
  },
  "required": ["doc_type", "title", "chapters"]
}
```

---

## 3. Промпт 2: Introduction Generator (Генератор Введения)

Специфический промпт для выстраивания классической структуры Введения по ГОСТ.

### System Prompt
```text
You are a Senior Academic Researcher. Generate a formal, highly academic Introduction (Введение) for a {doc_type} titled: "{topic}".

MANDATORY 6 STRUCTURAL BLOCKS (Each must be clearly detailed):
1. Relevance (Актуальность темы): Current state of research, systemic problem.
2. Object of Research (Объект исследования): The system or phenomenon being analyzed.
3. Subject of Research (Предмет исследования): Specific characteristics or relations analyzed within the object.
4. Goal (Цель исследования): What the work aims to achieve.
5. Tasks (Задачи исследования): Exactly 3-4 sequential tasks required to fulfill the goal.
6. Methods (Методы исследования): Scientific techniques used (e.g., analysis, synthesis, comparative method).

NEGATIVE CONSTRAINTS:
- Do NOT use filler words or AI clichés listed in the global blacklist.
- Do NOT write vague general statements.
- Output MUST be valid JSON conforming to the schema below.
```

### Output JSON Schema
```json
{
  "title": "IntroductionASTSchema",
  "type": "object",
  "properties": {
    "type": { "type": "string", "const": "INTRODUCTION" },
    "title": { "type": "string", "default": "Введение" },
    "relevance_paragraphs": { "type": "array", "items": { "type": "string" } },
    "object": { "type": "string" },
    "subject": { "type": "string" },
    "goal": { "type": "string" },
    "tasks": { "type": "array", "items": { "type": "string" }, "minItems": 3, "maxItems": 4 },
    "methods": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["type", "title", "relevance_paragraphs", "object", "subject", "goal", "tasks", "methods"]
}
```

---

## 4. Промпт 3: Body Chapter Generator (Генератор Текста Раздела / Таблиц / Списков)

Промпт генерирует фрагменты текста для параграфов с автоматическим включением структурных узлов (таблицы, списки, сноски).

### System Prompt
```text
You are a Principal Academic Author. Write section "{section_title}" for Chapter "{chapter_title}" in a {doc_type} on "{topic}".

CONTEXT & MEMORY:
- Previous section context: "{previous_section_summary}"
- Global research goal: "{research_goal}"

REQUIREMENTS:
1. Write 4-6 deep, academically dense paragraphs using precise scientific terminology.
2. If include_table is TRUE, synthesize a relevant data table with realistic statistical or theoretical analytical indicators.
3. Include at least 1 formatted bulleted or numbered list where appropriate.
4. Add footnote references where factual data or citations are mentioned.

NEGATIVE CONSTRAINTS:
- ABSOLUTELY NO AI CLICHÉS ("В данном исследовании...", "Важно отметить...").
- No empty sentences; every paragraph must contain factual reasoning, definitions, or analytical data.
```

### Output JSON Schema
```json
{
  "title": "SectionNodesASTSchema",
  "type": "object",
  "properties": {
    "section_title": { "type": "string" },
    "nodes": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string", "enum": ["paragraph", "table", "list", "formula", "footnote"] },
          "text": { "type": "string" },
          "caption": { "type": "string" },
          "headers": { "type": "array", "items": { "type": "string" } },
          "rows": { "type": "array", "items": { "type": "array", "items": { "type": "string" } } },
          "list_items": { "type": "array", "items": { "type": "string" } },
          "list_type": { "type": "string", "enum": ["bullet", "numeric"] },
          "footnote_text": { "type": "string" }
        },
        "required": ["id", "type"]
      }
    }
  },
  "required": ["section_title", "nodes"]
}
```

---

## 5. Промпт 4: Conclusion Generator (Генератор Заключения)

Промпт генерирует Заключение, где каждый вывод соотносится с конкретной задачей из Введения.

### System Prompt
```text
You are an Academic Evaluator. Generate the Conclusion (Заключение) for the document on "{topic}".

INPUT CONTEXT:
- Tasks defined in Introduction: {tasks_list}
- Summaries of Chapters: {chapters_summary}

RULES:
1. Provide a clear, structured summary of findings corresponding sequentially to each Task defined in the Introduction.
2. Formulate 3-4 major practical recommendations or theoretical generalizations.
3. Output MUST be valid JSON conforming to the schema below.

NEGATIVE CONSTRAINTS:
- Do NOT use phrases like "В итоге можно сказать..." or "Таким образом, подводя итоги...".
```

### Output JSON Schema
```json
{
  "title": "ConclusionASTSchema",
  "type": "object",
  "properties": {
    "type": { "type": "string", "const": "CONCLUSION" },
    "title": { "type": "string", "default": "Заключение" },
    "task_results": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "task_name": { "type": "string" },
          "finding_text": { "type": "string" }
        },
        "required": ["task_name", "finding_text"]
      }
    },
    "final_summary_paragraphs": { "type": "array", "items": { "type": "string" } }
  },
  "required": ["type", "title", "task_results", "final_summary_paragraphs"]
}
```

---

## 6. Промпт 5: Bibliography Generator (Генератор Списка Литературы ГОСТ 7.0.100-2018)

Промпт генерирует список из 15–25 актуальных академических источников в строгом соответствии с ГОСТ Р 7.0.100-2018.

### System Prompt
```text
You are a Senior Bibliographer. Generate a list of 15 to 20 realistic academic sources (monographs, peer-reviewed journal articles, regulatory acts, official statistics) for a research paper on "{topic}".

REQUIREMENTS:
1. Sources must be formatted strictly according to GOST R 7.0.100-2018.
2. Years of publication: 70% must be recent (2020-2025).
3. Include relevant Russian federal laws or regulatory codes if applicable to the topic.
4. Alphabetical ordering: Russian sources first, followed by English/foreign sources.

NEGATIVE CONSTRAINTS:
- Do NOT make up invalid ISBNs or impossible URL syntax.
```

### Output JSON Schema
```json
{
  "title": "BibliographyASTSchema",
  "type": "object",
  "properties": {
    "type": { "type": "string", "const": "BIBLIOGRAPHY" },
    "title": { "type": "string", "default": "Список использованных источников" },
    "items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "authors": { "type": "array", "items": { "type": "string" } },
          "title": { "type": "string" },
          "source_type": { "type": "string", "enum": ["monograph", "article", "law", "web"] },
          "publisher_or_journal": { "type": "string" },
          "year": { "type": "integer" },
          "pages_or_url": { "type": "string" }
        },
        "required": ["id", "authors", "title", "source_type", "year"]
      }
    }
  },
  "required": ["type", "title", "items"]
}
```
