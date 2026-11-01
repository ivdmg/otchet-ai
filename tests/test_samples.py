import os
import json
from app.schemas.ast import DocumentASTGraph

def test_coursework_sample_valid():
    file_path = os.path.join("samples", "ast_samples", "coursework_sample.json")
    assert os.path.exists(file_path), "coursework_sample.json must exist"
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    doc_graph = DocumentASTGraph.model_validate(data)
    assert doc_graph.doc_type == "coursework"
    assert len(doc_graph.chapters) >= 2
    assert doc_graph.introduction is not None
    assert doc_graph.conclusion is not None
    assert doc_graph.bibliography is not None

def test_abstract_sample_valid():
    file_path = os.path.join("samples", "ast_samples", "abstract_sample.json")
    assert os.path.exists(file_path), "abstract_sample.json must exist"
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    doc_graph = DocumentASTGraph.model_validate(data)
    assert doc_graph.doc_type == "abstract"
    assert len(doc_graph.chapters) >= 1
    assert doc_graph.introduction is not None

def test_vkr_sample_valid():
    file_path = os.path.join("samples", "ast_samples", "vkr_sample.json")
    assert os.path.exists(file_path), "vkr_sample.json must exist"
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    doc_graph = DocumentASTGraph.model_validate(data)
    assert doc_graph.doc_type == "vkr"
    assert len(doc_graph.chapters) >= 3
    assert doc_graph.introduction is not None
