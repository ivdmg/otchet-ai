from typing import Optional, Tuple
from docx.document import Document
from docx.text.paragraph import Paragraph
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH


def render_appendix(
    doc: Document,
    letter: str,
    title: Optional[str] = None
) -> Tuple[Paragraph, Optional[Paragraph]]:
    """
    Рендерит Приложение по стандарту ГОСТ 7.32-2017 / ГОСТ 2.105-95:
    - Заголовок приложения: ПРИЛОЖЕНИЕ А (с новой страницы, справа, ПРОПИСНЫЕ, Bold 14pt, space_after = 6pt)
    - Название приложения: По центру (CENTER), 14pt Bold, space_after = 12pt (без точки в конце)
    """
    clean_letter = letter.strip().upper()
    if not clean_letter.startswith("ПРИЛОЖЕНИЕ"):
        header_text = f"ПРИЛОЖЕНИЕ {clean_letter}"
    else:
        header_text = clean_letter

    # 1. Заголовок приложения (ПРИЛОЖЕНИЕ А)
    p_hdr = doc.add_paragraph()
    p_hdr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_hdr.paragraph_format.page_break_before = True
    p_hdr.paragraph_format.first_line_indent = Cm(0)
    p_hdr.paragraph_format.space_before = Pt(0)
    p_hdr.paragraph_format.space_after = Pt(6)

    run_hdr = p_hdr.add_run(header_text)
    run_hdr.font.name = "Times New Roman"
    run_hdr.font.size = Pt(14)
    run_hdr.font.bold = True
    run_hdr.font.color.rgb = RGBColor(0, 0, 0)

    # 2. Наименование приложения
    p_title: Optional[Paragraph] = None
    if title:
        clean_title = title.strip()
        if clean_title.endswith("."):
            clean_title = clean_title[:-1].strip()

        p_title = doc.add_paragraph()
        p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_title.paragraph_format.page_break_before = False
        p_title.paragraph_format.first_line_indent = Cm(0)
        p_title.paragraph_format.space_before = Pt(0)
        p_title.paragraph_format.space_after = Pt(12)

        run_title = p_title.add_run(clean_title)
        run_title.font.name = "Times New Roman"
        run_title.font.size = Pt(14)
        run_title.font.bold = True
        run_title.font.color.rgb = RGBColor(0, 0, 0)

    return p_hdr, p_title
