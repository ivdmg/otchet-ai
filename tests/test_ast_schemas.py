import pytest
from pydantic import ValidationError
from app.schemas.ast import (
    NodeType,
    ListType,
    SourceType,
    ASTNode,
    SectionAST,
    ChapterAST,
    IntroductionAST,
    ConclusionAST,
    BibliographyItem,
    BibliographyAST,
    DocumentASTGraph,
    OutlineAST,
    OutlineChapterItem,
    OutlineSectionItem,
    TaskResultItem,
)

def test_outline_ast_valid():
    outline = OutlineAST(
        doc_type="coursework",
        title="Анализ алгоритмов машинного обучения",
        chapters=[
            OutlineChapterItem(
                title="Глава 1. Теоретические основы",
                sections=[
                    OutlineSectionItem(
                        title="1.1 Обзор базовых алгоритмов",
                        target_paragraphs=4,
                        include_table=False
                    )
                ]
            )
        ]
    )
    assert outline.doc_type == "coursework"
    assert outline.chapters[0].sections[0].target_paragraphs == 4

def test_introduction_ast_valid():
    intro = IntroductionAST(
        title="Введение",
        relevance_paragraphs=["Актуальность темы..."],
        object="Объект исследования",
        subject="Предмет исследования",
        goal="Цель исследования",
        tasks=["Задача 1", "Задача 2", "Задача 3"],
        methods=["Метод анализа", "Метод синтеза"]
    )
    assert intro.type == "INTRODUCTION"
    assert len(intro.tasks) == 3

def test_ast_nodes_valid():
    p_node = ASTNode(
        id="n_1",
        type=NodeType.PARAGRAPH,
        text="Текст первого абзаца."
    )
    tbl_node = ASTNode(
        id="n_2",
        type=NodeType.TABLE,
        caption="Таблица 1.1 — Сравнительный анализ",
        headers=["Показатель", "Значение"],
        rows=[["Метрика A", "100"], ["Метрика B", "200"]]
    )
    assert p_node.type == "paragraph"
    assert tbl_node.rows[0][0] == "Метрика A"

def test_full_document_ast_graph():
    doc_graph = DocumentASTGraph(
        doc_type="coursework",
        title="Разработка ИИ-систем",
        introduction=IntroductionAST(
            relevance_paragraphs=["Текст актуальности"],
            object="Объект",
            subject="Предмет",
            goal="Цель",
            tasks=["Задание 1", "Задание 2", "Задание 3"],
            methods=["Метод"]
        ),
        chapters=[
            ChapterAST(
                title="Глава 1",
                sections=[
                    SectionAST(
                        title="1.1 Раздел",
                        nodes=[
                            ASTNode(id="n1", type=NodeType.PARAGRAPH, text="Параграф 1")
                        ]
                    )
                ]
            )
        ],
        conclusion=ConclusionAST(
            task_results=[
                TaskResultItem(task_name="Задание 1", finding_text="Результат 1")
            ],
            final_summary_paragraphs=["Вывод"]
        ),
        bibliography=BibliographyAST(
            items=[
                BibliographyItem(
                    id="b1",
                    authors=["Иванов И.И."],
                    title="Основы ИИ",
                    source_type=SourceType.MONOGRAPH,
                    year=2023
                )
            ]
        )
    )
    assert doc_graph.title == "Разработка ИИ-систем"
    assert doc_graph.introduction.goal == "Цель"
    assert len(doc_graph.chapters) == 1
    assert doc_graph.bibliography.items[0].year == 2023

def test_ast_validation_error_on_invalid():
    with pytest.raises(ValidationError):
        ASTNode(id="n1", type="invalid_type")
