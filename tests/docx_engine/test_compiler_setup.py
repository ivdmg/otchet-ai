import io
import pytest
import docx
from lxml import etree

from app.docx_engine.compiler import DocxCompiler
from app.schemas.ast import DocumentASTGraph


def test_environment_libraries():
    """Проверка доступности python-docx и lxml."""
    doc = docx.Document()
    assert doc is not None

    # В lxml и python-docx элементы создаются с использованием пространства имен или OxmlElement
    from docx.oxml import OxmlElement
    element = OxmlElement("w:p")
    assert element is not None
    assert "p" in element.tag


def test_docx_compiler_initialization():
    """Проверка инициализации класса DocxCompiler."""
    compiler = DocxCompiler()
    assert compiler.doc is not None
    assert isinstance(compiler.doc, docx.document.Document)


def test_docx_compiler_with_ast():
    """Проверка передачи AST в DocxCompiler."""
    ast = DocumentASTGraph(
        title="Тестовая работа",
        doc_type="coursework"
    )
    compiler = DocxCompiler(ast=ast)
    assert compiler.ast == ast


def test_docx_compiler_compile_and_bytes():
    """Проверка компиляции и выгрузки байтов документа."""
    compiler = DocxCompiler()
    doc = compiler.compile()
    assert doc is not None

    docx_bytes = compiler.get_bytes()
    assert isinstance(docx_bytes, bytes)
    assert len(docx_bytes) > 0

    # Проверка, что байты открываются как валидный docx документ
    reopened_doc = docx.Document(io.BytesIO(docx_bytes))
    assert reopened_doc is not None
