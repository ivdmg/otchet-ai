from typing import Tuple, Optional
import docx
from docx.document import Document
from docx.text.paragraph import Paragraph
from docx.shared import Cm, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def setup_footnotes_separator(doc: Document) -> OxmlElement:
    """
    Создает элемент отделительной черты сносок w:footnote type="separator" w:id="-1".
    Длина черты в Word стандартизирована (1.5 см).
    """
    sep_fn = OxmlElement('w:footnote')
    sep_fn.set(qn('w:type'), 'separator')
    sep_fn.set(qn('w:id'), '-1')

    p_sep = OxmlElement('w:p')
    p_pr = OxmlElement('w:pPr')
    spacing = OxmlElement('w:spacing')
    spacing.set(qn('w:after'), '0')
    spacing.set(qn('w:line'), '240')
    p_pr.append(spacing)
    p_sep.append(p_pr)

    r_sep = OxmlElement('w:r')
    r_sep.append(OxmlElement('w:separator'))
    p_sep.append(r_sep)

    sep_fn.append(p_sep)
    return sep_fn


def render_footnote(
    paragraph: Paragraph,
    footnote_text: str,
    footnote_id: int = 1
) -> Tuple[Paragraph, OxmlElement]:
    """
    Рендерит сноску по стандарту ГОСТ 7.32-2017:
    - Вставляет надстрочный знак (w:footnoteReference) в параграф
    - Создает элемент сноски w:footnote (10pt, Times New Roman, одинарный интервал 1.0, красная строка 1.25 см)
    """
    # 1. Добавление маркера в исходный параграф
    run = paragraph.add_run()
    r_pr = OxmlElement('w:rPr')
    r_style = OxmlElement('w:rStyle')
    r_style.set(qn('w:val'), 'FootnoteReference')
    r_pr.append(r_style)
    run._r.append(r_pr)

    footnote_ref = OxmlElement('w:footnoteReference')
    footnote_ref.set(qn('w:id'), str(footnote_id))
    run._r.append(footnote_ref)

    # 2. Создание элемента w:footnote
    footnote_elem = OxmlElement('w:footnote')
    footnote_elem.set(qn('w:id'), str(footnote_id))

    p_fn = OxmlElement('w:p')
    p_pr = OxmlElement('w:pPr')

    # Выравнивание по ширине (both)
    jc = OxmlElement('w:jc')
    jc.set(qn('w:val'), 'both')
    p_pr.append(jc)

    # Межстрочный одинарный (240 dxa) и отступы 0
    spacing = OxmlElement('w:spacing')
    spacing.set(qn('w:line'), '240')
    spacing.set(qn('w:lineRule'), 'auto')
    spacing.set(qn('w:before'), '0')
    spacing.set(qn('w:after'), '0')
    p_pr.append(spacing)

    # Красная строка 1.25 см (709 dxa)
    ind = OxmlElement('w:ind')
    ind.set(qn('w:firstLine'), '709')
    p_pr.append(ind)

    p_fn.append(p_pr)

    # Маркер номера внутри сноски
    r_ref = OxmlElement('w:r')
    r_pr_ref = OxmlElement('w:rPr')
    r_style_ref = OxmlElement('w:rStyle')
    r_style_ref.set(qn('w:val'), 'FootnoteReference')
    r_pr_ref.append(r_style_ref)
    r_ref.append(r_pr_ref)
    r_ref.append(OxmlElement('w:footnoteRef'))
    p_fn.append(r_ref)

    # Текст сноски (Times New Roman, 10pt = sz 20, черный)
    r_text = OxmlElement('w:r')
    r_pr_t = OxmlElement('w:rPr')

    r_fonts = OxmlElement('w:rFonts')
    r_fonts.set(qn('w:ascii'), 'Times New Roman')
    r_fonts.set(qn('w:hAnsi'), 'Times New Roman')
    r_pr_t.append(r_fonts)

    sz = OxmlElement('w:sz')
    sz.set(qn('w:val'), '20')  # 10 pt
    r_pr_t.append(sz)

    color = OxmlElement('w:color')
    color.set(qn('w:val'), '000000')
    r_pr_t.append(color)

    r_text.append(r_pr_t)

    t = OxmlElement('w:t')
    t.text = f" {footnote_text}"
    t.set(qn('xml:space'), 'preserve')
    r_text.append(t)

    p_fn.append(r_text)
    footnote_elem.append(p_fn)

    return run, footnote_elem
