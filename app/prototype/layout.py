"""Local document layout. Profile fields never enter the LLM settings or prompts."""
import io
import re
from datetime import datetime
from collections import Counter
import docx
from docx.shared import Cm, Pt, RGBColor
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from app.docx_engine.handlers.table import render_table


def normalize(text):
    return str(text).translate(str.maketrans({c: '-' for c in '\u2010\u2011\u2012\u2013\u2014\u2015\u2212'})).strip()


def minimum_pages(chapters):
    # Title, contents, introduction, conclusion and references, plus each chapter.
    return 5 + chapters


def body_units(plan, settings):
    chapters = plan['chapters']
    count = max(len(chapters), settings.get('pages', minimum_pages(len(chapters))) - 5)
    units = []
    page = 4
    for i, chapter in enumerate(chapters):
        pages = count // len(chapters) + int(i < count % len(chapters))
        sections = chapter['sections']
        if len(sections) <= pages:
            for j, title in enumerate(sections):
                parts = pages // len(sections) + int(j < pages % len(sections))
                for part in range(parts):
                    units.append(dict(chapter=i, section=j, page=page, part=part,
                                      heading=f'{i+1}.{j+1} {chapter["title"]}: {title}' +
                                      (f' (продолжение {part+1}/{parts})' if parts > 1 else '')))
                    page += 1
        else:
            start = page
            for j, title in enumerate(sections):
                units.append(dict(chapter=i, section=j, page=start + j*pages//len(sections), part=0,
                                  heading=f'{i+1}.{j+1} {chapter["title"]}: {title}'))
            page += pages
    density = Counter(u['page'] for u in units)
    for n, unit in enumerate(units):
        # Reserve room for subsection headings and long Russian words at 14 pt.
        count = density[unit['page']]
        unit.update(key=f'section_{n}', target_words=round((180-15*count)/count))
    return units


def content_paragraphs(content, heading):
    """Remove only an echoed heading, never cut paragraphs to meet a page count."""
    clean_heading = re.sub(r'[\W_]+', '', normalize(heading).casefold())
    paragraphs = []
    for text in content['paragraphs']:
        text = normalize(text)
        # A model may put its section heading on a separate line of one paragraph.
        lines = text.splitlines()
        if lines and re.sub(r'[\W_]+', '', lines[0].casefold()) == clean_heading:
            text = '\n'.join(lines[1:]).strip()
        if text:
            paragraphs.append(text)
    return paragraphs


def field(paragraph, instruction, cached='1'):
    for kind, value in [('begin', None), ('instruction', instruction), ('separate', None), ('text', cached), ('end', None)]:
        run = paragraph.add_run()
        if kind in ('begin', 'separate', 'end'):
            node = OxmlElement('w:fldChar'); node.set(qn('w:fldCharType'), kind)
        elif kind == 'instruction':
            node = OxmlElement('w:instrText'); node.set(qn('xml:space'), 'preserve'); node.text = ' '+value+' '
        else:
            node = OxmlElement('w:t'); node.text = value
        run._r.append(node)


def bookmark(paragraph, name, number):
    start = OxmlElement('w:bookmarkStart'); start.set(qn('w:id'), str(number)); start.set(qn('w:name'), name)
    end = OxmlElement('w:bookmarkEnd'); end.set(qn('w:id'), str(number))
    paragraph._p.insert(0, start); paragraph._p.append(end)


def configure(output):
    section = output.sections[0]
    section.page_width, section.page_height = Cm(21), Cm(29.7)
    section.top_margin = section.bottom_margin = Cm(2)
    section.left_margin, section.right_margin = Cm(3), Cm(1.5)
    section.header_distance = section.footer_distance = Cm(1)
    section.different_first_page_header_footer = True
    for name in ('Normal', 'GostSection', 'GostChapter', 'GostSubsection', 'GostContents', 'GostTitle'):
        style = output.styles[name] if name in output.styles else output.styles.add_style(name, WD_STYLE_TYPE.PARAGRAPH)
        if name != 'Normal': style.base_style = output.styles['Normal']
        style.font.name, style.font.size, style.font.color.rgb = 'Times New Roman', Pt(14), RGBColor(0, 0, 0)
        fonts = style.element.get_or_add_rPr().get_or_add_rFonts()
        for key in list(fonts.attrib):
            if 'theme' in key.lower(): del fonts.attrib[key]
        for script in ('ascii', 'hAnsi', 'eastAsia', 'cs'): fonts.set(qn('w:'+script), 'Times New Roman')
        f = style.paragraph_format
        f.line_spacing, f.space_before, f.space_after = 1.5, Pt(0), Pt(0)
        f.first_line_indent, f.alignment = Cm(1.25), WD_ALIGN_PARAGRAPH.JUSTIFY
        f.widow_control = True
        # Body text outline level is deliberate: no collapsible Word headings.
        level = OxmlElement('w:outlineLvl'); level.set(qn('w:val'), '9')
        style.element.get_or_add_pPr().append(level)
        if name in ('GostSection', 'GostChapter', 'GostSubsection'):
            style.font.bold = True
            f.keep_with_next, f.space_after = True, Pt(12)
            f.alignment = WD_ALIGN_PARAGRAPH.LEFT
        if name in ('GostSection', 'GostContents', 'GostTitle'):
            f.first_line_indent = Cm(0)
        if name in ('GostSection', 'GostTitle'): f.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if name == 'GostContents':
            f.line_spacing = 1.0
            f.tab_stops.add_tab_stop(Cm(16.5), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer.paragraph_format.first_line_indent = Cm(0)
    field(footer, 'PAGE')


def title_page(output, document):
    data = getattr(document, 'title_data', None) or {}
    values = data.get('title_defaults', {})
    def title(text, before=0, after=0, right=False, bold=False, size=14):
        p = output.add_paragraph(normalize(text), 'GostTitle')
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_before, p.paragraph_format.space_after = Pt(before), Pt(after)
        if right: p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        for r in p.runs: r.bold = bold; r.font.size = Pt(size)
        return p
    title('МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ РОССИЙСКОЙ ФЕДЕРАЦИИ', size=12, after=6)
    title('Федеральное государственное бюджетное образовательное учреждение высшего образования', size=12, after=6)
    title(values.get('university') or 'Наименование образовательной организации', bold=True, after=8)
    if values.get('faculty'): title(values['faculty'])
    title('Кафедра «'+values.get('department', 'Наименование кафедры')+'»')
    if values.get('specialty'): title('Направление подготовки: '+values['specialty'], size=12)
    kind = {'abstract':'РЕФЕРАТ', 'coursework':'КУРСОВАЯ РАБОТА', 'vkr':'ВЫПУСКНАЯ КВАЛИФИКАЦИОННАЯ РАБОТА'}[document.doc_type]
    title(kind, before=42, bold=True)
    if document.settings.get('subject'): title('по дисциплине «'+document.settings['subject']+'»', after=8)
    title('ТЕМА: «'+document.topic+'»', bold=True, after=42)
    group = values.get('group') or '________'
    course = (values.get('course')+' курса, ') if values.get('course') else ''
    title('Выполнил(а): студент(ка) '+course+'группы '+group, right=True)
    title(values.get('studentName') or data.get('name') or 'ФИО студента', right=True, after=12)
    title('Проверил(а):', right=True)
    title(values.get('supervisor') or 'ФИО руководителя', right=True)
    # The city/year stays at the bottom of the cover without empty paragraphs.
    cover_footer = output.sections[0].first_page_footer.paragraphs[0]
    cover_footer.style = output.styles['GostTitle']
    cover_footer.add_run(normalize((values.get('city') or 'Город')+', '+str(data.get('year') or datetime.now().year)))


def build(document, steps, units, content_model):
    output = docx.Document(); configure(output); title_page(output, document)
    frozen_body = [u for u in units if u['key'].startswith('section_')]
    body = frozen_body if frozen_body and all('page' in u for u in frozen_body) else body_units(document.approved_plan, document.settings)
    by_key = {u['key']:u for u in body}
    entries = [('Введение', 'intro', 0)]
    for i, chapter in enumerate(document.approved_plan['chapters']):
        entries.append((f'{i+1} '+chapter['title'], f'chapter_{i}', 0))
        for j, title in enumerate(chapter['sections']): entries.append((f'{i+1}.{j+1} '+title, f'part_{i}_{j}', 1))
    entries += [('Заключение', 'conclusion', 0), ('Список использованных источников', 'bibliography', 0)]
    p = output.add_paragraph('СОДЕРЖАНИЕ', 'GostSection'); p.paragraph_format.page_break_before = True
    for text, name, indent in entries:
        p = output.add_paragraph(normalize(text)+'\t', 'GostContents')
        p.paragraph_format.left_indent = Cm(0.6*indent)
        field(p, 'PAGEREF '+name+' \\h', '0')
    current_page, number, table_num, formula_num, listing_num = 2, 1, 0, 0, 0
    seen_chapters, seen_sections = set(), set()
    for unit in units:
        key, heading = unit['key'], unit['heading']
        if key in ('validation', 'docx', 'pdf'): continue
        content = content_model.model_validate(steps[key]).checked().model_dump()
        detail = by_key.get(key)
        requested = document.settings.get('pages', minimum_pages(len(document.approved_plan['chapters'])))
        page = unit.get('page') or (detail['page'] if detail else {'intro':3, 'conclusion':requested-1, 'bibliography':requested}[key])
        new_page = page != current_page
        current_page = page
        if detail:
            i, j = detail['chapter'], detail['section']
            if i not in seen_chapters:
                p = output.add_paragraph(normalize(f'{i+1} '+document.approved_plan['chapters'][i]['title']), 'GostChapter')
                p.paragraph_format.page_break_before = new_page
                bookmark(p, f'chapter_{i}', number); number += 1
                seen_chapters.add(i); new_page = False
            if (i,j) not in seen_sections:
                text = normalize(f'{i+1}.{j+1} '+document.approved_plan['chapters'][i]['sections'][j])
                p = output.add_paragraph(text, 'GostSubsection'); p.paragraph_format.page_break_before = new_page
                bookmark(p, f'part_{i}_{j}', number); number += 1
                seen_sections.add((i,j)); new_page = False
        else:
            p = output.add_paragraph(normalize(heading).upper(), 'GostSection')
            p.paragraph_format.page_break_before = new_page
            bookmark(p, key, number); number += 1; new_page = False
        for n, text in enumerate(content_paragraphs(content, heading)):
            if key == 'bibliography' and not re.match(r'^\d+[.)]\s', text): text = f'{n+1}. '+text
            p = output.add_paragraph(text)
            if new_page: p.paragraph_format.page_break_before = True; new_page = False
        if content['table']:
            table_num += 1
            table = content['table']
            caption_text = re.sub(r'^Таблица\s*\d*(?:\.\d+)*\s*[-:]*\s*', '', normalize(table['caption']), flags=re.IGNORECASE)
            caption, _ = render_table(output, headers=[normalize(s) for s in table['headers']],
                                    rows=[[normalize(s) for s in r] for r in table['rows']],
                                    caption=caption_text or f'Таблица {table_num}', table_num=str(table_num))
            if caption:
                caption.paragraph_format.first_line_indent = Cm(0)
                for r in caption.runs: r.text = normalize(r.text)
        if content.get('formula'):
            formula_num+=1
            formula=content['formula']
            p=output.add_paragraph();p.alignment=WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.first_line_indent=Cm(0)
            p.paragraph_format.tab_stops.add_tab_stop(Cm(8.25),WD_TAB_ALIGNMENT.CENTER)
            p.paragraph_format.tab_stops.add_tab_stop(Cm(16.5),WD_TAB_ALIGNMENT.RIGHT)
            p.add_run('\t')
            math=OxmlElement('m:oMath');run=OxmlElement('m:r');text=OxmlElement('m:t')
            text.text=normalize(formula['expression']);run.append(text);math.append(run);p._p.append(math)
            p.add_run(f'\t({formula_num})')
            for i,symbol in enumerate(formula['symbols']):
                output.add_paragraph(('где ' if i==0 else '')+normalize(symbol))
        if content.get('listing'):
            listing_num+=1;listing=content['listing']
            p=output.add_paragraph(f'Листинг {listing_num} - '+normalize(listing['caption']))
            p.alignment=WD_ALIGN_PARAGRAPH.RIGHT;p.paragraph_format.first_line_indent=Cm(0)
            p.paragraph_format.keep_with_next=True
            code=output.add_paragraph();code.paragraph_format.first_line_indent=Cm(0)
            code.paragraph_format.line_spacing=1.0;code.alignment=WD_ALIGN_PARAGRAPH.LEFT
            code.paragraph_format.keep_together=True
            run=code.add_run(normalize(listing['code']))
            run.font.name='Courier New';run.font.size=Pt(11)
    buf = io.BytesIO(); output.save(buf); return buf.getvalue()
