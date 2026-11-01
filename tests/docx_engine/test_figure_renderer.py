import io
import pytest
import docx
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from app.docx_engine.handlers.figure import render_figure
from app.schemas.ast import ASTNode, NodeType

# Минимальный валидный PNG файл (1x1 пиксель)
TINY_PNG_BYTES = (
    b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde'
    b'\x00\x00\x00\x0cIDATx\x9cc\xf8\xcf\xc0\x00\x00\x03\x01\x01\x00\x18\xdd\x8d\xb0\x00\x00\x00\x00IEND\xaeB`\x82'
)


def test_render_figure_with_image_and_caption():
    """Проверка добавления рисунка, центрирования и подписи под рисунком по ГОСТ."""
    doc = docx.Document()
    image_stream = io.BytesIO(TINY_PNG_BYTES)
    caption_text = "Схема архитектуры системы AI GostDoc."

    p_img, p_cap = render_figure(
        doc,
        image_path_or_stream=image_stream,
        caption=caption_text,
        figure_num="1.1",
        width_cm=12.0
    )

    # 1. Проверка параграфа рисунка
    assert p_img is not None
    assert p_img.alignment == WD_ALIGN_PARAGRAPH.CENTER
    assert p_img.paragraph_format.keep_with_next is True
    assert "w:drawing" in p_img._p.xml

    # 2. Проверка параграфа подписи
    assert p_cap is not None
    assert p_cap.alignment == WD_ALIGN_PARAGRAPH.CENTER
    assert p_cap.paragraph_format.space_after == Pt(12)
    # Точка в конце подписи должна быть удалена
    assert p_cap.text == "Рисунок 1.1 — Схема архитектуры системы AI GostDoc"

    # Проверка свойств шрифта подписи
    run = p_cap.runs[0]
    assert run.font.name == "Times New Roman"
    assert run.font.size == Pt(12)
    assert run.font.color.rgb == RGBColor(0, 0, 0)


def test_render_figure_without_image():
    """Проверка создания подписи рисунка, когда передана только подпись/заглушка."""
    doc = docx.Document()
    p_img, p_cap = render_figure(
        doc,
        caption="Рисунок 2.1 — График распределения ресурсов"
    )

    assert p_img is not None
    assert p_cap is not None
    assert p_cap.text == "Рисунок 2.1 — График распределения ресурсов"
