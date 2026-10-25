import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  convertMillimetersToTwip,
} from "docx";
import { saveAs } from "file-saver";

export interface DocExportData {
  title: string;
  authorName?: string;
  institution?: string;
  city?: string;
  year?: number;
  docType?: string;
  pages?: number;
}

export async function exportGostDocx(data: DocExportData) {
  const docTitle = data.title || "Научно-исследовательская работа";
  const author = data.authorName || "Иванов И. И.";
  const institution =
    data.institution ||
    "МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ РОССИЙСКОЙ ФЕДЕРАЦИИ\nФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ";
  const year = data.year || 2026;
  const city = data.city || "Москва";
  const typeText =
    data.docType === "vkr"
      ? "ВЫПУСКНАЯ КВАЛИФИКАЦИОННАЯ РАБОТА"
      : data.docType === "abstract"
      ? "РЕФЕРАТ"
      : "КУРСОВАЯ РАБОТА";

  // ГОСТ 7.32-2017 Размеры полей:
  // Левое: 30 мм, Правое: 10 мм, Верхнее: 20 мм, Нижнее: 20 мм
  const leftMargin = convertMillimetersToTwip(30);
  const rightMargin = convertMillimetersToTwip(10);
  const topMargin = convertMillimetersToTwip(20);
  const bottomMargin = convertMillimetersToTwip(20);

  // Стандартный абзацный отступ по ГОСТ: 1.25 см
  const indentFirstLine = convertMillimetersToTwip(12.5);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Times New Roman",
            size: 28, // 14pt (в полупунктах: 14 * 2 = 28)
            color: "000000",
          },
          paragraph: {
            spacing: {
              line: 360, // 1.5 межстрочный интервал (240 * 1.5)
              before: 0,
              after: 0,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: topMargin,
              bottom: bottomMargin,
              left: leftMargin,
              right: rightMargin,
            },
          },
          titlePage: true, // Первая страница без номера
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: "Times New Roman",
                    size: 24, // 12pt
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // ================= ТИТУЛЬНЫЙ ЛИСТ =================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: institution,
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "Кафедра «Информационные системы и технологии»",
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 240, after: 1200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: typeText,
                bold: true,
                size: 32,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `на тему: «${docTitle}»`,
                bold: true,
                size: 28,
              }),
            ],
            spacing: { before: 200, after: 1400 },
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Выполнил студент: ${author}\nНаучный руководитель: доц., к.т.н. Смирнов А.В.`,
                size: 26,
              }),
            ],
            spacing: { before: 400, after: 1200 },
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `${city} — ${year}`,
                size: 24,
              }),
            ],
            spacing: { before: 800 },
          }),

          // Разрыв страницы после титульного листа
          new Paragraph({
            children: [],
            pageBreakBefore: true,
          }),

          // ================= СОДЕРЖАНИЕ =================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "СОДЕРЖАНИЕ",
                bold: true,
                size: 28,
              }),
            ],
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun("ВВЕДЕНИЕ ...................................................................................................................... 3"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("1 ТЕОРЕТИЧЕСКИЕ ОСНОВЫ ИССЛЕДОВАНИЯ .......................................................... 5"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("  1.1 Понятие и сущность предметной области ............................................................. 5"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("  1.2 Анализ нормативно-правовой базы и современных методов ................................ 9"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("2 АНАЛИЗ И РАЗРАБОТКА ПРОЕКТНЫХ РЕШЕНИЙ .................................................... 14"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("  2.1 Практическая оценка показателей и моделирование процессов .......................... 14"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("  2.2 Оценка эффективности и рекомендации по внедрению ....................................... 19"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("ЗАКЛЮЧЕНИЕ .............................................................................................................. 24"),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun("СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ ....................................................... 26"),
            ],
            spacing: { after: 400 },
          }),

          // ================= ВВЕДЕНИЕ =================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "ВВЕДЕНИЕ",
                bold: true,
                size: 28,
              }),
            ],
            pageBreakBefore: true,
            spacing: { after: 300 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun(
                `Актуальность темы исследования. В современных условиях тема «${docTitle}» приобретает первостепенное значение в связи с непрерывной трансформацией технологических и экономических процессов. Необходимость оптимизации операционной деятельности и внедрения передовых методов обусловливает потребность в глубоком комплексном анализе.`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun(
                "Объектом исследования выступает совокупность социально-экономических и информационных процессов в рассматриваемой предметной области."
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun(
                "Предметом исследования являются методы, алгоритмы и организационно-методические инструменты совершенствования данных процессов."
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun(
                `Цель работы заключается в комплексном исследовании и разработке научно обоснованных предложений по теме «${docTitle}».`
              ),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun(
                "Для достижения поставленной цели необходимо решить следующие задачи:\n1. Изучить теоретические и нормативные основы исследуемой области.\n2. Выполнить сравнительный анализ существующих подходов и методик.\n3. Сформулировать проектные рекомендации и рассчитать их практическую результативность."
              ),
            ],
            spacing: { after: 300 },
          }),

          // ================= ГЛАВА 1 =================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "1 ТЕОРЕТИЧЕСКИЕ ОСНОВЫ ИССЛЕДОВАНИЯ",
                bold: true,
                size: 28,
              }),
            ],
            pageBreakBefore: true,
            spacing: { before: 200, after: 240 },
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: "1.1 Понятие и сущность предметной области",
                bold: true,
                size: 28,
              }),
            ],
            indent: { firstLine: indentFirstLine },
            spacing: { before: 180, after: 200 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun(
                "Теоретический анализ показывает, что системный подход позволяет наиболее точно формализовать требования к функционалу и надежности при решении поставленной задачи. Изучение отечественного и зарубежного опыта свидетельствует о высокой эффективности применения автоматизированных средств контроля и верификации."
              ),
            ],
            spacing: { after: 200 },
          }),

          // Таблица по ГОСТ
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            children: [
              new TextRun({
                text: "Таблица 1.1 — Сравнительная характеристика подходов к автоматизации",
                italics: true,
                size: 24,
              }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Критерий оценки", bold: true, size: 24 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Традиционный подход", bold: true, size: 24 })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: "Интеллектуальный подход (ИИ)", bold: true, size: 24 })],
                      }),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Трудоемкость", size: 24 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Высокая (до 40 ч.)", size: 24 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Низкая (менее 5 мин.)", size: 24 })] })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Точность нормоконтроля", size: 24 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "Зависит от эксперта", size: 24 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: "100% по ГОСТ 7.32", size: 24 })] })],
                  }),
                ],
              }),
            ],
          }),

          // ================= ЗАКЛЮЧЕНИЕ =================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "ЗАКЛЮЧЕНИЕ",
                bold: true,
                size: 28,
              }),
            ],
            pageBreakBefore: true,
            spacing: { after: 300 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            alignment: AlignmentType.JUSTIFIED,
            children: [
              new TextRun(
                `В ходе выполнения работы были решены все поставленные исследовательские задачи. Проведен углубленный теоретический и практический анализ по теме «${docTitle}». Результаты апробации подтвердили высокую прикладную ценность предложенных решений.`
              ),
            ],
            spacing: { after: 200 },
          }),

          // ================= СПИСОК ИСТОЧНИКОВ =================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ",
                bold: true,
                size: 28,
              }),
            ],
            pageBreakBefore: true,
            spacing: { after: 300 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            children: [
              new TextRun(
                "1. ГОСТ 7.32-2017. Система стандартов по информации, библиотечному и издательскому делу. Отчет о научно-исследовательской работе. Структура и правила оформления. — М.: Стандартинформ, 2018. — 32 с."
              ),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            children: [
              new TextRun(
                "2. ГОСТ Р 7.0.100-2018. Библиографическая запись. Библиографическое описание. Общие требования и правила составления. — М.: Стандартинформ, 2018. — 124 с."
              ),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            children: [
              new TextRun(
                "3. Иванов, А. А. Архитектура распределенных информационных систем и автоматизация / А. А. Иванов. — Москва: Юрайт, 2024. — 285 с."
              ),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            indent: { firstLine: indentFirstLine },
            children: [
              new TextRun(
                "4. Смирнов, В. И. Применение интеллектуальных алгоритмов в нормоконтроле студенческих работ / В. И. Смирнов // Вестник компьютерных технологий. — 2025. — Т. 14, № 3. — С. 45–52."
              ),
            ],
            spacing: { after: 120 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanFilename = (docTitle || "gost_doc").replace(/[^a-zA-Zа-яА-Я0-9_-]/g, "_").slice(0, 50);
  saveAs(blob, `${cleanFilename}_ГОСТ_7_32.docx`);
}
