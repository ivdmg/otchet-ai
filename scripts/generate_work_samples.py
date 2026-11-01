"""Generate small, standalone PDF formatting samples for the landing gallery."""
from pathlib import Path
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'samples'
OUT.mkdir(parents=True, exist_ok=True)
pdfmetrics.registerFont(TTFont('SampleTimes', 'C:/Windows/Fonts/times.ttf'))
pdfmetrics.registerFont(TTFont('SampleTimesBold', 'C:/Windows/Fonts/timesbd.ttf'))
body = ParagraphStyle('body', fontName='SampleTimes', fontSize=14, leading=21, alignment=TA_JUSTIFY, firstLineIndent=12.5*mm, spaceAfter=8)
heading = ParagraphStyle('heading', fontName='SampleTimesBold', fontSize=14, leading=21, alignment=TA_CENTER, spaceAfter=20)
center = ParagraphStyle('center', parent=body, alignment=TA_CENTER, firstLineIndent=0)
small = ParagraphStyle('small', parent=body, fontSize=11, leading=16, firstLineIndent=0)
samples = [
 ('coursework', 'КУРСОВАЯ РАБОТА', 'Искусственный интеллект в банковской сфере', 'Экономика',
  'Использование интеллектуальных систем позволяет банкам анализировать операции, выявлять нетипичные действия и повышать доступность финансовых услуг. При этом качество решений зависит от полноты данных и организации контроля.',
  'Применение интеллектуальных систем', [('Оценка рисков', 'Анализ данных заёмщика'), ('Обслуживание', 'Классификация обращений'), ('Безопасность', 'Выявление нетипичных операций')]),
 ('abstract', 'РЕФЕРАТ', 'Цифровая культура современного общества', 'Культурология',
  'Цифровая среда меняет способы общения, получения знаний и участия в культурной жизни. Доступность инструментов публикации расширяет возможности человека, одновременно повышая значение информационной грамотности.',
  'Формы цифрового взаимодействия', [('Образование', 'Доступ к цифровым коллекциям'), ('Коммуникация', 'Совместное создание материалов'), ('Культура', 'Распространение творческих работ')]),
 ('thesis', 'ДИПЛОМНАЯ РАБОТА', 'Развитие электронной коммерции', 'Менеджмент',
  'Электронная коммерция объединяет цифровые каналы продаж, управление ассортиментом и логистические процессы. Анализ клиентского пути помогает определить, на каких этапах возникают трудности и какие изменения требуют проверки.',
  'Направления развития электронной торговли', [('Каталог', 'Полнота описаний товаров'), ('Оформление заказа', 'Понятные условия доставки'), ('Поддержка', 'Своевременные ответы покупателю')]),
]

samples.extend([
 ('marketing', 'КУРСОВАЯ РАБОТА', 'Маркетинг в социальных сетях', 'Маркетинг',
  'Социальные сети объединяют коммуникацию с аудиторией и анализ обратной связи. Разработка стратегии требует определения целей, выбора форматов публикаций и последовательной оценки результатов.',
  'Планирование коммуникации', [('Аудитория', 'Анализ потребностей'), ('Контент', 'Выбор тем и форматов'), ('Аналитика', 'Оценка отклика')]),
 ('ecology', 'РЕФЕРАТ', 'Экология современного города', 'Экология',
  'Городская среда формируется под влиянием транспорта, застройки и использования природных ресурсов. Оценка экологических условий помогает выделить направления развития зелёной инфраструктуры.',
  'Условия городской среды', [('Транспорт', 'Анализ доступности маршрутов'), ('Озеленение', 'Связность зелёных территорий'), ('Ресурсы', 'Раздельный сбор отходов')]),
 ('aviation', 'КУРСОВАЯ РАБОТА', 'Цифровые технологии в гражданской авиации', 'Авиатранспорт',
  'Цифровые инструменты применяются в планировании перевозок, обслуживании пассажиров и управлении данными. Для их внедрения необходимы оценка надёжности и соблюдение установленных процедур.',
  'Направления цифровизации', [('Планирование', 'Обработка данных о рейсах'), ('Обслуживание', 'Информирование пассажиров'), ('Подготовка', 'Использование учебных тренажёров')]),
])
PAGE_COUNTS = {'coursework': 10, 'abstract': 12, 'thesis': 20, 'marketing': 15, 'ecology': 8, 'aviation': 18}

def footer(canvas, doc):
    canvas.setTitle(doc.title)
    canvas.setAuthor('Отчёт AI — образцы оформления')
    if doc.page > 1:
        canvas.setFont('SampleTimes', 12)
        canvas.drawCentredString(A4[0]/2, 12*mm, str(doc.page))

for ident, kind, topic, discipline, intro, chapter, rows in samples:
    doc = SimpleDocTemplate(str(OUT / f'{ident}-example.pdf'), pagesize=A4, leftMargin=30*mm, rightMargin=10*mm, topMargin=20*mm, bottomMargin=20*mm, title=topic)
    story = [Paragraph('ОБРАЗЕЦ УЧЕБНОЙ РАБОТЫ', center), Paragraph(f'Дисциплина: {discipline}', center), Spacer(1, 55*mm), Paragraph(kind, heading), Paragraph(f'на тему: «{topic}»', center), Spacer(1, 30*mm), Paragraph(f'Демонстрационный образец.<br/>Пример структуры и оформления, {PAGE_COUNTS[ident]} страниц.', small), Spacer(1, 35*mm), Paragraph('Москва — 2026', center), PageBreak(), Paragraph('СОДЕРЖАНИЕ', heading)]
    for line in ['Введение ..................................................... 3', f'1 {chapter} ................................ 4', 'Заключение и источники ............................... 5']:
        story.append(Paragraph(line, body))
    story += [Spacer(1, 20*mm), Paragraph('Образец показывает титульный лист, оглавление, абзацы, заголовки и таблицу. Полная работа зависит от выбранной темы и требований учебного заведения.', body), PageBreak(), Paragraph('ВВЕДЕНИЕ', heading), Paragraph(intro, body), Paragraph(f'Цель данного демонстрационного фрагмента — обозначить основные направления изучения темы «{topic}» и показать пример организации учебного текста.', body), Paragraph('В рамках работы рассматриваются ключевые понятия, сопоставляются направления применения и формулируются выводы. Содержание носит иллюстративный характер и не заменяет самостоятельное исследование.', body), PageBreak(), Paragraph(f'1 {chapter.upper()}', heading), Paragraph(intro, body), Paragraph('Основные направления представлены в таблице 1. Таблица иллюстрирует связь между предметом анализа и практической задачей.', body), Paragraph('Таблица 1 — Направления анализа', small)]
    table = Table([[Paragraph(a, small), Paragraph(b, small)] for a,b in [('Направление', 'Пример задачи'), *rows]], colWidths=[62*mm, 105*mm])
    table.setStyle(TableStyle([('GRID',(0,0),(-1,-1),.5,colors.black),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7)]))
    story += [table, Spacer(1, 8*mm), Paragraph('Для содержательной оценки необходимо учитывать контекст, ограничения выбранного метода и проверяемость полученных результатов.', body), PageBreak(), Paragraph('ЗАКЛЮЧЕНИЕ', heading), Paragraph('Рассмотренная тема требует последовательного анализа теоретических положений и практических примеров. Выводы должны опираться на проверенные источники и соответствовать цели исследования.', body), Paragraph('Представленный документ — сокращённый образец оформления. Список ниже содержит стандарты, относящиеся к оформлению отчётов и библиографических ссылок.', body), Paragraph('ИСТОЧНИКИ ПО ОФОРМЛЕНИЮ', heading), Paragraph('1. ГОСТ 7.32–2017. Отчёт о научно-исследовательской работе. Структура и правила оформления.', small), Paragraph('2. ГОСТ Р 7.0.5–2008. Библиографическая ссылка. Общие требования и правила составления.', small)]
    for appendix in range(1, PAGE_COUNTS[ident] - 4):
        story += [PageBreak(), Paragraph(f'ПРИЛОЖЕНИЕ {appendix}', heading), Paragraph(f'Материалы к теме «{topic}»', center), Spacer(1, 10*mm), Paragraph(intro, body), Paragraph('Пример аналитического задания: выделить основные понятия, сравнить подходы и обозначить ограничения выбранного решения. Результаты анализа необходимо сопоставить с задачами исследования.', body), Paragraph('Данная страница служит примером оформления приложения. При подготовке собственной работы здесь могут размещаться дополнительные таблицы, описания методов и материалы, связанные с темой исследования.', body)]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(OUT / f'{ident}-example.pdf')
