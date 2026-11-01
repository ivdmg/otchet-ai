import io
from typing import Optional, Union, Dict, Any
from pathlib import Path
import docx
from docx.document import Document

from app.schemas.ast import DocumentASTGraph
from app.docx_engine.page_setup import apply_page_setup
from app.docx_engine.handlers.title_page import render_title_page


class DocxCompiler:
    """
    Базовый компилятор документов DOCX по стандарту ГОСТ.
    Принимает AST Graph (DocumentASTGraph или dict) и собирает готовый .docx файл.
    """

    def __init__(self, ast: Optional[Union[DocumentASTGraph, Dict[str, Any]]] = None):
        if isinstance(ast, dict):
            self.ast = DocumentASTGraph.model_validate(ast)
        else:
            self.ast = ast

        self.doc: Document = docx.Document()

    def compile(self) -> Document:
        """
        Основной метод сборки документа.
        Настраивает параметры страницы, титульный лист и узлы AST.
        """
        apply_page_setup(self.doc)

        if self.ast:
            if self.ast.title:
                self.doc.core_properties.title = self.ast.title
            render_title_page(self.doc, ast=self.ast)

        return self.doc

    def get_bytes(self) -> bytes:
        """
        Возвращает бинарные данные .docx документа в виде байтов.
        """
        self.compile()
        buffer = io.BytesIO()
        self.doc.save(buffer)
        return buffer.getvalue()

    def save(self, target: Union[str, Path, io.BytesIO]) -> None:
        """
        Сохраняет документ по указанному пути или в файловый поток.
        """
        self.compile()
        self.doc.save(target)
