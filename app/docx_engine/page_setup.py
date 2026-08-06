import docx
from docx.document import Document
from docx.shared import Mm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def add_page_number_field(run) -> None:
    """
    Вставляет динамическое поле OpenXML PAGE в run нижнего колонтитула.
    """
    fld_simple = OxmlElement('w:fldSimple')
    fld_simple.set(qn('w:instr'), 'PAGE')
    run._r.append(fld_simple)


def apply_page_setup(doc: Document) -> None:
    """
    Настраивает параметры страницы и колонтитулов по ГОСТ 7.32-2017:
    - Бумага: A4 (210 x 297 мм)
    - Поля: Левое 30 мм, Правое 10 мм, Верхнее 20 мм, Нижнее 20 мм
    - Раздельные колонтитулы для 1-й страницы (different_first_page_header_footer = True)
    - Динамический номер страницы (PAGE) внизу по центру (Times New Roman 12pt)
    """
    for section in doc.sections:
        section.page_width = Mm(210)
        section.page_height = Mm(297)
        section.left_margin = Mm(30)
        section.right_margin = Mm(10)
        section.top_margin = Mm(20)
        section.bottom_margin = Mm(20)

        # Скрытие номера на первой странице (Титульном листе)
        section.different_first_page_header_footer = True

        # Настройка нижнего колонтитула для всех остальных страниц
        footer = section.footer
        p = footer.paragraphs[0] if footer.paragraphs else footer.add_paragraph()
        p.text = ""  # очищаем текст
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER

        run = p.add_run()
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        run.font.color.rgb = RGBColor(0, 0, 0)
        add_page_number_field(run)
