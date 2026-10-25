export interface PdfExportData {
  title: string;
  authorName?: string;
  university?: string;
  department?: string;
  city?: string;
  year?: number;
  docType?: "coursework" | "abstract" | "vkr" | string;
  pageCount?: number;
}

export function generateGostHtmlDocument(data: PdfExportData): string {
  const title = data.title || "Научно-исследовательская работа";
  const author = data.authorName || "Иванов Иван Иванович";
  const university = data.university || "ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ";
  const department = data.department || "Кафедра «Информационные системы и технологии»";
  const city = data.city || "Москва";
  const year = data.year || 2026;
  const docTypeLabel =
    data.docType === "vkr"
      ? "ВЫПУСКНАЯ КВАЛИФИКАЦИОННАЯ РАБОТА"
      : data.docType === "abstract"
      ? "РЕФЕРАТ"
      : "КУРСОВАЯ РАБОТА";

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${title} — ГОСТ 7.32-2017</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background: #525659;
      font-family: "Times New Roman", Times, serif;
      font-size: 14pt;
      line-height: 1.5;
      color: #000;
      -webkit-print-color-adjust: exact;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      background: #323639;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.4);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
    }
    .toolbar-title {
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 480px;
    }
    .toolbar-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .toolbar-btn {
      background: #474b4e;
      color: #fff;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 6px;
      padding: 6px 14px;
      font-size: 12px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.15s;
    }
    .toolbar-btn:hover {
      background: #5a5f63;
    }
    .toolbar-btn.primary {
      background: #2563eb;
      border-color: #3b82f6;
    }
    .toolbar-btn.primary:hover {
      background: #1d4ed8;
    }
    .pages-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 0 60px 0;
      gap: 24px;
    }
    .sheet {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 10mm 20mm 30mm; /* Верх 20, Право 10, Низ 20, Лево 30 */
      background: #ffffff;
      box-shadow: 0 4px 18px rgba(0,0,0,0.3);
      position: relative;
      page-break-after: always;
      break-after: page;
      text-align: justify;
    }
    p {
      text-indent: 1.25cm;
      margin-bottom: 0;
    }
    h1, h2, h3 {
      font-weight: bold;
      margin: 0;
      padding: 0;
    }
    .h1-center {
      text-align: center;
      text-transform: uppercase;
      font-size: 14pt;
      margin-bottom: 15pt;
      text-indent: 0;
    }
    .h2-left {
      text-align: left;
      font-size: 14pt;
      margin-top: 15pt;
      margin-bottom: 12pt;
      text-indent: 1.25cm;
    }
    .pagenum {
      position: absolute;
      top: 12mm;
      right: 10mm;
      font-size: 12pt;
      font-weight: normal;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15pt 0;
      font-size: 12pt;
      line-height: 1.3;
    }
    th, td {
      border: 1px solid #000;
      padding: 6pt 8pt;
      text-align: center;
    }
    td.text-left {
      text-align: left;
    }
    .table-caption {
      text-indent: 1.25cm;
      font-size: 12pt;
      font-style: italic;
      margin-bottom: 4pt;
      text-align: left;
    }
    .formula-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 14pt 0;
      font-size: 13pt;
      font-style: italic;
    }
    @media print {
      body {
        background: none;
      }
      .toolbar {
        display: none !important;
      }
      .pages-container {
        padding: 0;
        gap: 0;
      }
      .sheet {
        box-shadow: none;
        margin: 0;
        width: 100%;
        min-height: 100%;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div class="toolbar-title">📄 ${title} — Соответствие ГОСТ 7.32-2017</div>
    <div class="toolbar-actions">
      <button class="toolbar-btn primary" onclick="window.print()">🖨️ Печать / Сохранить в PDF</button>
      <button class="toolbar-btn" onclick="window.close()">Закрыть вкладку</button>
    </div>
  </div>

  <div class="pages-container">
    <!-- СТРАНИЦА 1: ТИТУЛЬНЫЙ ЛИСТ -->
    <div class="sheet">
      <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between; text-align: center;">
        <div style="font-size: 11pt; font-weight: bold; line-height: 1.3;">
          МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ РОССИЙСКОЙ ФЕДЕРАЦИИ<br>
          ${university}<br>
          <span style="font-weight: normal; font-size: 11pt; margin-top: 6pt; display: inline-block;">${department}</span>
        </div>

        <div style="margin: 40pt 0;">
          <div style="font-size: 16pt; font-weight: bold; letter-spacing: 2px;">${docTypeLabel}</div>
          <div style="font-size: 12pt; font-style: italic; margin-top: 6pt;">по дисциплине «Информационные системы и аналитика данных»</div>
          <div style="font-size: 14pt; font-weight: bold; text-transform: uppercase; margin-top: 24pt; line-height: 1.4; padding: 0 10pt;">
            на тему: «${title}»
          </div>
        </div>

        <div style="text-align: right; font-size: 12pt; line-height: 1.6; padding-right: 20pt;">
          <p style="text-indent: 0;">Выполнил студент: <b>${author}</b></p>
          <p style="text-indent: 0;">Курс 3, группа ПИ-301</p>
          <p style="text-indent: 0;">Научный руководитель: доц., к.т.н. Смирнов А. В.</p>
          <p style="text-indent: 0; margin-top: 8pt;">Оценка: __________________</p>
        </div>

        <div style="font-size: 12pt; margin-top: 40pt;">
          ${city} — ${year}
        </div>
      </div>
    </div>

    <!-- СТРАНИЦА 2: СОДЕРЖАНИЕ -->
    <div class="sheet">
      <div class="pagenum">2</div>
      <div class="h1-center">СОДЕРЖАНИЕ</div>
      
      <div style="font-size: 13pt; line-height: 1.8; margin-top: 20pt;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888;">
          <span>ВВЕДЕНИЕ</span><span style="font-weight: bold;">3</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888; margin-top: 8pt;">
          <span>1 ТЕОРЕТИЧЕСКИЕ ОСНОВЫ ИССЛЕДУЕМОЙ ОБЛАСТИ</span><span style="font-weight: bold;">5</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888; padding-left: 20pt;">
          <span>1.1 Понятие, сущность и ключевые характеристики</span><span style="font-weight: bold;">5</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888; padding-left: 20pt;">
          <span>1.2 Нормативно-правовое регулирование и стандарты ГОСТ</span><span style="font-weight: bold;">9</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888; margin-top: 8pt;">
          <span>2 ПРАКТИЧЕСКИЙ АНАЛИЗ И РАЗРАБОТКА РЕШЕНИЙ</span><span style="font-weight: bold;">14</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888; padding-left: 20pt;">
          <span>2.1 Анализ показателей и моделирование процессов</span><span style="font-weight: bold;">14</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888; padding-left: 20pt;">
          <span>2.2 Оценка эффективности и рекомендации</span><span style="font-weight: bold;">20</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888; margin-top: 8pt;">
          <span>ЗАКЛЮЧЕНИЕ</span><span style="font-weight: bold;">26</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #888; margin-top: 8pt;">
          <span>СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ</span><span style="font-weight: bold;">28</span>
        </div>
      </div>
    </div>

    <!-- СТРАНИЦА 3: ВВЕДЕНИЕ -->
    <div class="sheet">
      <div class="pagenum">3</div>
      <div class="h1-center">ВВЕДЕНИЕ</div>

      <p><b>Актуальность темы исследования.</b> В условиях глобальной цифровизации и внедрения интеллектуальных информационных систем тема «${title}» приобретает непреходящее научно-практическое значение. Необходимость повышения эффективности и снижения трудоемкости обусловливает потребность в глубоком концептуальном переосмыслении существующих подходов.</p>

      <p><b>Степень научной разработанности проблемы.</b> Вопросам автоматизации и применения современных методов посвящены труды ведущих отечественных и зарубежных авторов. Вместе с тем, специфика современных стандартов требует дальнейшей детализации инструментальных механизмов.</p>

      <p><b>Объектом исследования</b> выступает совокупность организационных, правовых и технологических процессов в рассматриваемой предметной области.</p>

      <p><b>Предметом исследования</b> являются методы, методики и инструментальные алгоритмы оптимизации указанных процессов в соответствии с требованиями стандартов.</p>

      <p><b>Цель исследования</b> заключается в теоретическом обосновании и выработке научно выверенных практических рекомендаций по направлению «${title}».</p>

      <p>Для достижения поставленной цели в работе решены следующие задачи:</p>
      <p style="text-indent: 2cm;">1) исследовать теоретические и понятийные основы предметной области;</p>
      <p style="text-indent: 2cm;">2) проанализировать действующую нормативно-правовую базу РФ;</p>
      <p style="text-indent: 2cm;">3) разработать комплекс практических мер и оценить их результативность.</p>

      <p><b>Методологическую основу</b> составили методы системного анализа, математической статистики, сравнительного анализа и моделирования бизнес-процессов.</p>
    </div>

    <!-- СТРАНИЦА 4: ГЛАВА 1 -->
    <div class="sheet">
      <div class="pagenum">4</div>
      <div class="h1-center">1 ТЕОРЕТИЧЕСКИЕ ОСНОВЫ ИССЛЕДУЕМОЙ ОБЛАСТИ</div>
      <div class="h2-left">1.1 Понятие, сущность и ключевые характеристики</div>

      <p>Теоретический анализ показывает, что системный подход позволяет наиболее точно формализовать требования к функционалу и надежности при решении поставленной исследовательской задачи. На современном этапе развития ключевое место занимают детерминированные алгоритмы верификации данных [1, c. 45].</p>

      <p>В соответствии с ГОСТ 7.32-2017 структурная связность элементов отчета должна быть обеспечена сквозной логической линией от формулировки задач до выводов.</p>

      <div class="table-caption">Таблица 1.1 — Сравнительный анализ классических и автоматизированных подходов</div>
      <table>
        <thead>
          <tr style="background: #f2f2f2;">
            <th>Критерий оценки</th>
            <th>Традиционный подход</th>
            <th>Интеллектуальная система (ГОСТ)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-left">Время подготовки документа</td>
            <td>40–60 часов</td>
            <td>Менее 3 минут</td>
          </tr>
          <tr>
            <td class="text-left">Соответствие полям 30/10/20/20 мм</td>
            <td>Требует ручной подгонки</td>
            <td>100% математическая гарантия</td>
          </tr>
          <tr>
            <td class="text-left">Оригинальность (Антиплагиат.ВУЗ)</td>
            <td>50–65%</td>
            <td>85–98% без скрытых обходов</td>
          </tr>
        </tbody>
      </table>

      <p>Эффективность внедрения разработанной модели оценивается по формуле (1.1):</p>
      
      <div class="formula-row">
        <div style="flex: 1; text-align: center;">
          К_{эфф} = \\frac{T_{ручн} - T_{автом}}{T_{ручн}} \\times 100\\%
        </div>
        <div style="font-weight: bold; font-style: normal;">(1.1)</div>
      </div>

      <p>где <i>T_{ручн}</i> — трудоемкость стандартного процесса, ч.; <i>T_{автом}</i> — машинное время обработки запроса, мин.</p>
    </div>

    <!-- СТРАНИЦА 5: ЗАКЛЮЧЕНИЕ И ЛИТЕРАТУРА -->
    <div class="sheet">
      <div class="pagenum">5</div>
      <div class="h1-center">ЗАКЛЮЧЕНИЕ</div>

      <p>В ходе проведения исследования были успешно достигнуты все поставленные цели и решены теоретические и практические задачи. Выполнен подробный аналитический обзор литературы, сформирован концептуальный аппарат и рассчитаны коэффициенты практической эффективности.</p>

      <p>Полученные результаты внедрения подтверждают целесообразность применения предложенных методик и гарантируют соблюдение требований нормативной документации.</p>

      <div class="h1-center" style="margin-top: 25pt;">СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ</div>

      <div style="font-size: 12pt; line-height: 1.5; margin-top: 15pt;">
        <p style="text-indent: 1.25cm; margin-bottom: 6pt;">1. ГОСТ 7.32-2017. Система стандартов по информации, библиотечному и издательскому делу. Отчет о научно-исследовательской работе. Структура и правила оформления. — М.: Стандартинформ, 2018. — 32 с.</p>
        <p style="text-indent: 1.25cm; margin-bottom: 6pt;">2. ГОСТ Р 7.0.100-2018. Библиографическая запись. Библиографическое описание. Общие требования и правила составления. — М.: Стандартинформ, 2018. — 124 с.</p>
        <p style="text-indent: 1.25cm; margin-bottom: 6pt;">3. Иванов, А. А. Автоматизация научных исследований и нормоконтроль / А. А. Иванов. — Москва: Юрайт, 2024. — 215 с.</p>
        <p style="text-indent: 1.25cm; margin-bottom: 6pt;">4. Смирнов, В. И. Применение интеллектуальных алгоритмов в образовательном процессе / В. И. Смирнов // Вестник высшей школы. — 2025. — № 4. — С. 18–24.</p>
        <p style="text-indent: 1.25cm; margin-bottom: 6pt;">5. Официальный сайт Министерства науки и высшего образования Российской Федерации. — URL: https://minobrnauki.gov.ru (дата обращения: 24.10.2026).</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function openPdfInBrowser(data: PdfExportData) {
  const htmlContent = generateGostHtmlDocument(data);
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
