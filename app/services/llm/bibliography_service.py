import uuid
from typing import Optional

from app.schemas.ast import BibliographyAST, BibliographyItem, SourceType
from app.services.llm.client import LLMClient
from app.services.llm.retry import with_llm_retry
from app.services.llm.sanitizer import sanitize_and_parse_json


BIBLIOGRAPHY_SYSTEM_PROMPT = """You are a Senior Academic Bibliographer specializing in Russian GOST R 7.0.100-2018 standards.
Generate a list of {target_items} realistic academic sources for a {doc_type} on "{topic}".

REQUIREMENTS:
1. Include a balanced mix of monographs, peer-reviewed journal articles, regulatory/federal laws, and web sources.
2. source_type MUST be one of: "monograph", "article", "law", "web".
3. 70% of sources must have recent publication years (2020-2025).
4. Each item must have a unique 'id' (e.g. 'src_1', 'src_2').
5. Format authors, titles, publishers/journals, and pages/urls realistically per GOST R 7.0.100-2018.

REQUIRED JSON OUTPUT FORMAT:
{{
  "type": "BIBLIOGRAPHY",
  "title": "Список использованных источников",
  "items": [
    {{
      "id": "src_1",
      "authors": ["Иванов И. И.", "Петров П. П."],
      "title": "Автоматизация управления запасами в логистических системах",
      "source_type": "monograph",
      "publisher_or_journal": "М.: Издательство Юрайт",
      "year": 2023,
      "pages_or_url": "245 с."
    }},
    {{
      "id": "src_2",
      "authors": ["Сидоров С. С."],
      "title": "Анализ эффективности бизнес-процессов",
      "source_type": "article",
      "publisher_or_journal": "Журнал 'Вопросы экономики', № 4",
      "year": 2024,
      "pages_or_url": "С. 12-25"
    }}
  ]
}}
"""


class BibliographyGeneratorService:
    """
    Service responsible for generating GOST R 7.0.100-2018 compliant BibliographyAST.
    """

    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()

    @with_llm_retry
    async def generate_bibliography(
        self,
        topic: str,
        doc_type: str = "coursework",
        target_items: int = 15,
    ) -> BibliographyAST:
        """
        Generates BibliographyAST containing list of academic sources.
        """
        system_prompt = BIBLIOGRAPHY_SYSTEM_PROMPT.format(
            target_items=target_items,
            doc_type=doc_type,
            topic=topic,
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate bibliography for {doc_type}: '{topic}'"}
        ]

        raw_response = await self.llm_client.generate(
            messages=messages,
            json_mode=True,
        )

        data = sanitize_and_parse_json(raw_response)

        # Ensure source IDs are present if omitted

        if "items" in data and isinstance(data["items"], list):
            for idx, item in enumerate(data["items"]):
                if isinstance(item, dict) and not item.get("id"):
                    item["id"] = f"src_{idx + 1}"

        return BibliographyAST.model_validate(data)
