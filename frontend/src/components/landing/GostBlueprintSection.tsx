import React, { useState } from "react";
import { 
  Sparkles, 
  Check, 
  Ruler, 
  AlignLeft, 
  MoveVertical, 
  Hash, 
  Table as TableIcon,
  Maximize2,
  Info,
  ChevronRight
} from "lucide-react";

type HotspotId = "margins" | "indent" | "spacing" | "pagenum" | "table";

interface HotspotConfig {
  id: HotspotId;
  label: string;
  badge: string;
  tag: string;
  standard: string;
  description: string;
  icon: React.ReactNode;
}

const HOTSPOTS: HotspotConfig[] = [
  {
    id: "margins",
    label: "Левое и правое поля",
    badge: "Поля страницы",
    tag: "margin-left: 30mm",
    standard: "Левое 30 мм, Правое 15 мм, Верх/Низ 20 мм",
    description: "Строгий расчет отступов для брошюровки и прошивки в твердый переплет без среза текста.",
    icon: <Ruler className="w-4 h-4" />
  },
  {
    id: "indent",
    label: "Абзацный отступ",
    badge: "Красная строка",
    tag: "text-indent: 1.25cm",
    standard: "Ровно 1.25 см (w:firstLine='709')",
    description: "Автоматический перенос первой строки каждого абзаца без использования лишних пробелов или табуляций.",
    icon: <AlignLeft className="w-4 h-4" />
  },
  {
    id: "spacing",
    label: "Полуторный интервал",
    badge: "Межстрочный ритм",
    tag: "line-height: 1.5",
    standard: "Интервал 1.5 (w:line='360')",
    description: "Выверенный вертикальный ритм и гарнитура Times New Roman 14 pt по всей глубине документа.",
    icon: <MoveVertical className="w-4 h-4" />
  },
  {
    id: "pagenum",
    label: "Колонтитулы и нумерация",
    badge: "Сквозная нумерация",
    tag: "page: top-right (w:fldSimple)",
    standard: "Арабские цифры по центру / правому краю",
    description: "Сквозная нумерация без номера на титульном листе с сохранением общего подсчета страниц.",
    icon: <Hash className="w-4 h-4" />
  },
  {
    id: "table",
    label: "Таблицы и сноски",
    badge: "ГОСТ 7.0.5-2008",
    tag: "table-caption & footnotes",
    standard: "Таблица X.X с левым выравниванием",
    description: "Нативная табличная разметка без скриншотов и библиографические квадратные ссылки [1, c. 14].",
    icon: <TableIcon className="w-4 h-4" />
  }
];

export const GostBlueprintSection: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<HotspotId>("margins");

  return (
    <section id="gost-features" className="py-24 relative overflow-hidden border-t border-zinc-900">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-zinc-800/10 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-white/[0.02] blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span>[ АНАТОМИЯ ИДЕАЛЬНОЙ СТРАНИЦЫ ]</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Интерактивный чертеж ГОСТ 7.32-2017
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Наведите курсор на маркеры или параметры, чтобы увидеть точную геометрию академической верстки.
          </p>
        </div>

        {/* 2-Column Interactive Blueprint Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Feature Selector List - 5 cols */}
          <div className="lg:col-span-5 space-y-3">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider px-1 pb-1">
              Ключевые контрольные точки:
            </div>

            {HOTSPOTS.map((item) => {
              const isSelected = activeHotspot === item.id;
              return (
                <button
                  key={item.id}
                  onMouseEnter={() => setActiveHotspot(item.id)}
                  onClick={() => setActiveHotspot(item.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3.5 cursor-pointer ${
                    isSelected
                      ? "bg-zinc-900/90 border-zinc-600 shadow-md shadow-black/40 ring-1 ring-zinc-500/30"
                      : "dark-surface hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? "bg-zinc-100 text-zinc-950"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                  }`}>
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold font-mono tracking-tight ${
                        isSelected ? "text-zinc-100" : "text-zinc-300"
                      }`}>
                        {item.label}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 shrink-0">
                        {item.tag}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-400">
                      {item.standard}
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed pt-0.5">
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Quick Summary Pill */}
            <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex items-center space-x-2.5 text-xs text-zinc-400">
              <Info className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>
                Генератор компилирует OpenXML без использования Word-макросов.
              </span>
            </div>
          </div>

          {/* Right Column: Scaled-down High-Fidelity A4 Page Mock-up - 7 cols */}
          <div className="lg:col-span-7">
            <div className="dark-surface rounded-2xl p-4 sm:p-7 relative shadow-2xl overflow-hidden border border-zinc-800">
              
              {/* Document Meta Header Bar */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-4 mb-4 border-b border-zinc-800/80">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>A4 Paper Blueprint (210 &times; 297 мм)</span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  Активный фокус: <span className="text-zinc-200 uppercase">{activeHotspot}</span>
                </div>
              </div>

              {/* A4 Paper Sheet Simulation */}
              <div className="relative bg-[#fafafa] text-zinc-900 rounded-lg p-6 sm:p-10 min-h-[560px] font-serif shadow-xl border border-zinc-300 select-none transition-all duration-300">
                
                {/* 1. Precision Margin Guides (Hover / Active Highlight) */}
                <div 
                  className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
                    activeHotspot === "margins" ? "opacity-100" : "opacity-20 hover:opacity-70"
                  }`}
                >
                  {/* Left margin boundary indicator (30mm) */}
                  <div className="absolute top-0 bottom-0 left-[68px] border-r-2 border-dashed border-rose-500/80 z-20">
                    <span className="absolute top-4 -left-12 -rotate-90 text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-1 rounded shadow-sm border border-rose-200">
                      30 mm
                    </span>
                  </div>

                  {/* Right margin boundary indicator (15mm) */}
                  <div className="absolute top-0 bottom-0 right-[38px] border-l-2 border-dashed border-rose-500/80 z-20">
                    <span className="absolute top-4 -right-12 rotate-90 text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-1 rounded shadow-sm border border-rose-200">
                      15 mm
                    </span>
                  </div>

                  {/* Top & Bottom margin boundaries */}
                  <div className="absolute top-[48px] left-0 right-0 border-b-2 border-dashed border-rose-500/60 z-20">
                    <span className="absolute -top-3.5 right-10 text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-1 rounded shadow-sm border border-rose-200">
                      Top 20 mm
                    </span>
                  </div>
                </div>

                {/* 2. Top-Right Page Numbering Indicator */}
                <div className="relative flex justify-end mb-4">
                  <div 
                    onMouseEnter={() => setActiveHotspot("pagenum")}
                    className={`px-2 py-0.5 rounded text-xs font-serif transition-all cursor-pointer ${
                      activeHotspot === "pagenum"
                        ? "ring-2 ring-indigo-600 bg-indigo-50 font-bold text-indigo-900 scale-105"
                        : "text-zinc-700"
                    }`}
                  >
                    14
                  </div>
                  {activeHotspot === "pagenum" && (
                    <span className="absolute -top-6 right-0 text-[9px] font-mono bg-zinc-900 text-zinc-100 px-1.5 py-0.5 rounded shadow z-30">
                      ГОСТ: Верхний правый колонтитул
                    </span>
                  )}
                </div>

                {/* Document Centered Chapter Title */}
                <div className="text-center space-y-1 mb-5">
                  <h4 className="text-xs sm:text-sm font-bold uppercase tracking-tight font-sans text-zinc-900">
                    2. АВТОМАТИЗАЦИЯ ВЕРСТКИ ДОКУМЕНТОВ ПО СТАНДАРТУ ГОСТ
                  </h4>
                  <div className="text-[11px] font-semibold font-sans text-zinc-700">
                    2.1. Расчет геометрических параметров страницы и абзацев
                  </div>
                </div>

                {/* Document Paragraphs with Red-Line First-Line Indent */}
                <div className="space-y-3 text-xs sm:text-[13px] leading-relaxed text-justify text-zinc-800">
                  
                  {/* Paragraph 1 */}
                  <div 
                    onMouseEnter={() => setActiveHotspot("indent")}
                    className={`relative transition-all rounded p-1 cursor-pointer ${
                      activeHotspot === "indent" ? "bg-amber-500/10 ring-1 ring-amber-500/40" : ""
                    }`}
                  >
                    {activeHotspot === "indent" && (
                      <div className="absolute top-1.5 left-0 w-8 border-b-2 border-rose-500 flex items-center justify-center">
                        <span className="text-[8px] font-mono text-rose-600 -translate-y-2 bg-white px-0.5">1.25 cm</span>
                      </div>
                    )}
                    <p style={{ textIndent: "1.25rem" }}>
                      Форматирование научно-исследовательских отчетов и выпускных квалификационных работ требует строгого соблюдения типографских стандартов ГОСТ 7.32-2017<sup className="text-indigo-600 font-bold font-sans ml-0.5">[1]</sup>. Основная сложность ручной верстки в MS Word заключается в нестабильности стилей.
                    </p>
                  </div>

                  {/* Paragraph 2 with Spacing Rhythm Focus */}
                  <div 
                    onMouseEnter={() => setActiveHotspot("spacing")}
                    className={`relative transition-all rounded p-1 cursor-pointer ${
                      activeHotspot === "spacing" ? "bg-blue-500/10 ring-1 ring-blue-500/40" : ""
                    }`}
                  >
                    {activeHotspot === "spacing" && (
                      <div className="absolute right-0 top-0 bottom-0 w-4 border-r-2 border-blue-500 flex items-center justify-end">
                        <span className="text-[8px] font-mono text-blue-700 rotate-90 bg-white px-0.5">1.5 line</span>
                      </div>
                    )}
                    <p style={{ textIndent: "1.25rem" }}>
                      В разработанном движке генерация осуществляется на уровне абстрактного синтаксического дерева (AST), что исключает возможность случайного смещения полей или искажения междустрочного интервала 1.5.
                    </p>
                  </div>

                  {/* Table Mockup */}
                  <div 
                    onMouseEnter={() => setActiveHotspot("table")}
                    className={`my-3 pt-1 transition-all rounded p-1.5 cursor-pointer ${
                      activeHotspot === "table" ? "bg-emerald-500/10 ring-1 ring-emerald-500/40" : ""
                    }`}
                  >
                    <div className="text-[10px] text-zinc-600 font-sans text-left mb-1">
                      Таблица 2.1 — Параметры нормоконтроля в соответствии с ГОСТ 7.32-2017
                    </div>
                    
                    <table className="w-full border-collapse border border-zinc-800 text-[11px] font-sans text-center">
                      <thead>
                        <tr className="bg-zinc-100">
                          <th className="border border-zinc-800 p-1 font-semibold text-left">Параметр макета</th>
                          <th className="border border-zinc-800 p-1 font-semibold">Норматив ГОСТ</th>
                          <th className="border border-zinc-800 p-1 font-semibold">Компилятор .DOCX</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-zinc-800 p-1 text-left">Гарнитура шрифта</td>
                          <td className="border border-zinc-800 p-1">Times New Roman, 14 pt</td>
                          <td className="border border-zinc-800 p-1 font-semibold text-emerald-800">14 pt (Строго)</td>
                        </tr>
                        <tr>
                          <td className="border border-zinc-800 p-1 text-left">Левое поле (переплет)</td>
                          <td className="border border-zinc-800 p-1">30 мм</td>
                          <td className="border border-zinc-800 p-1 font-semibold text-emerald-800">30 мм (OK)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Footnotes Area */}
                  <div className="pt-3 border-t border-zinc-300 text-[9px] text-zinc-600 font-sans space-y-0.5">
                    <div><sup>1</sup> ГОСТ 7.32-2017. Отчет о научно-исследовательской работе. Структура и правила оформления. — М.: Стандартинформ, 2017.</div>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default GostBlueprintSection;
