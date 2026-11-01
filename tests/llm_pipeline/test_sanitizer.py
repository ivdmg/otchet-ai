import pytest
from app.services.llm.sanitizer import (
    clean_markdown_fences,
    repair_json_string,
    sanitize_and_parse_json,
)


def test_clean_markdown_fences():
    raw_markdown = """Here is the JSON output:
```json
{
  "title": "Test Document",
  "status": "ok"
}
```
Hope this helps!"""
    cleaned = clean_markdown_fences(raw_markdown)
    assert cleaned.startswith("{")
    assert cleaned.endswith("}")
    assert '"title": "Test Document"' in cleaned


def test_repair_trailing_commas():
    malformed_json = """{
        "doc_type": "coursework",
        "title": "Topic",
        "items": [
            "item1",
            "item2",
        ],
    }"""
    parsed = sanitize_and_parse_json(malformed_json)
    assert isinstance(parsed, dict)
    assert parsed["doc_type"] == "coursework"
    assert len(parsed["items"]) == 2


def test_repair_broken_json_quotes_and_brackets():
    broken_json = """
    Here is your JSON:
    ```
    {
        "name": "Academic Paper",
        "tags": ["gost", "research",]
    ```
    """
    parsed = sanitize_and_parse_json(broken_json)
    assert isinstance(parsed, dict)
    assert parsed["name"] == "Academic Paper"
    assert "gost" in parsed["tags"]


def test_sanitize_and_parse_json_list():
    raw_list_json = """
    [
        {"id": 1, "name": "first"},
        {"id": 2, "name": "second"},
    ]
    """
    parsed = sanitize_and_parse_json(raw_list_json)
    assert isinstance(parsed, list)
    assert len(parsed) == 2
    assert parsed[0]["name"] == "first"
