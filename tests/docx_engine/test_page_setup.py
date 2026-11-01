import pytest
import docx
from docx.shared import Mm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

from app.docx_engine.compiler import DocxCompiler
from app.docx_engine.page_setup import apply_page_setup


def test_page_margins_and_dimensions():
    """Проверка размеров страницы A4 и полей по ГОСТ (30/10/20/20 мм)."""
    doc = docx.Document()
    apply_page_setup(doc)

    section = doc.sections[0]
    
    # Сравнение с погрешностью в 1-2 EMU/отсчета Mm
    assert abs(section.page_width.mm - 210.0) < 0.1
    assert abs(section.page_height.mm - 297.0) < 0.1

    assert abs(section.left_margin.mm - 30.0) < 0.1
    assert abs(section.right_margin.mm - 10.0) < 0.1
    assert abs(section.top_margin.mm - 20.0) < 0.1
    assert abs(section.bottom_margin.mm - 20.0) < 0.1


test_different_first_page = True


def test_different_first_page_header_footer():
    """Проверка скрытия колонтитула (номера страницы) на 1-й странице."""
    doc = docx.Document()
    apply_page_setup(doc)

    section = doc.sections[0]
    assert section.different_first_page_header_footer is True


def test_footer_page_number_field():
    """Проверка наличия динамического поля PAGE в нижнем колонтитуле."""
    doc = docx.Document()
    apply_page_setup(doc)

    section = doc.sections[0]
    footer = section.footer
    assert len(footer.paragraphs) > 0

    p = footer.paragraphs[0]
    assert p.alignment == WD_ALIGN_PARAGRAPH.CENTER

    # Проверка OpenXML структуры поля PAGE
    xml_str = p._p.xml
    assert "PAGE" in xml_str or "w:fldSimple" in xml_str or "w:instrText" in xml_str


def test_compiler_applies_page_setup():
    """Проверка, что DocxCompiler.compile() автоматически настраивает параметры страницы."""
    compiler = DocxCompiler()
    doc = compiler.compile()

    section = doc.sections[0]
    assert abs(section.left_margin.mm - 30.0) < 0.1
    assert section.different_first_page_header_footer is True
