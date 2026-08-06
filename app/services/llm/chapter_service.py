import uuid
from typing import List, Optional

from app.schemas.ast import SectionAST, ASTNode, NodeType
from app.services.llm.client import LLMClient
from app.services.llm.retry import with_llm_retry
from app.services.llm.sanitizer import sanitize_and_parse_json



CHAPTER_SECTION_SYSTEM_PROMPT = """You are a Principal Academic Author specializing in Russian academic standards (GOST 7.32-2017).
Write section "{section_title}" for Chapter "{chapter_title}" in a {doc_type} on "{topic}".

CONTEXT & MEMORY:
- Previous section context: "{previous_section_summary}"
- Global research goal: "{research_goal}"

REQUIREMENTS:
1. Write 4-6 deep, academically dense paragraphs using precise scientific terminology.
2. If include_table is TRUE (include_table: {include_table}), synthesize a relevant data table with realistic analytical or theoretical indicators.
3. Include at least 1 formatted bulleted or numbered list where appropriate.
4. Add footnote references where factual data or citations are mentioned.
5. Provide unique 'id' strings for each node (e.g. 'node_1', 'node_2', or UUIDs).

GLOBAL BLACKLIST (DO NOT USE THESE PHRASES OR CLICHÉS):
- "В данном исследовании...", "В этой работе...", "В рамках данной статьи..."
- "Важно отметить...", "Необходимо подчеркнуть...", "Следует обратить внимание..."
- "Таким образом, подводя итоги...", "Как видно из всего вышесказанного..."
- "Безусловно...", "Несомненно...", "Является актуальной темой..."
- "В современном мире...", "С каждым днем все больше..."
- Do NOT use 1st person pronouns ("я", "мы", "наш"). Use formal impersonal Russian academic style.

REQUIRED JSON OUTPUT FORMAT:
{{
  "section_title": "{section_title}",
  "nodes": [
    {{
      "id": "node_1",
      "type": "paragraph",
      "text": "Первый глубокий научный параграф раздела..."
    }},
    {{
      "id": "node_2",
      "type": "table",
      "caption": "Таблица 1.1 — Аналитические показатели...",
      "headers": ["Показатель", "2022 г.", "2023 г.", "Отклонение"],
      "rows": [
        ["Объем запасов (млн руб.)", "12.5", "14.2", "+1.7"],
        ["Оборачиваемость (дней)", "45", "38", "-7"]
      ]
    }},
    {{
      "id": "node_3",
      "type": "list",
      "list_type": "bullet",
      "list_items": [
        "Первый ключевой фактор...",
        "Второй ключевой фактор..."
      ]
    }},
    {{
      "id": "node_4",
      "type": "footnote",
      "footnote_text": "См. официальный отчет Федеральной службы государственной статистики..."
    }}
  ]
}}
"""


class ChapterGeneratorService:
    """
    Service responsible for generating detailed body section nodes (SectionAST) with text, tables, lists, and footnotes.
    """

    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()

    @with_llm_retry
    async def generate_section(
        self,
        section_title: str,
        chapter_title: str,
        topic: str,
        doc_type: str = "coursework",
        include_table: bool = False,
        research_goal: str = "",
        previous_section_summary: str = "",
    ) -> SectionAST:
        """
        Generates SectionAST containing paragraphs, tables, lists, and footnotes.
        """
        system_prompt = CHAPTER_SECTION_SYSTEM_PROMPT.format(
            section_title=section_title,
            chapter_title=chapter_title,
            doc_type=doc_type,
            topic=topic,
            previous_section_summary=previous_section_summary or "Начало работы",
            research_goal=research_goal or "Исследование темы",
            include_table=str(include_table).upper(),
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Write section: '{section_title}'"}
        ]

        raw_response = await self.llm_client.generate(
            messages=messages,
            json_mode=True,
        )

        data = sanitize_and_parse_json(raw_response)

        # Ensure node IDs are present if LLM omitted them

        if "nodes" in data and isinstance(data["nodes"], list):
            for idx, node in enumerate(data["nodes"]):
                if isinstance(node, dict) and not node.get("id"):
                    node["id"] = f"node_{idx + 1}_{uuid.uuid4().hex[:6]}"

        return SectionAST.model_validate(data)
