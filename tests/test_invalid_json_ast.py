import pytest
from pydantic import ValidationError
from app.schemas.ast import (
    DocumentASTGraph,
    ASTNode,
    NodeType,
    IntroductionAST,
    ConclusionAST,
    BibliographyItem,
    OutlineAST,
)

def test_invalid_json_syntax():
    invalid_json_str = '{"doc_type": "coursework", "title": "Test", '  # truncated JSON
    with pytest.raises(ValidationError):
        DocumentASTGraph.model_validate_json(invalid_json_str)

def test_missing_top_level_required_fields():
    # 'title' is required in DocumentASTGraph
    invalid_data = {
        "version": "1.0.0",
        "doc_type": "coursework"
    }
    with pytest.raises(ValidationError) as exc_info:
        DocumentASTGraph.model_validate(invalid_data)
    errors = exc_info.value.errors()
    assert any(err["loc"] == ("title",) for err in errors)

def test_invalid_node_type():
    invalid_node_data = {
        "id": "node_1",
        "type": "video_clip",  # invalid node type
        "text": "Some text"
    }
    with pytest.raises(ValidationError) as exc_info:
        ASTNode.model_validate(invalid_node_data)
    errors = exc_info.value.errors()
    assert any(err["loc"] == ("type",) for err in errors)

def test_invalid_list_type_in_node():
    invalid_node_data = {
        "id": "node_2",
        "type": "list",
        "list_items": ["Item 1", "Item 2"],
        "list_type": "alphabetical"  # only 'bullet' or 'numeric' allowed
    }
    with pytest.raises(ValidationError) as exc_info:
        ASTNode.model_validate(invalid_node_data)
    errors = exc_info.value.errors()
    assert any(err["loc"] == ("list_type",) for err in errors)

def test_incomplete_introduction_structure():
    # Introduction requires relevance_paragraphs, object, subject, goal, tasks, methods
    incomplete_intro = {
        "type": "INTRODUCTION",
        "title": "Введение",
        "goal": "Цель работы"
        # missing relevance_paragraphs, object, subject, tasks, methods
    }
    with pytest.raises(ValidationError) as exc_info:
        IntroductionAST.model_validate(incomplete_intro)
    error_locs = [err["loc"][0] for err in exc_info.value.errors()]
    assert "object" in error_locs
    assert "subject" in error_locs
    assert "tasks" in error_locs
    assert "methods" in error_locs

def test_invalid_bibliography_source_type():
    invalid_bib_item = {
        "id": "src_99",
        "authors": ["Автор А.А."],
        "title": "Интервью на радио",
        "source_type": "podcast",  # only 'monograph', 'article', 'law', 'web'
        "year": 2025
    }
    with pytest.raises(ValidationError) as exc_info:
        BibliographyItem.model_validate(invalid_bib_item)
    errors = exc_info.value.errors()
    assert any(err["loc"] == ("source_type",) for err in errors)

def test_invalid_outline_doc_type():
    invalid_outline = {
        "doc_type": "essay",  # only 'coursework', 'abstract', 'vkr'
        "title": "Эссе на тему ИИ",
        "chapters": []
    }
    with pytest.raises(ValidationError) as exc_info:
        OutlineAST.model_validate(invalid_outline)
    errors = exc_info.value.errors()
    assert any(err["loc"] == ("doc_type",) for err in errors)
