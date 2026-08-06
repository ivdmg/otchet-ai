import pytest
import docx
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from app.docx_engine.handlers.heading import render_heading


def test_render_heading_level_1():
    """Проверка заголовка 1 уровня (Глава/Раздел): ПРОПИСНЫЕ, центр, разрыв страницы, отступы."""
    doc = docx.Document()
    raw_text = "Глава 1. Теоретические основы."
    p = render_heading(doc, text=raw_text, level=1)

    assert p is not None
    # Точка в конце должна быть удалена, текст преобразован в ВЕРХНИЙ РЕГИСТР
    assert p.text == "ГЛАВА 1. ТЕОРЕТИЧЕСКИЕ ОСНОВЫ"

    # Разрыв страницы перед заголовком 1 уровня
    assert p.paragraph_format.page_break_before is True

    # Выравнивание по центру
    assert p.alignment == WD_ALIGN_PARAGRAPH.CENTER

    # Без красной строки
    assert p.paragraph_format.first_line_indent == Cm(0)

    # Отступы: До = 0pt, После = 12pt
    assert p.paragraph_format.space_before == Pt(0)
    assert p.paragraph_format.space_after == Pt(12)

    # свойства шрифта
    assert len(p.runs) == 1
    run = p.runs[0]
    assert run.font.name == "Times New Roman"
    assert run.font.size == Pt(14)
    assert run.font.bold is True
    assert run.font.color.rgb == RGBColor(0, 0, 0)


def test_render_heading_level_2():
    """Проверка заголовка 2 уровня (Подраздел): С красной строки, отступы 12pt до и после."""
    doc = docx.Document()
    raw_text = "1.1 Сущность и экономическое значение."
    p = render_heading(doc, text=raw_text, level=2)

    assert p is not None
    # Точка в конце удалена, регистр сохранен
    assert p.text == "1.1 Сущность и экономическое значение"

    # БЕЗ принудительного разрыва страницы
    assert p.paragraph_format.page_break_before is False

    # С красной строки (1.25 см)
    assert p.paragraph_format.first_line_indent is not None
    assert abs(p.paragraph_format.first_line_indent.cm - 1.25) < 0.05

    # Отступы: До = 12pt, После = 12pt
    assert p.paragraph_format.space_before == Pt(12)
    assert p.paragraph_format.space_after == Pt(12)

    # Шрифт
    run = p.runs[0]
    assert run.font.name == "Times New Roman"
    assert run.font.size == Pt(14)
    assert run.font.bold is True
    assert run.font.color.rgb == RGBColor(0, 0, 0)
