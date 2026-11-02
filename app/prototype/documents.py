import hashlib
import io
import os
from pathlib import Path
from pydantic import BaseModel, ConfigDict, Field
import docx
from app.docx_engine.compiler import DocxCompiler
from app.docx_engine.handlers.paragraph import render_paragraph
from app.docx_engine.handlers.table import render_table
from .config import cfg
from .models import now


class Table(BaseModel):
    model_config = ConfigDict(extra='forbid')
    headers: list[str] = Field(min_length=1, max_length=6)
    rows: list[list[str]] = Field(min_length=1, max_length=20)
    caption: str = Field(max_length=200)


class Content(BaseModel):
    model_config = ConfigDict(extra='forbid')
    paragraphs: list[str] = Field(min_length=1, max_length=12)
    table: Table | None = None

    def checked(self):
        if not 80 <= sum(len(x) for x in self.paragraphs) <= 16000:
            raise ValueError('invalid_content_length')
        if self.table:
            if any(len(row) != len(self.table.headers) for row in self.table.rows):
                raise ValueError('invalid_table_width')
            if any(len(cell) > 1000 for row in self.table.rows for cell in row):
                raise ValueError('invalid_table_cell')
        for text in self.paragraphs:
            if any(ord(ch) < 32 and ch not in '\n\t' for ch in text):
                raise ValueError('invalid_xml_character')
        return self


def pipeline(plan, settings=None):
    import math
    settings = settings or {}
    headings = [f'{i+1}.{j+1} {c["title"]}: {title}' for i,c in enumerate(plan['chapters']) for j,title in enumerate(c['sections'])]
    parts = max(1,math.ceil(max(0,settings.get('pages',3)*220-200)*0.76/max(1,len(headings))/400))
    headings = [title+(f' — часть {part+1}/{parts}' if parts>1 else '') for title in headings for part in range(parts)]
    n = len(headings)
    return [('intro','Введение',5)] + [(f'section_{i}', title,70/n) for i,title in enumerate(headings)] + [
        ('conclusion','Заключение',5), ('bibliography','Список использованных источников',5),
        ('validation','Проверка структуры',5), ('docx','Сохранение Word',5), ('pdf','PDF и проверка выдачи',5)]


def freeze_units(settings, plan):
    return [{'key':key,'heading':heading,'weight':weight,
             'target_words':generation_settings(settings,plan,key)['target_words']}
            for key,heading,weight in pipeline(plan,settings)]


def job_pipeline(job,document):
    return [(u['key'],u['heading'],u['weight']) for u in job.units] if job.units else pipeline(document.approved_plan,document.settings)


def generation_settings(settings, plan, key, units=None):
    result = dict(settings)
    content_steps = pipeline(plan,settings)[:-3]
    words = max(200,(settings.get('pages',3)*220-200))
    weights = {'intro':0.08,'conclusion':0.08,'bibliography':0.08}
    body_count = len(content_steps)-3
    result['target_words'] = (next(u['target_words'] for u in units if u['key']==key) if units else round(words*weights.get(key,0.76/body_count)))
    return result


def progress(job, document):
    if job.kind == 'plan':
        return dict(stage=job.stage, current_section=None, completed_units=int(job.state=='completed'),
                    total_units=1, percent=100 if job.state=='completed' else 0)
    if job.state == 'completed':
        return dict(stage='completed',current_section=None,completed_units=len(job.steps),total_units=len(job.steps),percent=100 if document.pdf_hash else 95)
    steps = job_pipeline(job,document)
    done = job.steps or {}
    percent = sum(weight for key,_,weight in steps if key in done)
    if not document.file_hash or not document.pdf_hash or job.state != 'completed':
        percent = min(percent, 95)
    current = next((title for key,title,_ in steps if key not in done), None)
    return dict(stage=job.stage, current_section=current, completed_units=sum(k in done for k,_,_ in steps),
                total_units=len(steps), percent=round(percent,2))


def build(document, steps, units=None):
    from docx.shared import Cm, Pt
    output = docx.Document()
    section = output.sections[0]
    section.page_width,section.page_height = Cm(21),Cm(29.7)
    section.top_margin,section.bottom_margin = Cm(2),Cm(2)
    section.left_margin,section.right_margin = Cm(3),Cm(1)
    normal = output.styles['Normal']
    normal.font.name,normal.font.size = 'Times New Roman',Pt(14)
    normal.paragraph_format.line_spacing = 1.5
    normal.paragraph_format.space_after = Pt(0)
    normal.paragraph_format.first_line_indent = Cm(1.25)
    from docx.shared import RGBColor
    from docx.oxml.ns import qn
    for name in ('Normal','Title','Heading 1','Heading 2'):
        style = output.styles[name]
        style.font.name,style.font.size = 'Times New Roman',Pt(14)
        style.font.color.rgb = RGBColor(0,0,0)
        fonts = style.element.get_or_add_rPr().find(qn('w:rFonts'))
        if fonts is not None:
            for key in list(fonts.attrib):
                if 'theme' in key.lower(): del fonts.attrib[key]
            for script in ('ascii','hAnsi','eastAsia','cs'): fonts.set(qn('w:'+script),'Times New Roman')
        style.paragraph_format.space_before = Pt(12 if name.startswith('Heading') else 0)
        style.paragraph_format.space_after = Pt(0)
        if name != 'Normal': style.paragraph_format.first_line_indent = Cm(0)
        borders = style.element.get_or_add_pPr().find(qn('w:pBdr'))
        if borders is not None: borders.getparent().remove(borders)
    output.styles['Title'].font.bold = True
    output.add_heading(document.topic,0)
    output.add_paragraph('Учебная работа')
    output.add_heading('Содержание',1)
    for c in document.approved_plan['chapters']:
        output.add_paragraph(c['title'])
        for title in c['sections']: output.add_paragraph(title)
    previous_chapter = None
    for key, heading, _ in ([(u['key'],u['heading'],u['weight']) for u in units] if units else pipeline(document.approved_plan,document.settings if hasattr(document,"settings") else {}))[:-3]:
        content = Content.model_validate(steps[key]).checked()
        if key.startswith('section_'):
            number,rest = heading.split(' ',1)
            chapter_number = int(number.split('.')[0])
            if previous_chapter != chapter_number:
                output.add_heading(f'Глава {chapter_number}. '+document.approved_plan['chapters'][chapter_number-1]['title'],1)
                previous_chapter = chapter_number
            output.add_heading(number+' '+rest.split(': ',1)[-1],2)
        else:
            output.add_heading(heading, level=1)
        for text in content.paragraphs:
            output.add_paragraph(text)
        if content.table:
            render_table(output, **content.table.model_dump())
    output.add_paragraph('Учебный AI-черновик. Факты и библиографические сведения требуют ручной проверки.')
    buf = io.BytesIO()
    output.save(buf)
    data = buf.getvalue()
    verify_docx(data, steps)
    return data


def verify_docx(data, steps=None):
    if not 1000 <= len(data) <= 5*1024*1024:
        raise ValueError('file_size_limit')
    output = docx.Document(io.BytesIO(data))
    text = '\n'.join(p.text for p in output.paragraphs)
    if steps:
        for key, content in steps.items():
            if key in ('validation','docx','pdf'):
                continue
            for p in content['paragraphs']:
                if p not in text:
                    raise ValueError('docx_content_missing')
    if len(text) < 100:
        raise ValueError('empty_docx')


def store(document, data, attempt_token):
    # Attempt-specific immutable path prevents a stale worker overwriting a new file.
    if cfg.STORAGE == 'bytea':
        document.file_bytes = data
    folder = cfg.DATA_DIR / 'documents'
    folder.mkdir(parents=True, exist_ok=True)
    target = folder / f'{document.id}-{attempt_token}.docx'
    temporary = target.with_suffix('.tmp')
    with temporary.open('wb') as f:
        f.write(data)
        f.flush()
        os.fsync(f.fileno())
    os.replace(temporary, target)
    document.file_path = str(target.resolve())
    document.file_hash = hashlib.sha256(data).hexdigest()
    document.expires = now()+86400


def read(document):
    if not document.file_hash or not document.expires or document.expires <= now():
        raise FileNotFoundError('document_expired_or_missing')
    data = document.file_bytes if document.file_bytes is not None else Path(document.file_path).read_bytes()
    if hashlib.sha256(data).hexdigest() != document.file_hash:
        raise ValueError('file_integrity_error')
    verify_docx(data)
    return data


def read_pdf(document):
    if not document.pdf_hash or not document.expires or document.expires <= now():
        raise FileNotFoundError('delivery_expired')
    data = Path(document.pdf_path).read_bytes()
    if hashlib.sha256(data).hexdigest() != document.pdf_hash:
        raise ValueError('pdf_integrity_error')
    return data


def convert_pdf(document):
    import subprocess
    import tempfile
    from pypdf import PdfReader
    source = Path(document.file_path).resolve()
    target = source.with_suffix('.pdf')
    if cfg.PDF_CONVERTER == 'libreoffice':
        with tempfile.TemporaryDirectory(prefix='gost-lo-') as profile:
            subprocess.run([cfg.SOFFICE, '-env:UserInstallation='+Path(profile).as_uri(), '--headless',
                            '--convert-to','pdf','--outdir',str(source.parent),str(source)],
                           timeout=120,check=True,capture_output=True)
    else:
        # Trusted locally generated DOCX only. Dedicated Word instance, macros disabled,
        # no network content, output hidden. Process lifetime is bounded by subprocess.
        script = Path(__file__).with_name('word_pdf.ps1')
        subprocess.run(['powershell.exe','-NoProfile','-NonInteractive','-File',str(script),
                        '-Source',str(source),'-Target',str(target)],timeout=120,check=True,capture_output=True)
    if target.stat().st_size > 20*1024*1024: raise ValueError('pdf_size_limit')
    data = target.read_bytes()
    reader = PdfReader(io.BytesIO(data))
    text = ''.join(page.extract_text() or '' for page in reader.pages)
    if len(text) < 100 or not any('а' <= c.lower() <= 'я' for c in text):
        raise ValueError('pdf_text_missing')
    # Both representations must contain the same paragraphs (normalize PDF line wrapping).
    import re
    norm = lambda x: re.sub(r'\s+','',x).replace('\u00ad','')
    word = docx.Document(io.BytesIO(read(document)))
    compact = norm(text)
    for p in word.paragraphs:
        if p.text and norm(p.text) not in compact:
            raise ValueError('pdf_content_mismatch')
    for table in word.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text and norm(cell.text) not in compact: raise ValueError('pdf_table_mismatch')
    document.pdf_path = str(target)
    document.pdf_hash = hashlib.sha256(data).hexdigest()
    document.actual_pages = len(reader.pages)


def expire(db):
    from sqlalchemy import select
    from .models import Document, Job
    for document in db.scalars(select(Document).where(Document.expires <= now(),
                              Document.delivery_id.is_not(None)).with_for_update(skip_locked=True)):
        active = db.scalar(select(Job.id).where(Job.document_id == document.id,Job.state.in_(['queued','running','retry'])))
        if active: continue
        root = (cfg.DATA_DIR/'documents').resolve()
        for file in (document.file_path,document.pdf_path):
            if file:
                path = Path(file).resolve()
                if path.is_relative_to(root): path.unlink(missing_ok=True)
        for path in root.glob(document.id+'-*'):
            if path.is_file() and path.suffix in ('.tmp','.docx','.pdf'): path.unlink(missing_ok=True)
        document.file_bytes = document.file_path = document.pdf_path = None
        document.file_hash = document.pdf_hash = None
        document.plan = document.approved_plan = None
        if document.state == 'completed': document.state = 'expired'
        for job in db.scalars(select(Job).where(Job.document_id == document.id)):
            job.steps = {key:{'expired':True} for key in job.steps}
            job.units = [{k:v for k,v in u.items() if k != 'heading'} for u in job.units]
