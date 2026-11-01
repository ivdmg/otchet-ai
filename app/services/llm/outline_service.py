import json
import re
from typing import Optional

from app.schemas.ast import OutlineAST
from app.services.llm.client import LLMClient
from app.services.llm.retry import with_llm_retry
from app.services.llm.sanitizer import sanitize_and_parse_json

OUTLINE_SYSTEM_PROMPT = """You are an expert Academic Architect specializing in Russian educational standards (GOST 7.32-2017).
Your task is to design a strict, logically complete document outline (AST tree) for a {doc_type} on the topic: "{topic}".
Target page count: {target_pages} pages.

RULES:
1. Divide the work into 2-3 logical Chapters (each having 2-3 Sections).
2. Ensure each section topic logically develops the main theme without overlaps.
3. Output MUST be strictly formatted as JSON conforming to the requested schema. Do not add any markdown commentary outside JSON.

GLOBAL BLACKLIST (DO NOT USE THESE PHRASES OR CLICHÉS):
- "В данном исследовании...", "В этой работе...", "В рамках данной статьи..."
- "Важно отметить...", "Необходимо подчеркнуть...", "Следует обратить внимание..."
- "Таким образом, подводя итоги...", "Как видно из всего вышесказанного..."
- "Безусловно...", "Несомненно...", "Является актуальной темой..."
- "В современном мире...", "С каждым днем все больше..."
- Do NOT use 1st person pronouns ("я", "мы", "наш"). Use formal impersonal Russian academic style.

REQUIRED JSON FORMAT:
{{
  "doc_type": "{doc_type}",
  "title": "{topic}",
  "chapters": [
    {{
      "title": "Глава 1. ...",
      "sections": [
        {{
          "title": "1.1. ...",
          "target_paragraphs": 4,
          "include_table": true
        }}
      ]
    }}
  ]
}}
"""


def _extract_json_payload(text: str) -> str:
    """Strip markdown codeblocks if present."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return match.group(1)
    # If starting with { and ending with }, take as is
    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        return text[first_brace:last_brace + 1]
    return text


class OutlineGeneratorService:
    """
    Service responsible for generating document outlines (OutlineAST) using LLM.
    """

    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()

    @with_llm_retry
    async def generate_outline(
        self,
        topic: str,
        doc_type: str = "coursework",
        target_pages: int = 25,
    ) -> OutlineAST:
        """
        Generates structured OutlineAST tree for a given topic and document type.
        """
        system_prompt = OUTLINE_SYSTEM_PROMPT.format(
            doc_type=doc_type,
            topic=topic,
            target_pages=target_pages,
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Generate outline for {doc_type}: '{topic}'"}
        ]

        raw_response = await self.llm_client.generate(
            messages=messages,
            json_mode=True,
        )

        data = sanitize_and_parse_json(raw_response)
        return OutlineAST.model_validate(data)

