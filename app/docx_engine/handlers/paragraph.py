from typing import Optional
from docx.document import Document
from docx.text.paragraph import Paragraph
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from app.schemas.ast import ASTNode


def render_paragraph(
    doc: Document,
    text: Optional[str] = None,
    node: Optional[ASTNode] = None
) -> Paragraph:
    """
    Рендерит абзац основного текста по стандарту ГОСТ 7.32-2017:
    - Гарнитура: Times New Roman
    - Кегль: 14 pt
    - Цвет: Черный (0, 0, 0)
    - Выравнивание: По ширине (JUSTIFY)
    - Межстрочный интервал: 1.5
    - Красная строка (First line indent): 1.25 см
    - Отступы До/После: 0 pt
    """
    content_text = text
    if content_text is None and node is not None:
        content_text = node.text or ""

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    
    fmt = p.paragraph_format
    fmt.line_spacing = 1.5
    fmt.first_line_indent = Cm(1.25)
    fmt.space_before = Pt(0)
    fmt.space_after = Pt(0)

    if content_text:
        run = p.add_run(content_text)
        run.font.name = "Times New Roman"
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(0, 0, 0)
        run.font.bold = False
        run.font.italic = False

    return p
