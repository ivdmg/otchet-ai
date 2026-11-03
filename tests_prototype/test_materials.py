"""Priced material option and actual Word/PDF rendering; explicit AI double only."""
import io
import pytest
from docx import Document as Word
from docx.oxml.ns import qn
from app.prototype import documents
from app.prototype.catalog import quote_price
from app.prototype.config import cfg
from app.prototype.worker import run_one
from .helpers import signup,TestAI,PARAGRAPH
from .test_studio_v2 import approved,INPUT
from .test_layout import fixture_document


@pytest.mark.parametrize('kind,total',[('abstract',21890),('coursework',53900),('vkr',152900)])
def test_price_is_server_side(kind,total):
    q=quote_price(kind,{'include_materials':True})
    assert q['price_kopecks']==total
    assert q['materials_kopecks']+q['base_kopecks']==total


def test_options_invalidate_approval_and_are_locked_after_order(client,monkeypatch):
    signup(client);monkeypatch.setattr(cfg,'MOCK_PAYMENTS',True)
    did,old=approved(client)
    r=client.put(f'/api/v1/documents/{did}/options',json={'include_materials':True})
    assert r.status_code==200 and r.json()['quote']['price_kopecks']==21890
    assert r.json()['approval_hash'] is None
    assert client.post(f'/api/v1/documents/{did}/orders',json={'method':'cash','approval_hash':old}).status_code==409
    sig=client.post(f'/api/v1/documents/{did}/approve').json()['approval_hash']
    order=client.post(f'/api/v1/documents/{did}/orders',json={'method':'cash','approval_hash':sig})
    assert order.status_code==202 and order.json()['amount_kopecks']==21890
    assert client.put(f'/api/v1/documents/{did}/options',json={'include_materials':False}).status_code==409


def test_material_flag_is_strict_boolean(client):
    signup(client)
    assert client.post('/api/v1/documents',json={**INPUT,'include_materials':'false'}).status_code==422


@pytest.mark.parametrize('extra',[
    {'formula':{'expression':'x = a\u0001b'}},
    {'listing':{'caption':'Пример','code':'bad\u0001code'}},
    {'table':{'headers':['bad\u0001header'],'rows':[['данные']],'caption':'Пример'}},
])
def test_invalid_xml_is_rejected_before_checkpoint(extra):
    with pytest.raises(ValueError,match='invalid_xml_character'):
        documents.Content.model_validate({'paragraphs':[PARAGRAPH],**extra}).checked()


def test_real_materials_pdf_has_exact_volume(tmp_path):
    d,_,steps=fixture_document(10)
    d.settings['include_materials']=True
    units=documents.freeze_units(d.settings,d.approved_plan)
    slots={u['material_kind']:u['key'] for u in units if u['material_kind']!='none'}
    assert set(slots)=={'table','formula','listing'}
    steps[slots['table']]['table']={'headers':['Метод','Проверка'],'rows':[['Копирование','Сравнение']], 'caption':'Сравнение методов'}
    steps[slots['formula']]['formula']={'expression':'R = a + b','symbols':['a - первая величина','b - вторая величина']}
    steps[slots['listing']]['listing']={'language':'python','caption':'Пример проверки','code':'result = 2 + 2\nprint(result)'}
    data=documents.build(d,steps,units)
    word=Word(io.BytesIO(data))
    assert word.tables and word._element.xpath('//m:oMath/m:r/m:t')[0].text=='R = a + b'
    code=next(p for p in word.paragraphs if 'result = 2 + 2' in p.text)
    assert code.runs[0].font.name=='Courier New'
    listing=next(p for p in word.paragraphs if p.text.startswith('Листинг 1'))
    assert listing._p.getnext()==code._p
    d.file_bytes=None
    documents.store(d,data,'explicit-material-test')
    documents.convert_pdf(d)
    assert d.actual_pages==10


def test_material_contract_requires_table_in_reserved_slot(client,monkeypatch):
    signup(client);monkeypatch.setattr(cfg,'MOCK_PAYMENTS',True)
    did,_=approved(client)
    client.put(f'/api/v1/documents/{did}/options',json={'include_materials':True})
    sig=client.post(f'/api/v1/documents/{did}/approve').json()['approval_hash']
    client.post(f'/api/v1/documents/{did}/orders',json={'method':'cash','approval_hash':sig})
    run_one(TestAI());run_one(TestAI())
    d=client.get(f'/api/v1/documents/{did}').json()
    job=next(j for j in d['jobs'] if j['kind']=='document')
    assert job['status']=='retry' and job['error']=='invalid_document_content'
