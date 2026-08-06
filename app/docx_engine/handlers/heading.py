from docx.document import Document
from docx.text.paragraph import Paragraph
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH


def render_heading(
    doc: Document,
    text: str,
    level: int = 1
) -> Paragraph:
    """
    Рендерит заголовок 1-го или 2-го уровня по стандарту ГОСТ 7.32-2017 / ГОСТ 2.105-95:
    
    Level 1 (Глава / Введение / Заключение):
    - С новой страницы (page_break_before = True)
    - По центру (CENTER)
    - ПРОПИСНЫЕ БУКВЫ (ALL CAPS)
    - Без красной строки (first_line_indent = 0)
    - Space before: 0 pt, Space after: 12 pt
    - Times New Roman 14 pt, Bold, Black
    - Точка в конце удаляется

    Level 2 (Подраздел / Параграф):
    - Без разрыва страницы (page_break_before = False)
    - С красной строки (first_line_indent = 1.25 см)
    - Space before: 12 pt, Space after: 12 pt
    - Times New Roman 14 pt, Bold, Black
    - Точка в конце удаляется
    """
    clean_text = text.strip()
    if clean_text.endswith("."):
        clean_text = clean_text[:-1].strip()

    p = doc.add_paragraph()
    fmt = p.paragraph_format

    if level == 1:
        clean_text = clean_text.upper()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        fmt.page_break_before = True
        fmt.first_line_indent = Cm(0)
        fmt.space_before = Pt(0)
        fmt.space_after = Pt(12)
    else:
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        fmt.page_break_before = False
        fmt.first_line_indent = Cm(1.25)
        fmt.space_before = Pt(12)
        fmt.space_after = Pt(12)

    run = p.add_run(clean_text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(14)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0, 0, 0)

    return p
