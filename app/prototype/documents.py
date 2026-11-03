import hashlib
import io
import os
from pathlib import Path
from pydantic import BaseModel, ConfigDict, Field
import docx
from .config import cfg
from .models import now


class Table(BaseModel):
    model_config = ConfigDict(extra='forbid')
    headers: list[str] = Field(min_length=1, max_length=6)
    rows: list[list[str]] = Field(min_length=1, max_length=20)
    caption: str = Field(max_length=200)


class Formula(BaseModel):
    model_config = ConfigDict(extra='forbid')
    expression: str = Field(min_length=3,max_length=180)
    symbols: list[str] = Field(default_factory=list,max_length=3)


class Listing(BaseModel):
    model_config = ConfigDict(extra='forbid')
    language: str = Field(default='text',max_length=30)
    caption: str = Field(min_length=3,max_length=120)
    code: str = Field(min_length=3,max_length=1200)


class Content(BaseModel):
    model_config = ConfigDict(extra='forbid')
    paragraphs: list[str] = Field(min_length=1, max_length=12)
    table: Table | None = None
    formula: Formula | None = None
    listing: Listing | None = None

    def checked(self):
        if not 80 <= sum(len(x) for x in self.paragraphs) <= 16000:
            raise ValueError('invalid_content_length')
        if self.table:
            if any(len(row) != len(self.table.headers) for row in self.table.rows):
                raise ValueError('invalid_table_width')
            if any(len(cell) > 1000 for row in self.table.rows for cell in row):
                raise ValueError('invalid_table_cell')
        def strings(value):
            if isinstance(value,str): yield value
            elif isinstance(value,dict):
                for child in value.values(): yield from strings(child)
            elif isinstance(value,list):
                for child in value: yield from strings(child)
        for text in strings(self.model_dump()):
            if any(ord(ch) < 32 and ch not in '\n\t' for ch in text):
                raise ValueError('invalid_xml_character')
        if sum(value is not None for value in (self.table,self.formula,self.listing))>1:
            raise ValueError('one_material_per_section')
        if self.formula and any(len(s)>160 for s in self.formula.symbols): raise ValueError('formula_symbol_too_long')
        if self.listing and (len(self.listing.code.splitlines())>8 or any(len(s)>72 for s in self.listing.code.splitlines())):
            raise ValueError('listing_too_large')
        return self


def pipeline(plan, settings=None):
    from .layout import body_units
    body = body_units(plan, settings or {})
    return [('intro','Введение',5)] + [(u['key'], u['heading'],70/len(body)) for u in body] + [
        ('conclusion','Заключение',5), ('bibliography','Список использованных источников',5),
        ('validation','Проверка структуры',5), ('docx','Сохранение Word',5), ('pdf','PDF и проверка выдачи',5)]


def freeze_units(settings, plan):
    from .layout import body_units, minimum_pages
    body = {u['key']:u for u in body_units(plan,settings)}
    requested = settings.get('pages',minimum_pages(len(plan['chapters'])))
    return [{'key':key,'heading':heading,'weight':weight,
             **(body[key] if key in body else {'page':{'intro':3,'conclusion':requested-1,'bibliography':requested}.get(key)}),
             'target_words':generation_settings(settings,plan,key)['target_words'],
             'material_kind':generation_settings(settings,plan,key)['material_kind']}
            for key,heading,weight in pipeline(plan,settings)]


def job_pipeline(job,document):
    return [(u['key'],u['heading'],u['weight']) for u in job.units] if job.units else pipeline(document.approved_plan,document.settings)


def generation_settings(settings, plan, key, units=None):
    from .layout import body_units
    result = dict(settings)
    targets = {'intro':160, 'conclusion':140, 'bibliography':100, **{u['key']:u['target_words'] for u in body_units(plan,settings)}}
    result['target_words'] = next(u['target_words'] for u in units if u['key']==key) if units else targets.get(key,0)
    material='none'
    if settings.get('include_materials'):
        seen=set();slots={}
        for u in body_units(plan,settings):
            if u['page'] not in seen:
                index=len(seen);seen.add(u['page'])
                if index<3: slots[u['key']]=('table','formula','listing')[index]
        material=slots.get(key,'none')
    result['material_kind']=material
    if units: result['material_kind']=next(u for u in units if u['key']==key).get('material_kind',material)
    if material!='none' and not units: result['target_words']=max(25,result['target_words']-45)
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
    from .layout import build as render
    units = units or freeze_units(document.settings, document.approved_plan)
    data = render(document, steps, units, Content)
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
            from .layout import content_paragraphs, normalize
            heading = {'intro':'Введение','conclusion':'Заключение','bibliography':'Список использованных источников'}.get(key, '')
            for p in content_paragraphs(content, heading):
                if normalize(p) not in text:
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
            # Save refreshed PAGEREF field results into the downloadable DOCX too.
            refreshed = Path(profile) / 'refreshed'
            refreshed.mkdir()
            subprocess.run([cfg.SOFFICE, '-env:UserInstallation='+Path(profile).as_uri(), '--headless',
                            '--convert-to','docx','--outdir',str(refreshed),str(source)],
                           timeout=120,check=True,capture_output=True)
            os.replace(refreshed/source.name,source)
            subprocess.run([cfg.SOFFICE, '-env:UserInstallation='+Path(profile).as_uri(), '--headless',
                            '--convert-to','pdf','--outdir',str(source.parent),str(source)],
                           timeout=120,check=True,capture_output=True)
    else:
        # Trusted locally generated DOCX only. Dedicated Word instance, macros disabled,
        # no network content, output hidden. Process lifetime is bounded by subprocess.
        script = Path(__file__).with_name('word_pdf.ps1')
        subprocess.run(['powershell.exe','-NoProfile','-NonInteractive','-File',str(script),
                        '-Source',str(source),'-Target',str(target)],timeout=120,check=True,capture_output=True)
    refreshed = source.read_bytes()
    document.file_hash = hashlib.sha256(refreshed).hexdigest()
    if document.file_bytes is not None: document.file_bytes = refreshed
    if target.stat().st_size > 20*1024*1024: raise ValueError('pdf_size_limit')
    data = target.read_bytes()
    reader = PdfReader(io.BytesIO(data))
    from .providers import ProviderError
    requested = document.settings.get('pages')
    if requested and len(reader.pages) != requested:
        raise ProviderError('page_count_mismatch')
    text = ''.join(page.extract_text() or '' for page in reader.pages)
    if len(text) < 100 or not any('а' <= c.lower() <= 'я' for c in text):
        raise ValueError('pdf_text_missing')
    # Both representations must contain the same paragraphs (normalize PDF line wrapping).
    import re
    import unicodedata
    # Word exports OMML letters as mathematical italic Unicode glyphs.
    # Compatibility normalization compares the actual characters, not font variants.
    norm = lambda x: re.sub(r'\s+','',unicodedata.normalize('NFKC',x)).replace('\u00ad','')
    word = docx.Document(io.BytesIO(read(document)))
    compact = norm(text)
    for p in word.paragraphs:
        comparable = re.sub(r'\.{2,}', '', compact) if p.style.name == 'GostContents' else compact
        if p.text and norm(p.text) not in comparable:
            raise ValueError('pdf_content_mismatch')
    for table in word.tables:
        for row in table.rows:
            for cell in row.cells:
                if cell.text and norm(cell.text) not in compact: raise ValueError('pdf_table_mismatch')
    for element in word._element.xpath('//m:t'):
        if element.text and norm(element.text) not in compact: raise ValueError('pdf_formula_mismatch')
    document.pdf_path = str(target)
    document.pdf_hash = hashlib.sha256(data).hexdigest()
    document.actual_pages = len(reader.pages)


def expire(db):
    from sqlalchemy import select
    from .models import Document, Job
    for document in db.scalars(select(Document).where(Document.expires <= now(),
                              Document.delivery_id.is_not(None)).with_for_update(skip_locked=True)):
        active = db.scalar(select(Job.id).where(Job.document_id == document.id,Job.state.in_(['queued','running','retry','paused'])))
        if active: continue
        root = (cfg.DATA_DIR/'documents').resolve()
        for file in (document.file_path,document.pdf_path):
            if file:
                path = Path(file).resolve()
                if path.is_relative_to(root): path.unlink(missing_ok=True)
        for path in root.glob(document.id+'-*'):
            if path.is_file() and path.suffix in ('.tmp','.docx','.pdf'): path.unlink(missing_ok=True)
        document.file_bytes = document.file_path = document.pdf_path = None
        document.title_data = {}
        document.file_hash = document.pdf_hash = None
        document.plan = document.approved_plan = None
        if document.state == 'completed': document.state = 'expired'
        for job in db.scalars(select(Job).where(Job.document_id == document.id)):
            job.steps = {key:{'expired':True} for key in job.steps}
            job.units = [{k:v for k,v in u.items() if k != 'heading'} for u in job.units]
