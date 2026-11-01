from enum import Enum
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class NodeType(str, Enum):
    PARAGRAPH = "paragraph"
    TABLE = "table"
    LIST = "list"
    FORMULA = "formula"
    FOOTNOTE = "footnote"


class ListType(str, Enum):
    BULLET = "bullet"
    NUMERIC = "numeric"


class SourceType(str, Enum):
    MONOGRAPH = "monograph"
    ARTICLE = "article"
    LAW = "law"
    WEB = "web"


class ASTNode(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    id: str = Field(..., description="Уникальный идентификатор узла AST")
    type: NodeType = Field(..., description="Тип узла: paragraph, table, list, formula, footnote")
    text: Optional[str] = Field(None, description="Текст параграфа или сноски")
    caption: Optional[str] = Field(None, description="Заголовок/подпись таблицы или рисунка")
    headers: Optional[List[str]] = Field(None, description="Заголовки колонок таблицы")
    rows: Optional[List[List[str]]] = Field(None, description="Строки таблицы")
    list_items: Optional[List[str]] = Field(None, description="Элементы списка")
    list_type: Optional[ListType] = Field(None, description="Тип списка: bullet или numeric")
    footnote_text: Optional[str] = Field(None, description="Текст сноски")
    formula_text: Optional[str] = Field(None, description="Математическая формула")
    formula_number: Optional[str] = Field(None, description="Номер формулы, например (1.1)")


class SectionAST(BaseModel):
    model_config = ConfigDict(extra="ignore")

    section_title: Optional[str] = Field(None, description="Название подраздела/секции")
    title: Optional[str] = Field(None, description="Альтернативное название подраздела")
    nodes: List[ASTNode] = Field(default_factory=list, description="Список узлов контента")

    def model_post_init(self, __context: Any) -> None:
        if not self.title and self.section_title:
            self.title = self.section_title
        elif not self.section_title and self.title:
            self.section_title = self.title


class ChapterAST(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = Field(..., description="Название главы")
    sections: List[SectionAST] = Field(default_factory=list, description="Список подразделов")


class OutlineSectionItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = Field(..., description="Название подраздела")
    target_paragraphs: int = Field(..., description="Целевое количество параграфов")
    include_table: bool = Field(False, description="Флаг необходимости таблицы")


class OutlineChapterItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = Field(..., description="Название главы")
    sections: List[OutlineSectionItem] = Field(..., description="Список подразделов")


class OutlineAST(BaseModel):
    model_config = ConfigDict(extra="ignore")

    doc_type: Literal["coursework", "abstract", "vkr"] = Field(..., description="Тип документа: coursework | abstract | vkr")
    title: str = Field(..., description="Тема работы")
    chapters: List[OutlineChapterItem] = Field(..., description="Список глав")


class IntroductionAST(BaseModel):
    model_config = ConfigDict(extra="ignore")

    type: Literal["INTRODUCTION"] = "INTRODUCTION"
    title: str = Field("Введение", description="Заголовок Введения")
    relevance_paragraphs: List[str] = Field(..., description="Параграфы актуальности")
    object: str = Field(..., description="Объект исследования")
    subject: str = Field(..., description="Предмет исследования")
    goal: str = Field(..., description="Цель исследования")
    tasks: List[str] = Field(..., description="Задачи исследования (3-4)")
    methods: List[str] = Field(..., description="Методы исследования")


class TaskResultItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    task_name: str = Field(..., description="Название задачи из Введения")
    finding_text: str = Field(..., description="Сформулированный вывод/результат")


class ConclusionAST(BaseModel):
    model_config = ConfigDict(extra="ignore")

    type: Literal["CONCLUSION"] = "CONCLUSION"
    title: str = Field("Заключение", description="Заголовок Заключения")
    task_results: List[TaskResultItem] = Field(..., description="Выводы по задачам")
    final_summary_paragraphs: List[str] = Field(..., description="Итоговые практические выводы")


class BibliographyItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(..., description="Идентификатор источника, например src_1")
    authors: List[str] = Field(..., description="Авторы источника")
    title: str = Field(..., description="Название книги/статьи/закона")
    source_type: SourceType = Field(..., description="Тип источника: monograph | article | law | web")
    publisher_or_journal: Optional[str] = Field(None, description="Издательство или журнал")
    year: int = Field(..., description="Год издания")
    pages_or_url: Optional[str] = Field(None, description="Страницы или URL")


class BibliographyAST(BaseModel):
    model_config = ConfigDict(extra="ignore")

    type: Literal["BIBLIOGRAPHY"] = "BIBLIOGRAPHY"
    title: str = Field("Список использованных источников", description="Заголовок списка литературы")
    items: List[BibliographyItem] = Field(..., description="Список источников")


class DocumentASTGraph(BaseModel):
    model_config = ConfigDict(extra="ignore")

    version: str = Field("1.0.0", description="Версия схемы AST Graph")
    doc_type: str = Field("coursework", description="Тип документа")
    title: str = Field(..., description="Тема работы")
    author_name: Optional[str] = Field(None, description="ФИО автора")
    institution: Optional[str] = Field(None, description="Учебное заведение / ВУЗ")
    city: Optional[str] = Field(None, description="Город")
    year: Optional[int] = Field(None, description="Год написания")
    introduction: Optional[IntroductionAST] = Field(None, description="Структура Введения")
    chapters: List[ChapterAST] = Field(default_factory=list, description="Главы и разделы")
    conclusion: Optional[ConclusionAST] = Field(None, description="Структура Заключения")
    bibliography: Optional[BibliographyAST] = Field(None, description="Список литературы")
    appendices: Optional[List[Dict[str, Any]]] = Field(None, description="Приложения")
