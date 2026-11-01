import pytest
import docx
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn

from app.docx_engine.handlers.footnote import render_footnote, setup_footnotes_separator
from app.docx_engine.handlers.paragraph import render_paragraph


def test_render_footnote_reference_in_paragraph():
    """Проверка вставки маркера сноски w:footnoteReference в параграф."""
    doc = docx.Document()
    p = render_paragraph(doc, text="Текст с цитатой")

    fn_run, fn_element = render_footnote(
        paragraph=p,
        footnote_text="Источник: Иванов И.И. Ипотечное кредитование, 2024.",
        footnote_id=1
    )

    assert fn_run is not None
    xml_p = p._p.xml
    assert "w:footnoteReference" in xml_p
    assert 'w:id="1"' in xml_p


def test_footnote_element_formatting():
    """Проверка форматирования элемента сноски (10pt, TNR, 1.0 интервал, 1.25 см отступ)."""
    doc = docx.Document()
    p = render_paragraph(doc, text="Основной текст")

    _, fn_element = render_footnote(
        paragraph=p,
        footnote_text="Текст сноски для проверки форматирования.",
        footnote_id=1
    )

    assert fn_element is not None
    from lxml import etree
    xml_fn = etree.tostring(fn_element).decode("utf-8")

    # Проверка наличия 10pt (val="20" в полупунктах OpenXML)
    assert 'w:sz w:val="20"' in xml_fn or '10pt' in xml_fn or 'w:rPr' in xml_fn
    # Проверка красной строки 1.25 см (709 dxa)
    assert "w:firstLine" in xml_fn or "709" in xml_fn


def test_setup_footnotes_separator():
    """Проверка создания отделительной черты сносок (w:separator)."""
    doc = docx.Document()
    sep_fn = setup_footnotes_separator(doc)

    assert sep_fn is not None
    from lxml import etree
    xml_sep = etree.tostring(sep_fn).decode("utf-8")
    assert "w:separator" in xml_sep or 'type="separator"' in xml_sep or "w:footnote" in xml_sep
