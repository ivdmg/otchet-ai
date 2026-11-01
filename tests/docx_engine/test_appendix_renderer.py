import pytest
import docx
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from app.docx_engine.handlers.appendix import render_appendix


def test_render_appendix_header_and_title():
    """Проверка рендеринга Приложения (ПРИЛОЖЕНИЕ А вверху справа, наименование по центру)."""
    doc = docx.Document()
    p_hdr, p_title = render_appendix(
        doc,
        letter="А",
        title="Структура базы данных и SQL-скрипты."
    )

    # 1. Заголовок "ПРИЛОЖЕНИЕ А"
    assert p_hdr is not None
    assert p_hdr.text == "ПРИЛОЖЕНИЕ А"
    assert p_hdr.paragraph_format.page_break_before is True
    assert p_hdr.alignment == WD_ALIGN_PARAGRAPH.RIGHT
    assert p_hdr.paragraph_format.space_after == Pt(6)

    run_hdr = p_hdr.runs[0]
    assert run_hdr.font.name == "Times New Roman"
    assert run_hdr.font.size == Pt(14)
    assert run_hdr.font.bold is True
    assert run_hdr.font.color.rgb == RGBColor(0, 0, 0)

    # 2. Название приложения
    assert p_title is not None
    # Точка в конце должна быть удалена
    assert p_title.text == "Структура базы данных и SQL-скрипты"
    assert p_title.paragraph_format.page_break_before is False
    assert p_title.alignment == WD_ALIGN_PARAGRAPH.CENTER
    assert p_title.paragraph_format.space_after == Pt(12)

    run_title = p_title.runs[0]
    assert run_title.font.name == "Times New Roman"
    assert run_title.font.size == Pt(14)
    assert run_title.font.bold is True


def test_render_appendix_with_full_letter_string():
    """Проверка передачи полной строки 'ПРИЛОЖЕНИЕ Б'."""
    doc = docx.Document()
    p_hdr, p_title = render_appendix(
        doc,
        letter="Приложение б",
        title="Листинг программы"
    )

    assert p_hdr.text == "ПРИЛОЖЕНИЕ Б"
    assert p_title.text == "Листинг программы"
