import json
import re
from typing import Any, Dict, Union, List

try:
    import json_repair
except ImportError:
    json_repair = None


def clean_markdown_fences(text: str) -> str:
    """
    Strips markdown codeblock fences (e.g. ```json ... ```) and leading/trailing non-JSON commentary.
    """
    text = text.strip()
    
    # Try finding explicit codeblock first
    codeblock_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.IGNORECASE)
    if codeblock_match:
        text = codeblock_match.group(1).strip()

    # Extract bounds from first '{' or '[' to last '}' or ']'
    first_dict = text.find("{")
    first_list = text.find("[")

    if first_dict != -1 and (first_list == -1 or first_dict < first_list):
        start = first_dict
        end = text.rfind("}")
    elif first_list != -1:
        start = first_list
        end = text.rfind("]")
    else:
        start, end = -1, -1

    if start != -1 and end != -1 and end > start:
        return text[start : end + 1]

    return text


def repair_json_string(text: str) -> str:
    """
    Cleans and repairs malformed JSON text string using json_repair or regex fallbacks.
    """
    cleaned = clean_markdown_fences(text)
    
    if json_repair is not None:
        try:
            repaired = json_repair.repair_json(cleaned)
            if isinstance(repaired, str) and repaired:
                return repaired
        except Exception:
            pass

    # Basic regex cleanup for trailing commas if json_repair isn't used or fails
    cleaned = re.sub(r",\s*([\}\]])", r"\1", cleaned)
    return cleaned


def sanitize_and_parse_json(text: str) -> Union[Dict[str, Any], List[Any]]:
    """
    Parses messy LLM response into a Python dict or list.
    Automatically repairs trailing commas, missing quotes/brackets, unescaped newlines, and markdown wrapper.
    """
    cleaned_text = clean_markdown_fences(text)

    # 1. First try standard json.loads
    try:
        return json.loads(cleaned_text)
    except json.JSONDecodeError:
        pass

    # 2. Try json_repair.loads if available
    if json_repair is not None:
        try:
            parsed = json_repair.loads(cleaned_text)
            if isinstance(parsed, (dict, list)):
                return parsed
        except Exception:
            pass

    # 3. Try repaired string with standard json.loads
    repaired = repair_json_string(cleaned_text)
    return json.loads(repaired)
