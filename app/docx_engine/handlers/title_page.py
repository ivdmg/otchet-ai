from typing import Optional, List
from docx.document import Document
from docx.text.paragraph import Paragraph
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from app.schemas.ast import DocumentASTGraph


def add_title_paragraph(
    doc: Document,
    text: str,
    font_size: int = 12,
    bold: bool = False,
    italic: bool = False,
    alignment: WD_ALIGN_PARAGRAPH = WD_ALIGN_PARAGRAPH.CENTER,
    space_before: int = 0,
    space_after: int = 0,
    left_indent_cm: float = 0.0
) -> Paragraph:
    """
    Вспомогательная функция для генерации форматированного параграфа титульного листа.
    """
    p = doc.add_paragraph()
    p.alignment = alignment
    fmt = p.paragraph_format
    fmt.first_line_indent = Cm(0)
    fmt.space_before = Pt(space_before)
    fmt.space_after = Pt(space_after)
    if left_indent_cm > 0:
        fmt.left_indent = Cm(left_indent_cm)

    run = p.add_run(text)
    run.font.name = "Times New Roman"
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = RGBColor(0, 0, 0)
    return p


def render_title_page(
    doc: Document,
    doc_type: str = "coursework",
    title: str = "",
    author_name: str = "",
    institution: str = "",
    city: str = "Москва",
    year: int = 2026,
    department: str = "",
    discipline: str = "",
    supervisor_name: str = "",
    supervisor_title: str = "",
    student_course: str = "",
    student_group: str = "",
    ast: Optional[DocumentASTGraph] = None
) -> List[Paragraph]:
    """
    Рендерит Титульный лист по ГОСТ 7.32-2017 / ГОСТ 2.105-95 для шаблонов:
    - coursework (Курсовая работа)
    - abstract (Реферат)
    - vkr (Выпускная квалификационная работа)
    """
    if ast is not None:
        doc_type = ast.doc_type or doc_type
        title = ast.title or title
        author_name = ast.author_name or author_name
        institution = ast.institution or institution
        city = ast.city or city
        year = ast.year or year

    created_paragraphs: List[Paragraph] = []

    inst_text = institution.strip() if institution else "НАИМЕНОВАНИЕ УНИВЕРСИТЕТА"

    # 1. Верхний блок (Шапка ВУЗа)
    created_paragraphs.append(add_title_paragraph(
        doc, "МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ РОССИЙСКОЙ ФЕДЕРАЦИИ",
        font_size=12, bold=True, space_after=2
    ))
    created_paragraphs.append(add_title_paragraph(
        doc, "ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ",
        font_size=10, bold=False, space_after=2
    ))
    created_paragraphs.append(add_title_paragraph(
        doc, f"«{inst_text}»",
        font_size=12, bold=True, space_after=2 if department else 36
    ))

    if department:
        created_paragraphs.append(add_title_paragraph(
            doc, f"Кафедра {department}",
            font_size=12, bold=False, space_after=36
        ))

    # 2. Центральный блок (Тип и Тема работы)
    d_type = doc_type.lower()
    if d_type == "vkr":
        type_str = "ВЫПУСКНАЯ КВАЛИФИКАЦИОННАЯ РАБОТА"
        sub_str = "(бакалаврская работа)"
    elif d_type == "abstract":
        type_str = "РЕФЕРАТ"
        sub_str = f"по дисциплине «{discipline}»" if discipline else None
    else:
        type_str = "КУРСОВАЯ РАБОТА"
        sub_str = f"по дисциплине «{discipline}»" if discipline else None

    created_paragraphs.append(add_title_paragraph(
        doc, type_str,
        font_size=16, bold=True, space_after=12 if sub_str else 24
    ))

    if sub_str:
        created_paragraphs.append(add_title_paragraph(
            doc, sub_str,
            font_size=14, bold=False, space_after=24
        ))

    clean_theme = title.strip()
    if clean_theme.endswith("."):
        clean_theme = clean_theme[:-1].strip()

    created_paragraphs.append(add_title_paragraph(
        doc, f"на тему: «{clean_theme}»",
        font_size=14, bold=True, space_after=48
    ))

    # 3. Блок автора и преподавателя (Справа / С отступом 9 см)
    auth_str = author_name if author_name else "[ФИО Студента]"
    sup_str = supervisor_name if supervisor_name else "[ФИО Преподавателя]"
    sup_t = supervisor_title if supervisor_title else "[Ученая степень, должность]"

    course_info = f"{student_course} курса " if student_course else ""
    group_info = f"группы {student_group}" if student_group else ""
    student_details = f"{course_info}{group_info}".strip()

    created_paragraphs.append(add_title_paragraph(
        doc, "Выполнил(а):",
        font_size=12, bold=False, space_after=2, left_indent_cm=9.0, alignment=WD_ALIGN_PARAGRAPH.LEFT
    ))
    if student_details:
        created_paragraphs.append(add_title_paragraph(
            doc, f"Студент(ка) {student_details}",
            font_size=12, bold=False, space_after=2, left_indent_cm=9.0, alignment=WD_ALIGN_PARAGRAPH.LEFT
        ))
    created_paragraphs.append(add_title_paragraph(
        doc, auth_str,
        font_size=12, bold=True, space_after=12, left_indent_cm=9.0, alignment=WD_ALIGN_PARAGRAPH.LEFT
    ))

    created_paragraphs.append(add_title_paragraph(
        doc, "Проверил:",
        font_size=12, bold=False, space_after=2, left_indent_cm=9.0, alignment=WD_ALIGN_PARAGRAPH.LEFT
    ))
    created_paragraphs.append(add_title_paragraph(
        doc, sup_t,
        font_size=12, bold=False, space_after=2, left_indent_cm=9.0, alignment=WD_ALIGN_PARAGRAPH.LEFT
    ))
    created_paragraphs.append(add_title_paragraph(
        doc, sup_str,
        font_size=12, bold=True, space_after=48, left_indent_cm=9.0, alignment=WD_ALIGN_PARAGRAPH.LEFT
    ))

    # 4. Нижний блок (Город и Год)
    created_paragraphs.append(add_title_paragraph(
        doc, f"{city} — {year}",
        font_size=12, bold=False, space_after=0
    ))

    # Разрыв страницы после титульного листа
    doc.add_page_break()

    return created_paragraphs
