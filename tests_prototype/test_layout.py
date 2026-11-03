"""Formatting contracts: no outline toggles, server profile, real pagination."""
import io
from types import SimpleNamespace
import pytest
from docx import Document
from docx.oxml.ns import qn
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pypdf import PdfReader
from app.prototype import documents
from app.prototype.layout import normalize, body_units
from app.prototype.schemas import Draft

PLAN={'chapters':[{'title':'Принципы сохранения данных','sections':['Классификация информации','Выбор стратегии']},
                  {'title':'Контроль восстановления','sections':['Проверка копий','Оценка результата']} ]}


def fixture_document(pages):
    d=SimpleNamespace(id='layout-test',topic='Резервное копирование учебных данных',doc_type='abstract',
        settings={'pages':pages,'chapters':2,'subject':'Информатика'},
        approved_plan=PLAN,title_data={'name':'Тестовый автор','year':2026,'title_defaults':{
            'university':'Тестовый университет','department':'Информационные системы','studentName':'Автор А. А.',
            'supervisor':'Руководитель Б. Б.','city':'Тестовый город','group':'ТЕСТ-1'}})
    units=documents.freeze_units(d.settings,PLAN)
    text=('Сохранение данных - важная часть работы информационной системы. '
          'Резервная копия позволяет восстановить сведения после сбоя оборудования. '
          'Качество копирования проверяют с помощью контрольного восстановления. ')
    steps={u['key']:{'paragraphs':[text]*2,'table':None} for u in units if u['key'] not in ('validation','docx','pdf')}
    steps['bibliography']={'paragraphs':['Список использованных источников','1. Тестовый источник для проверки оформления. '
                                        'Издание используется только в автоматическом тесте и не является научной библиографией.'],'table':None}
    steps['intro']['paragraphs'][0]=steps['intro']['paragraphs'][0].replace(' - ',' — ')
    return d,units,steps


def test_word_structure_and_no_collapsible_headings():
    d,units,steps=fixture_document(10)
    data=documents.build(d,steps,units)
    word=Document(io.BytesIO(data))
    assert word.sections[0].right_margin.cm==pytest.approx(1.5,abs=.01)
    assert word.sections[0].different_first_page_header_footer
    assert 'Тестовый город, 2026' in word.sections[0].first_page_footer.paragraphs[0].text
    text='\n'.join(p.text for p in word.paragraphs)
    assert 'Автор А. А.' in text and 'Руководитель Б. Б.' in text and 'ТЕСТ-1' in text
    assert '—' not in text and '–' not in text
    assert sum(p.text=='СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ' for p in word.paragraphs)==1
    assert not any(p.text=='Список использованных источников' for p in word.paragraphs)
    assert b'PAGEREF' in word._element.xml.encode()
    for p in word.paragraphs:
        assert not p.style.name.startswith('Heading')
        if p.style.name in ('GostSection','GostChapter','GostSubsection'):
            assert p.style.element.pPr.find(qn('w:outlineLvl')).get(qn('w:val'))=='9'
        if p.style.name=='Normal' and p.text:
            assert p.style.paragraph_format.alignment==WD_ALIGN_PARAGRAPH.JUSTIFY
    assert max(u['page'] for u in body_units(PLAN,d.settings))==8


@pytest.mark.parametrize('pages',[7,10])
def test_real_pdf_exact_pages_and_contents(pages):
    d,units,steps=fixture_document(pages)
    d.file_bytes=None
    documents.store(d,documents.build(d,steps,units),'formatting')
    documents.convert_pdf(d)
    pdf=PdfReader(io.BytesIO(documents.read_pdf(d)))
    assert len(pdf.pages)==pages
    assert 'Тестовый университет' in pdf.pages[0].extract_text()
    assert 'СОДЕРЖАНИЕ' in pdf.pages[1].extract_text()
    assert 'ВВЕДЕНИЕ' in pdf.pages[2].extract_text()
    assert 'ЗАКЛЮЧЕНИЕ' in pdf.pages[-2].extract_text()
    assert 'СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ' in pdf.pages[-1].extract_text()
    contents=Document(io.BytesIO(documents.read(d)))
    for p in contents.paragraphs:
        assert not p.style.name.startswith('Heading')
    rows=[p.text for p in contents.paragraphs if p.style.name=='GostContents']
    assert any(row.endswith('3') and row.startswith('Введение') for row in rows)
    assert any(row.endswith(str(pages)) and row.startswith('Список') for row in rows)


def test_impossible_volume_rejected_before_ai():
    with pytest.raises(ValueError): Draft(topic='Тестовая учебная тема',pages=6,chapters=2,anonymized=True)
    with pytest.raises(ValueError): Draft(topic='Тестовая учебная тема',pages=7,chapters=3,anonymized=True)


def test_table_caption_is_numbered_by_server_above_table():
    d,units,steps=fixture_document(7)
    steps['section_0']['table']={'headers':['Метод','Результат'],'rows':[['Копирование','Проверка']],
                                  'caption':'Таблица 99 — Сравнение вариантов'}
    word=Document(io.BytesIO(documents.build(d,steps,units)))
    caption=next(p for p in word.paragraphs if p.text=='Таблица 1 - Сравнение вариантов')
    assert caption.alignment==WD_ALIGN_PARAGRAPH.LEFT
    assert caption.paragraph_format.first_line_indent.cm==0
    assert caption._p.getnext().tag==qn('w:tbl')
    assert word.tables[0].rows[0]._tr.trPr.find(qn('w:tblHeader')) is not None


def test_long_section_is_repaired_without_losing_known_usage(client,monkeypatch):
    from app.prototype.config import cfg
    from app.prototype.models import DB,Job
    from app.prototype.worker import run_one
    from sqlalchemy import select
    from .helpers import signup,TestAI
    from .test_studio_v2 import approved
    signup(client);monkeypatch.setattr(cfg,'MOCK_PAYMENTS',True)
    did,signature=approved(client)
    client.post('/api/v1/documents/'+did+'/orders',json={'method':'cash','approval_hash':signature})
    assert run_one(TestAI())  # Introduction.
    class RepairAI:
        def __init__(self): self.targets=[]
        def generate(self,topic,headings,step,settings=None):
            self.targets.append(settings['target_words'])
            words=300 if len(self.targets)==1 else 40
            return {'paragraphs':[' '.join(['данные']*words)],'table':None},500
    ai=RepairAI()
    run_one(ai)
    with DB.begin() as db:
        job=db.scalar(select(Job).where(Job.document_id==did,Job.kind=='document'))
        assert job.error=='ai_section_too_long' and job.state=='retry'
        assert 'section_0' not in job.steps
        usage=job.usage
        job.retry_at=0
    run_one(ai)
    assert ai.targets[1]<ai.targets[0]
    with DB() as db:
        job=db.scalar(select(Job).where(Job.document_id==did,Job.kind=='document'))
        assert 'section_0' in job.steps and job.usage==usage+500
        assert job.charged==job.usage


def test_failed_partial_document_cannot_be_downloaded(client):
    from app.prototype.models import DB,Document,uid,now
    from .helpers import signup
    owner=signup(client)
    with DB.begin() as db:
        doc=Document(user_id=owner['id'],topic='Проверка запрета частичной выдачи',doc_type='abstract',
                     state='failed',settings={'pages':7},delivery_id=uid(),expires=now()+60,file_hash='a'*64)
        db.add(doc);db.flush();delivery=doc.delivery_id;did=doc.id
    assert client.get('/api/v1/documents/'+did).json()['delivery_id'] is None
    assert client.get('/api/v1/deliveries/'+delivery+'/docx').status_code==409
