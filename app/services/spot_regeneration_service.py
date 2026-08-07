import json
import logging
from typing import Dict, Any, Optional, Tuple, List, Union
from pydantic import BaseModel

from app.schemas.ast import ASTNode, DocumentASTGraph
from app.services.llm.client import LLMClient
from app.services.llm.retry import with_llm_retry
from app.services.llm.sanitizer import sanitize_and_parse_json

logger = logging.getLogger(__name__)

SPOT_REGEN_SYSTEM_PROMPT = """You are an expert Academic Editor specializing in GOST 7.32-2017 compliant documents.
Your task is to targetedly regenerate or rewrite a single document AST Node based on the context of neighboring nodes and user instruction.

CONTEXT:
- Target Node ID: "{node_id}"
- Current Target Node Content: {target_node_json}
- Previous Neighboring Node Content: {prev_node_json}
- Next Neighboring Node Content: {next_node_json}
- User Special Instruction: "{user_instruction}"

RULES:
1. Maintain strict academic Russian style without clichés.
2. Ensure fluent logical transitions connecting the previous node context to the next node context.
3. Output MUST be strictly formatted as valid JSON representing an ASTNode object with id "{node_id}".
4. Do NOT output markdown fences outside JSON.

REQUIRED JSON ASTNode FORMAT:
{{
  "id": "{node_id}",
  "type": "paragraph",
  "text": "Обновленный академический текст узла..."
}}
"""


class SpotRegenerationService:
    @staticmethod
    def find_node_and_neighbors(
        ast_dict: Dict[str, Any],
        target_id: str,
    ) -> Optional[Tuple[Dict[str, Any], Optional[Dict[str, Any]], Optional[Dict[str, Any]], List[Dict[str, Any]], int]]:
        """
        Traverses Document AST graph to locate target node, its previous neighbor,
        its next neighbor, the containing nodes list, and its index.
        Returns (target_node, prev_node, next_node, container_list, node_index) or None if not found.
        """
        # Helper to search inside a list of node dicts
        def search_in_node_list(node_list: List[Dict[str, Any]]) -> Optional[Tuple[Dict[str, Any], Optional[Dict[str, Any]], Optional[Dict[str, Any]], List[Dict[str, Any]], int]]:
            if not isinstance(node_list, list):
                return None
            for idx, item in enumerate(node_list):
                if isinstance(item, dict) and item.get("id") == target_id:
                    prev_node = node_list[idx - 1] if idx > 0 else None
                    next_node = node_list[idx + 1] if idx < len(node_list) - 1 else None
                    return item, prev_node, next_node, node_list, idx
            return None

        # 1. Search in Body Chapters -> Sections -> Nodes
        chapters = ast_dict.get("chapters", [])
        if isinstance(chapters, list):
            for chap in chapters:
                if isinstance(chap, dict):
                    sections = chap.get("sections", [])
                    if isinstance(sections, list):
                        for sec in sections:
                            if isinstance(sec, dict):
                                nodes = sec.get("nodes", [])
                                res = search_in_node_list(nodes)
                                if res:
                                    return res

        # 2. Search in Bibliography items
        bib = ast_dict.get("bibliography", {})
        if isinstance(bib, dict):
            items = bib.get("items", [])
            res = search_in_node_list(items)
            if res:
                return res

        return None

    def __init__(self, llm_client: Optional[LLMClient] = None):
        self.llm_client = llm_client or LLMClient()

    @with_llm_retry
    async def regenerate_node(
        self,
        ast_dict: Dict[str, Any],
        target_id: str,
        user_instruction: Optional[str] = None,
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Regenerates target AST node using LLM, updates AST graph dict,
        and returns (updated_ast_dict, new_node_dict).
        """
        found = self.find_node_and_neighbors(ast_dict, target_id)
        if not found:
            raise ValueError(f"AST Node with id '{target_id}' not found in document graph")

        target_node, prev_node, next_node, container, idx = found

        system_prompt = SPOT_REGEN_SYSTEM_PROMPT.format(
            node_id=target_id,
            target_node_json=json.dumps(target_node, ensure_ascii=False),
            prev_node_json=json.dumps(prev_node, ensure_ascii=False) if prev_node else "None",
            next_node_json=json.dumps(next_node, ensure_ascii=False) if next_node else "None",
            user_instruction=user_instruction or "Улучшить академический стиль и точность",
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Regenerate node '{target_id}'"}
        ]

        raw_response = await self.llm_client.generate(
            messages=messages,
            json_mode=True,
        )

        new_node_dict = sanitize_and_parse_json(raw_response)
        if not isinstance(new_node_dict, dict):
            raise ValueError("Invalid LLM response: expected JSON object")

        # Preserve node ID
        new_node_dict["id"] = target_id
        # Replace in container list
        container[idx] = new_node_dict

        return ast_dict, new_node_dict
