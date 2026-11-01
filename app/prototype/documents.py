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


def pipeline(plan):
    n = len(plan['sections'])
    return [('intro','Введение',5)] + [(f'section_{i}', title,75/n) for i,title in enumerate(plan['sections'])] + [
        ('conclusion','Заключение',5), ('bibliography','Список использованных источников',5),
        ('validation','Проверка структуры',5), ('docx','Сохранение DOCX',5)]


def progress(job, document):
    if job.kind == 'plan':
        return dict(stage=job.stage, current_section=None, completed_units=int(job.state=='completed'),
                    total_units=1, percent=100 if job.state=='completed' else 0)
    steps = pipeline(document.approved_plan)
    done = job.steps or {}
    percent = sum(weight for key,_,weight in steps if key in done)
    # Never advertise completion without committed verified file metadata.
    if not document.file_hash or job.state != 'completed':
        percent = min(percent, 95)
    current = next((title for key,title,_ in steps if key not in done), None)
    return dict(stage=job.stage, current_section=current, completed_units=len(done),
                total_units=len(steps), percent=round(percent,2))


def build(document, steps):
    compiler = DocxCompiler({'title':document.topic, 'doc_type':document.doc_type})
    output = compiler.compile()
    for key, heading, _ in pipeline(document.approved_plan)[:-2]:
        content = Content.model_validate(steps[key]).checked()
        output.add_heading(heading, level=1)
        for p in content.paragraphs:
            render_paragraph(output, p)
        if content.table:
            render_table(output, **content.table.model_dump())
    render_paragraph(output, 'Учебный AI-черновик. Библиографические сведения и факты требуют ручной проверки. Источники автоматически не верифицированы.')
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
            if key in ('validation','docx'):
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
    else:
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
    document.expires = now()+90*86400


def read(document):
    if not document.file_hash or not document.expires or document.expires <= now():
        raise FileNotFoundError('document_expired_or_missing')
    data = document.file_bytes if document.file_bytes is not None else Path(document.file_path).read_bytes()
    if hashlib.sha256(data).hexdigest() != document.file_hash:
        raise ValueError('file_integrity_error')
    verify_docx(data)
    return data


def expire(db):
    from sqlalchemy import select
    from .models import Document, Job
    for document in db.scalars(select(Document).where(Document.expires <= now(),
                              Document.state == 'completed').with_for_update(skip_locked=True)):
        if document.file_path:
            path = Path(document.file_path).resolve()
            root = (cfg.DATA_DIR/'documents').resolve()
            if path.is_relative_to(root):
                path.unlink(missing_ok=True)
        document.file_bytes = None
        document.file_path = None
        document.file_hash = None
        document.state = 'expired'
        for job in db.scalars(select(Job).where(Job.document_id == document.id)):
            job.steps = {key:{'expired':True} for key in job.steps}
