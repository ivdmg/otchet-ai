import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ruler,
  AlignLeft,
  MoveVertical,
  Hash,
  Table as TableIcon,
  Image as ImageIcon,
  Sigma,
  ListOrdered,
  FileText,
  Sparkles,
  CheckCircle2,
  Info,
  ShieldCheck,
  X,
  MousePointerClick,
  Code2
} from "lucide-react";

export type HotspotId =
  | "margins"
  | "pagenum"
  | "heading1"
  | "heading2"
  | "indent"
  | "spacing"
  | "formula"
  | "table"
  | "figure"
  | "lists"
  | "footnotes";

export interface HotspotData {
  id: HotspotId;
  label: string;
  badge: string;
  standard: string;
  tag: string;
  pills: string[];
  description: string;
  icon: React.ReactNode;
  cardPlacement: string;
  pulseColor: "indigo" | "cyan" | "emerald" | "amber" | "rose";
}

export const HOTSPOTS_DATA: Record<HotspotId, HotspotData> = {
  margins: {
    id: "margins",
    label: "Геометрия и поля листа",
    badge: "Поля страницы A4",
    standard: "ГОСТ 7.32-2017 (п. 6.1.2)",
    tag: "30 / 10 / 20 / 20 мм",
    pills: ["Левое: 30 мм", "Правое: 10 мм", "Верх/Низ: 20 мм"],
    description: "Левое поле 30 мм зарезервировано для переплета. Правое — 10 мм, верхнее и нижнее — по 20 мм.",
    icon: <Ruler className="w-4 h-4" />,
    cardPlacement: "top-4 left-10 sm:left-14",
    pulseColor: "rose",
  },
  pagenum: {
    id: "pagenum",
    label: "Колонтитулы и нумерация",
    badge: "Сквозная нумерация",
    standard: "ГОСТ 7.32-2017 (п. 6.1.3)",
    tag: "TNR 12 pt",
    pills: ["TNR 12 pt", "Сквозная арабская", "Первая стр. скрыта"],
    description: "Сквозная нумерация страниц арабскими цифрами. На титульном листе номер скрыт.",
    icon: <Hash className="w-4 h-4" />,
    cardPlacement: "top-2 right-10 sm:right-14",
    pulseColor: "cyan",
  },
  heading1: {
    id: "heading1",
    label: "Заголовок главы (1 уровень)",
    badge: "Заголовок 1 уровня",
    standard: "ГОСТ 7.32-2017 (п. 6.3)",
    tag: "ПРОПИСНЫЕ",
    pills: ["ПРОПИСНЫЕ 14 pt", "По центру", "Без точки в конце"],
    description: "Заголовки структурных элементов и глав пишутся прописными буквами полужирным начертанием по центру листа без точки.",
    icon: <AlignLeft className="w-4 h-4" />,
    cardPlacement: "top-14 left-1/2 -translate-x-1/2",
    pulseColor: "indigo",
  },
  heading2: {
    id: "heading2",
    label: "Заголовок параграфа (2 уровень)",
    badge: "Подраздел 2.1",
    standard: "ГОСТ 7.32-2017",
    tag: "С абзаца 1.25 см",
    pills: ["Строчные 14 pt", "Отступ 1.25 см", "Интервал до/после 12 pt"],
    description: "Заголовки подразделов начинаются с абзацного отступа 1.25 см, пишутся строчными буквами с первой прописной.",
    icon: <AlignLeft className="w-4 h-4" />,
    cardPlacement: "top-20 left-20 sm:left-28",
    pulseColor: "indigo",
  },
  indent: {
    id: "indent",
    label: "Абзацный отступ (Красная строка)",
    badge: "Красная строка 1.25 см",
    standard: "ГОСТ 7.32-2017",
    tag: "Отступ: 1.25 см",
    pills: ["Отступ 1.25 см", "709 dxa в OpenXML", "Фиксированный отступ"],
    description: "Абзацный отступ строго одинаков по всей работе и равен ровно 1.25 см без использования пробелов или Tab.",
    icon: <AlignLeft className="w-4 h-4" />,
    cardPlacement: "top-[110px] left-20 sm:left-28",
    pulseColor: "amber",
  },
  spacing: {
    id: "spacing",
    label: "Полуторный интервал и шрифт",
    badge: "Интервал 1.5 строки",
    standard: "ГОСТ 7.32-2017 (п. 6.2)",
    tag: "Times New Roman 14 pt",
    pills: ["Times New Roman 14 pt", "Интервал 1.5", "По ширине листа"],
    description: "Основной текст оформляется гарнитурой Times New Roman 14 pt с полуторным межстрочным интервалом и выравниванием по ширине.",
    icon: <MoveVertical className="w-4 h-4" />,
    cardPlacement: "top-[110px] right-10 sm:right-14",
    pulseColor: "indigo",
  },
  formula: {
    id: "formula",
    label: "Выключные формулы",
    badge: "Формула + Номер (2.1)",
    standard: "ГОСТ 7.32-2017 (п. 6.8)",
    tag: "Центр + Номер справа",
    pills: ["Формула по центру", "Номер (2.1) справа", "Сетка без сдвигов"],
    description: "Формула располагается в отдельной строке по центру, а ее порядковый номер выравнивается строго по правому краю.",
    icon: <Sigma className="w-4 h-4" />,
    cardPlacement: "top-[280px] right-10 sm:right-14",
    pulseColor: "emerald",
  },
  table: {
    id: "table",
    label: "Табличный нормоконтроль",
    badge: "Таблица по ГОСТ",
    standard: "ГОСТ 7.32-2017 (п. 6.7)",
    tag: "Подпись сверху",
    pills: ["Подпись слева сверху", "Сетка 0.5 pt", "Кегль 12 pt"],
    description: "Наименование таблицы помещается над таблицей слева: «Таблица 2.1 — Название». Шрифт внутри 12 pt с одинарным интервалом.",
    icon: <TableIcon className="w-4 h-4" />,
    cardPlacement: "top-[360px] left-10 sm:left-14",
    pulseColor: "emerald",
  },
  figure: {
    id: "figure",
    label: "Иллюстрации и схемы",
    badge: "Рисунок по центру",
    standard: "ГОСТ 7.32-2017 (п. 6.5)",
    tag: "Подпись снизу",
    pills: ["Рисунок по центру", "Подпись снизу", "Без точки в конце"],
    description: "Иллюстрации центрируются на листе. Подпись размещается снизу по центру: «Рисунок 2.1 — Название» без точки в конце.",
    icon: <ImageIcon className="w-4 h-4" />,
    cardPlacement: "top-[440px] right-10 sm:right-14",
    pulseColor: "cyan",
  },
  lists: {
    id: "lists",
    label: "Списки и перечисления",
    badge: "Маркеры дефис / цифры",
    standard: "ГОСТ 7.32-2017 (п. 6.4)",
    tag: "Отступ 1.25 см",
    pills: ["Маркер тире —", "Смещение 1.25 см", "Точка с запятой ;"],
    description: "Списки оформляются дефисом «— » или арабскими цифрами со скобкой. Каждый пункт заканчивается точкой с запятой.",
    icon: <ListOrdered className="w-4 h-4" />,
    cardPlacement: "top-[190px] left-10 sm:left-14",
    pulseColor: "amber",
  },
  footnotes: {
    id: "footnotes",
    label: "Сноски и разделительная черта",
    badge: "Сноска внизу страницы",
    standard: "ГОСТ 7.32-2017",
    tag: "Черта 1.5 см",
    pills: ["Черта 1.5 см", "TNR 10 pt", "Интервал 1.0"],
    description: "Сноски отделяются короткой горизонтальной линией 1.5 см внизу страницы. Текст сноски набирается кеглем 10 pt.",
    icon: <FileText className="w-4 h-4" />,
    cardPlacement: "bottom-24 left-20 sm:left-28",
    pulseColor: "indigo",
  },
};

export const GostBlueprintSection: React.FC = () => {
  const [activeHotspotId, setActiveHotspotId] = useState<HotspotId | null>(null);
  const activeHotspot = activeHotspotId ? HOTSPOTS_DATA[activeHotspotId] : null;

  const handleHotspotEnter = (id: HotspotId) => {
    setActiveHotspotId(id);
  };

  const handleHotspotLeave = () => {
    setActiveHotspotId(null);
  };

  return (
    <section id="gost-features" className="py-24 relative overflow-hidden bg-[#070709] border-t border-zinc-900">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-1/4 w-[550px] h-[550px] bg-cyan-600/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/5 blur-[200px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-100 tracking-tight">
            Интерактивный чертёж
          </h2>
        </div>

        {/* Big Centered High-Fidelity Word Sheet Container */}
        <div className="max-w-5xl mx-auto w-full overflow-hidden pb-4">
          <div 
            onMouseLeave={handleHotspotLeave}
            className="bg-[#0b0b0e] rounded-2xl sm:rounded-3xl p-2 sm:p-6 lg:p-8 relative shadow-2xl border border-zinc-800/80 w-full"
          >
            {/* Physical A4 Sheet Container */}
            <div className="relative p-0.5 sm:p-4 flex justify-center bg-zinc-950/40 rounded-xl sm:rounded-2xl overflow-visible">
              
              {/* Real Paper Canvas */}
              <div
                className="relative bg-[#FFFFFF] text-zinc-900 rounded-sm shadow-2xl transition-all duration-300 select-text border border-zinc-300 overflow-visible w-full max-w-[760px]"
                style={{
                  minHeight: "1060px",
                  fontFamily: "'PT Serif', 'Times New Roman', Times, serif",
                  paddingLeft: "clamp(38px, 9vw, 72px)",   // 30 mm Left Margin scaled
                  paddingRight: "clamp(18px, 4.5vw, 34px)", // 10-15 mm Right Margin scaled
                  paddingTop: "clamp(32px, 6vw, 52px)",    // 20 mm Top Margin scaled
                  paddingBottom: "clamp(36px, 7vw, 58px)", // 20 mm Bottom Margin scaled
                  boxSizing: "border-box",
                }}
              >
                
                {/* 1. Precision Margin Guides */}
                <div className="absolute inset-0 pointer-events-none z-10 transition-opacity">
                  {/* Left margin boundary indicator (30 mm) */}
                  <div className="absolute top-0 bottom-0 left-[clamp(38px,9vw,72px)] border-r border-dashed border-rose-500/40">
                    <span className="hidden sm:inline-block absolute top-2 -left-14 text-[8px] font-mono font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded shadow-sm border border-rose-300">
                      Левое: 30 мм
                    </span>
                  </div>

                  {/* Right margin boundary indicator (10 mm) */}
                  <div className="absolute top-0 bottom-0 right-[clamp(18px,4.5vw,34px)] border-l border-dashed border-rose-500/40">
                    <span className="hidden sm:inline-block absolute top-2 -right-14 text-[8px] font-mono font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded shadow-sm border border-rose-300">
                      Правое: 10 мм
                    </span>
                  </div>

                  {/* Top & Bottom margin boundaries */}
                  <div className="absolute top-[52px] left-0 right-0 border-b border-dashed border-rose-500/30">
                    <span className="absolute -top-3.5 right-12 text-[8px] font-mono font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded shadow-sm border border-rose-300">
                      Верхнее: 20 мм
                    </span>
                  </div>
                  <div className="absolute bottom-[58px] left-0 right-0 border-t border-dashed border-rose-500/30">
                    <span className="absolute -bottom-3.5 right-12 text-[8px] font-mono font-bold text-rose-700 bg-rose-50 px-1 py-0.5 rounded shadow-sm border border-rose-300">
                      Нижнее: 20 мм
                    </span>
                  </div>
                </div>

                {/* Hotspot 1: MARGINS GUIDE */}
                <HotspotTrigger
                  id="margins"
                  className="absolute top-3 left-2 sm:left-4 z-30"
                  activeId={activeHotspotId}
                  onEnter={handleHotspotEnter}
                  onLeave={handleHotspotLeave}
                />

                {/* Top-Right Page Numbering Area */}
                <div className="relative flex justify-end mb-4 z-20">
                  <div className="relative text-xs font-serif font-normal text-zinc-900">
                    14
                  </div>
                  {/* Hotspot 2: PAGENUM */}
                  <HotspotTrigger
                    id="pagenum"
                    className="absolute -top-1 right-0 sm:-right-6 z-30"
                    activeId={activeHotspotId}
                    onEnter={handleHotspotEnter}
                    onLeave={handleHotspotLeave}
                  />
                </div>

                {/* Chapter 2 Main Centered Heading (Level 1) */}
                <div className="relative text-center my-5 z-20">
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wide font-sans text-zinc-950">
                    ГЛАВА 2. АРХИТЕКТУРА И МАТЕМАТИЧЕСКАЯ МОДЕЛЬ КОМПИЛЯЦИИ AST
                  </h3>
                  {/* Hotspot 3: HEADING 1 */}
                  <HotspotTrigger
                    id="heading1"
                    className="absolute -top-2 right-2 z-30"
                    activeId={activeHotspotId}
                    onEnter={handleHotspotEnter}
                    onLeave={handleHotspotLeave}
                  />
                </div>

                {/* Section 2.1 Subtitle (Level 2) */}
                <div className="relative my-3 z-20">
                  <h4 
                    className="text-xs sm:text-[13px] font-bold font-sans text-zinc-900"
                    style={{ textIndent: "1.25rem" }}
                  >
                    2.1. Алгоритмическое обеспечение детерминированного нормоконтроля
                  </h4>
                  {/* Hotspot 4: HEADING 2 */}
                  <HotspotTrigger
                    id="heading2"
                    className="absolute -top-1.5 left-0 z-30"
                    activeId={activeHotspotId}
                    onEnter={handleHotspotEnter}
                    onLeave={handleHotspotLeave}
                  />
                </div>

                {/* Paragraph 1: Body Text with 1.25cm Indent & 1.5 Spacing */}
                <div className="relative my-2 z-20">
                  <p 
                    className="text-xs sm:text-[13px] text-justify leading-[1.5] text-zinc-800"
                    style={{ textIndent: "1.25rem" }}
                  >
                    Процесс преобразования структурированного JSON-графа в физический OpenXML-документ базируется на детерминированном применении стилей ГОСТ 7.32-2017<sup className="text-indigo-700 font-bold font-sans ml-0.5">[1, c. 42]</sup>. В отличие от стандартных текстовых процессоров, компилятор производит математический расчет координат узлов, исключая возникновение плавающих отступов и сбоев форматирования.
                  </p>

                  {/* Hotspot 5: INDENT (Красная строка) */}
                  <HotspotTrigger
                    id="indent"
                    className="absolute top-1 left-0 sm:-left-6 z-30"
                    activeId={activeHotspotId}
                    onEnter={handleHotspotEnter}
                    onLeave={handleHotspotLeave}
                  />

                  {/* Hotspot 6: SPACING (Полуторный интервал) */}
                  <HotspotTrigger
                    id="spacing"
                    className="absolute top-1/2 right-0 sm:-right-5 z-30"
                    activeId={activeHotspotId}
                    onEnter={handleHotspotEnter}
                    onLeave={handleHotspotLeave}
                  />
                </div>

                {/* Lists Section: Bulleted and Numbered */}
                <div className="relative my-3 text-xs sm:text-[13px] leading-[1.5] text-zinc-800 z-20">
                  <p style={{ textIndent: "1.25rem" }} className="mb-1">
                    Ключевые критерии оценки качества скомпилированного документа включают:
                  </p>
                  <ul className="list-none space-y-0.5" style={{ paddingLeft: "1.25rem" }}>
                    <li className="flex items-start space-x-1">
                      <span className="font-bold">—</span>
                      <span>строгое соответствие геометрических полей требованиям брошюровки;</span>
                    </li>
                    <li className="flex items-start space-x-1">
                      <span className="font-bold">—</span>
                      <span>автоматическое формирование перекрестных ссылок на таблицы и рисунки;</span>
                    </li>
                    <li className="flex items-start space-x-1">
                      <span className="font-bold">—</span>
                      <span>исключение висячих строк и пустых абзацев.</span>
                    </li>
                  </ul>

                  {/* Hotspot 7: LISTS */}
                  <HotspotTrigger
                    id="lists"
                    className="absolute top-6 left-0 sm:-left-6 z-30"
                    activeId={activeHotspotId}
                    onEnter={handleHotspotEnter}
                    onLeave={handleHotspotLeave}
                  />
                </div>

                {/* Mathematical Formula with Right-aligned Equation Number */}
                <div className="relative my-3.5 z-20">
                  <div className="py-2 px-3 bg-zinc-50/80 border border-zinc-200/80 rounded flex items-center justify-between text-xs sm:text-[13px]">
                    <div className="flex-1 text-center font-serif italic text-zinc-950 font-semibold tracking-wide">
                      K<sub>gost</sub> = &sum;<sub>i=1</sub><sup>n</sup> &nbsp; ( &alpha;<sub>i</sub> &middot; P<sub>i</sub> ) &nbsp;/&nbsp; &radic;( 1 + &beta;<sub>i</sub><sup>2</sup> )
                    </div>
                    <div className="font-sans font-bold text-zinc-800 text-xs pl-2">
                      (2.1)
                    </div>
                  </div>

                  {/* Hotspot 8: FORMULA */}
                  <HotspotTrigger
                    id="formula"
                    className="absolute top-1/2 -translate-y-1/2 right-0 sm:-right-5 z-30"
                    activeId={activeHotspotId}
                    onEnter={handleHotspotEnter}
                    onLeave={handleHotspotLeave}
                  />
                </div>

                {/* Table with Top Caption */}
                <div className="relative my-4 z-20">
                  <div 
                    className="text-[11px] text-zinc-700 font-sans text-left mb-1"
                    style={{ textIndent: "1.25rem" }}
                  >
                    Таблица 2.1 — Сравнительные характеристики параметров верстки
                  </div>

                  <table className="w-full border-collapse border border-zinc-950 text-[11px] font-sans text-center">
                    <thead>
                      <tr className="bg-zinc-100">
                        <th className="border border-zinc-950 p-1.5 font-bold text-left">Параметр документа</th>
                        <th className="border border-zinc-950 p-1.5 font-bold">ГОСТ 7.32-2017</th>
                        <th className="border border-zinc-950 p-1.5 font-bold text-emerald-800">DOCX Компилятор</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-zinc-950 p-1 text-left">Гарнитура основного шрифта</td>
                        <td className="border border-zinc-950 p-1">Times New Roman 14 pt</td>
                        <td className="border border-zinc-950 p-1 font-semibold text-emerald-800">14 pt (Строго)</td>
                      </tr>
                      <tr>
                        <td className="border border-zinc-950 p-1 text-left">Межстрочный интервал</td>
                        <td className="border border-zinc-950 p-1">Полуторный (1.5)</td>
                        <td className="border border-zinc-950 p-1 font-semibold text-emerald-800">360 dxa (100% OK)</td>
                      </tr>
                      <tr>
                        <td className="border border-zinc-950 p-1 text-left">Левое поле (под переплет)</td>
                        <td className="border border-zinc-950 p-1">30 мм</td>
                        <td className="border border-zinc-950 p-1 font-semibold text-emerald-800">30 мм (OK)</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Hotspot 9: TABLE */}
                  <HotspotTrigger
                    id="table"
                    className="absolute top-2 left-0 sm:-left-6 z-30"
                    activeId={activeHotspotId}
                    onEnter={handleHotspotEnter}
                    onLeave={handleHotspotLeave}
                  />
                </div>

                {/* Figure / Vector Analytical Chart with Bottom Caption */}
                <div className="relative my-4 text-center z-20">
                  <div className="p-3.5 bg-zinc-50 border border-zinc-200/90 rounded flex flex-col items-center justify-center">
                    {/* High-quality Academic SVG Vector Graph */}
                    <svg 
                      viewBox="0 0 420 120" 
                      className="w-full max-w-[380px] h-24 text-zinc-700 select-none overflow-visible"
                    >
                      {/* Grid background lines */}
                      <line x1="40" y1="20" x2="390" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                      <line x1="40" y1="55" x2="390" y2="55" stroke="#E2E8F0" strokeDasharray="3 3" strokeWidth="1" />
                      <line x1="40" y1="90" x2="390" y2="90" stroke="#CBD5E1" strokeWidth="1.2" />

                      {/* Axes */}
                      <line x1="40" y1="10" x2="40" y2="90" stroke="#475569" strokeWidth="1.5" />
                      <line x1="40" y1="90" x2="400" y2="90" stroke="#475569" strokeWidth="1.5" />

                      {/* Axis Labels */}
                      <text x="35" y="15" textAnchor="end" fontSize="8" fontFamily="sans-serif" fill="#64748B">Y, %</text>
                      <text x="400" y="102" textAnchor="end" fontSize="8" fontFamily="sans-serif" fill="#64748B">N (узлов)</text>
                      <text x="35" y="58" textAnchor="end" fontSize="7" fontFamily="sans-serif" fill="#94A3B8">50</text>
                      <text x="35" y="23" textAnchor="end" fontSize="7" fontFamily="sans-serif" fill="#94A3B8">100</text>

                      {/* Primary Theoretical Curve */}
                      <path
                        d="M 40 85 Q 120 75, 200 45 T 380 22"
                        fill="none"
                        stroke="#4F46E5"
                        strokeWidth="2"
                      />

                      {/* Secondary Experimental Curve */}
                      <path
                        d="M 40 88 Q 110 82, 190 52 T 380 26"
                        fill="none"
                        stroke="#06B6D4"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />

                      {/* Data Point Markers */}
                      <circle cx="120" cy="72" r="2.5" fill="#4F46E5" />
                      <circle cx="200" cy="45" r="2.5" fill="#4F46E5" />
                      <circle cx="290" cy="30" r="2.5" fill="#4F46E5" />
                      <circle cx="380" cy="22" r="2.5" fill="#4F46E5" />

                      {/* Legend */}
                      <line x1="240" y1="108" x2="260" y2="108" stroke="#4F46E5" strokeWidth="2" />
                      <text x="265" y="111" fontSize="7.5" fontFamily="sans-serif" fill="#334155">Теоретический расчет</text>
                      
                      <line x1="330" y1="108" x2="350" y2="108" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="3 2" />
                      <text x="355" y="111" fontSize="7.5" fontFamily="sans-serif" fill="#334155">Эксперимент</text>
                    </svg>
                  </div>

                  <div className="text-[11px] text-zinc-700 font-sans text-center mt-1.5">
                    Рисунок 2.1 — График сходимости алгоритма детерминированной оптимизации стилей
                  </div>

                  {/* Hotspot 10: FIGURE */}
                  <HotspotTrigger
                    id="figure"
                    className="absolute bottom-2 right-0 sm:-right-5 z-30"
                    activeId={activeHotspotId}
                    onEnter={handleHotspotEnter}
                    onLeave={handleHotspotLeave}
                  />
                </div>

                {/* Bottom Footnotes Area with 1.5cm Separator Line */}
                <div className="relative mt-6 pt-2 text-[10px] text-zinc-700 font-serif z-20">
                  {/* Footnote Separator Line: 1.5 cm width (~57px) */}
                  <div className="w-16 border-t border-zinc-800 mb-1.5" />
                  
                  <p className="leading-tight">
                    <sup>1</sup> ГОСТ 7.32-2017. Отчет о научно-исследовательской работе. Структура и правила оформления. — Введ. 2018-07-01. — М.: Стандартинформ, 2017. — 34 с.
                  </p>

                  {/* Hotspot 11: FOOTNOTES */}
                  <HotspotTrigger
                    id="footnotes"
                    className="absolute top-1 left-0 sm:-left-6 z-30"
                    activeId={activeHotspotId}
                    onEnter={handleHotspotEnter}
                    onLeave={handleHotspotLeave}
                  />
                </div>

                {/* FLOATING GLASSMORPHIC MODAL POPOVER RELATIVE TO ACTIVE HOTSPOT */}
                <AnimatePresence>
                  {activeHotspot && (
                    <GlassmorphicGostCard
                      data={activeHotspot}
                    />
                  )}
                </AnimatePresence>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

// ----------------------------------------------------------------------
// SUBCOMPONENT: SMOOTH CALM PULSATING HOTSPOT TRIGGER
// ----------------------------------------------------------------------
interface HotspotTriggerProps {
  id: HotspotId;
  className?: string;
  activeId: HotspotId | null;
  onEnter: (id: HotspotId) => void;
  onLeave: () => void;
}

const HotspotTrigger: React.FC<HotspotTriggerProps> = ({
  id,
  className = "",
  activeId,
  onEnter,
  onLeave
}) => {
  const isActive = activeId === id;
  const config = HOTSPOTS_DATA[id];

  const colorPalettes = {
    indigo: {
      core: "bg-indigo-500",
      glow: "shadow-[0_0_12px_rgba(99,102,241,0.7)]",
      wave: "border-indigo-400/50 bg-indigo-500/20",
      activeRing: "ring-4 ring-indigo-500/40",
    },
    cyan: {
      core: "bg-cyan-500",
      glow: "shadow-[0_0_12px_rgba(6,182,212,0.7)]",
      wave: "border-cyan-400/50 bg-cyan-500/20",
      activeRing: "ring-4 ring-cyan-500/40",
    },
    emerald: {
      core: "bg-emerald-500",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.7)]",
      wave: "border-emerald-400/50 bg-emerald-500/20",
      activeRing: "ring-4 ring-emerald-500/40",
    },
    amber: {
      core: "bg-amber-500",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.7)]",
      wave: "border-amber-400/50 bg-amber-500/20",
      activeRing: "ring-4 ring-amber-500/40",
    },
    rose: {
      core: "bg-rose-500",
      glow: "shadow-[0_0_12px_rgba(244,63,94,0.7)]",
      wave: "border-rose-400/50 bg-rose-500/20",
      activeRing: "ring-4 ring-rose-500/40",
    },
  }[config.pulseColor];

  return (
    <div 
      onMouseEnter={() => onEnter(id)}
      onMouseLeave={onLeave}
      className={`cursor-pointer select-none ${className}`}
    >
      <div
        role="button"
        aria-label={config.label}
        className="relative flex items-center justify-center w-7 h-7 cursor-pointer focus:outline-none"
      >
        {/* Soft, calm, continuous breathing wave (slow & gentle 2.6s) */}
        <motion.span
          animate={{
            scale: [1, 1.85, 1],
            opacity: [0.55, 0, 0.55],
          }}
          transition={{
            duration: 2.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`absolute inline-flex h-4 w-4 rounded-full border pointer-events-none ${colorPalettes.wave}`}
        />

        {/* Outer Glow Halo & Inner Solid Core */}
        <span
          className={`relative inline-flex rounded-full h-3.5 w-3.5 items-center justify-center border-2 border-white transition-all duration-300 ${
            colorPalettes.core
          } ${colorPalettes.glow} ${
            isActive ? `scale-125 ${colorPalettes.activeRing}` : ""
          }`}
        >
          {/* Inner White Dot Core */}
          <span className="w-1 h-1 bg-white rounded-full" />
        </span>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// SUBCOMPONENT: GLASSMORPHIC MODAL POPOVER
// ----------------------------------------------------------------------
interface GlassmorphicGostCardProps {
  data: HotspotData;
}

const GlassmorphicGostCard: React.FC<GlassmorphicGostCardProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className={`absolute z-40 w-[88%] sm:w-[300px] pointer-events-none ${data.cardPlacement}`}
    >
      <div className="relative rounded-xl p-4 text-zinc-100 bg-[#0e1017] border border-zinc-800 shadow-2xl space-y-2">
        <h4 className="text-sm font-bold text-white font-sans tracking-tight">
          {data.label}
        </h4>

        <p className="text-xs text-zinc-300 leading-relaxed font-sans font-normal">
          {data.description}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
          {data.pills.map((pill, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GostBlueprintSection;
