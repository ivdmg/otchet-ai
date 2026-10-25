import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  XCircle, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  Sliders, 
  Bot, 
  Check, 
  AlertTriangle, 
  ArrowRight,
  Zap,
  ShieldCheck,
  RefreshCw,
  Award
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

export const ComparisonSection: React.FC = () => {
  // Slider ratio from 0 to 100
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX, rect);
    }
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-rose-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-rose-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Сравнение технологий генерации</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-outfit">
            Почему обычный <span className="text-rose-400 underline decoration-rose-500/40 decoration-wavy">ChatGPT</span> не справится с ГОСТом?
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Универсальные нейросети не ведают о жестких требованиях ВУЗов. Они ломают отступы, выдумывают сноски и выдают текст в виде полотна без ГОСТ-структуры.
          </p>
        </div>

        {/* BEFORE / AFTER INTERACTIVE SLIDER WIDGET */}
        <div className="mb-20">
          <div className="text-center mb-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Потяните слайдер влево / вправо для сравнения результатов
            </span>
          </div>

          <div 
            className="relative w-full max-w-4xl mx-auto h-[480px] sm:h-[520px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl select-none cursor-ew-resize bg-slate-950"
            onMouseDown={(e) => { setIsDragging(true); handleMouseMove(e); }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={handleTouchMove}
          >

            {/* RIGHT SIDE: AI GostDoc (100% ГОСТ) - Always full underneath */}
            <div className="absolute inset-0 bg-slate-900 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>AI GostDoc — 100% ГОСТ 7.32-2017</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-800">
                    Чистовой DOCX
                  </span>
                </div>

                {/* Simulated GOST document page preview */}
                <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-lg shadow-xl font-serif text-xs sm:text-sm space-y-3 border border-emerald-300">
                  <div className="text-center font-bold font-sans text-xs uppercase tracking-tight text-slate-900">
                    ГЛАВА 2. ЭМПИРИЧЕСКОЕ ИССЛЕДОВАНИЕ МОДЕЛЕЙ
                  </div>
                  <div className="text-center font-semibold text-xs text-slate-700 font-sans">
                    2.1. Методология построения графа зависимостей
                  </div>
                  <p className="indent-8 text-justify leading-relaxed">
                    Для точного контроля структуры документа используется абстрактное синтаксическое дерево (AST)<sup className="text-indigo-600 font-bold font-sans">[1]</sup>. Элементы форматируются с отступом 1.25 см и межстрочным интервалом 1.5.
                  </p>
                  
                  {/* GOST Table */}
                  <div className="my-2 text-[11px] font-sans">
                    <div className="text-right text-slate-600 mb-1">Таблица 2.1 — Сравнительные показатели</div>
                    <table className="w-full border-collapse border border-slate-900 text-center">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-900 p-1 font-semibold">Параметр</th>
                          <th className="border border-slate-900 p-1 font-semibold">Стандарт</th>
                          <th className="border border-slate-900 p-1 font-semibold">AI GostDoc</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-900 p-1 text-left">Левое поле</td>
                          <td className="border border-slate-900 p-1">30 мм</td>
                          <td className="border border-slate-900 p-1 font-bold text-emerald-700">30 мм (OK)</td>
                        </tr>
                        <tr>
                          <td className="border border-slate-900 p-1 text-left">Сноски</td>
                          <td className="border border-slate-900 p-1">ГОСТ 2018</td>
                          <td className="border border-slate-900 p-1 font-bold text-emerald-700">Авто-список</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="pt-3 border-t border-slate-300 text-[10px] text-slate-600 font-sans">
                    <sup>1</sup> ГОСТ Р 7.0.100-2018. Библиографическая запись. Общие требования. — М.: Стандартинформ, 2018.
                  </div>
                </div>
              </div>

              {/* Bottom Feature Badges */}
              <div className="flex flex-wrap gap-2 pt-4">
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center space-x-1 font-sans font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Поля 30-10-20-20 мм</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center space-x-1 font-sans font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Реальные источники 2023-2026</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center space-x-1 font-sans font-medium">
                  <Check className="w-3.5 h-3.5" />
                  <span>Готовый файл .DOCX</span>
                </span>
              </div>
            </div>

            {/* LEFT SIDE: Сырой ChatGPT (Word съехал) - Clipped via sliderPos */}
            <div 
              className="absolute inset-y-0 left-0 bg-slate-950 p-6 sm:p-10 flex flex-col justify-between overflow-hidden border-r-2 border-rose-500/80 shadow-2xl"
              style={{ width: `${sliderPos}%` }}
            >
              <div className="min-w-[600px] sm:min-w-[750px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 bg-rose-950/90 border border-rose-500/50 px-3 py-1 rounded-full text-xs font-bold text-rose-400">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Сырой ChatGPT в Word</span>
                  </div>
                  <span className="text-xs font-mono text-rose-400 bg-rose-950/60 px-2 py-1 rounded border border-rose-800">
                    Ошибки нормоконтроля
                  </span>
                </div>

                {/* Broken Document Emulation */}
                <div className="bg-white text-slate-900 p-6 sm:p-8 rounded-lg shadow-xl font-sans text-xs sm:text-sm space-y-3 border border-rose-400/80 relative">
                  <div className="absolute top-2 right-2 bg-rose-100 border border-rose-300 text-rose-700 px-2 py-0.5 rounded text-[10px] font-bold flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>Поля съехали!</span>
                  </div>

                  <div className="font-bold text-sm text-slate-800 underline decoration-rose-500">
                    Глава 2. Эмпирическое исследование моделей
                  </div>
                  <p className="text-slate-700 leading-normal bg-rose-50/50 p-1 border-l-2 border-rose-400">
                    Для точного контроля структуры документа используется обычный текст без абзацного отступа. [Ссылка 1?] Источники выдуманы нейросетью. Таблицы не пронумерованы по ГОСТ.
                  </p>

                  <div className="p-3 bg-rose-100/80 border border-rose-300 rounded text-rose-900 text-xs font-mono space-y-1">
                    <div className="font-bold flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Отклонено Антиплагиат.ВУЗ (Сгенерированный шаблон)</span>
                    </div>
                    <div className="text-[11px] text-rose-700">Неверные шрифты (Calibri вместо Times New Roman), нет списка литературы 2018.</div>
                  </div>
                </div>
              </div>

              {/* Bottom Warning Badges */}
              <div className="flex flex-wrap gap-2 pt-4 min-w-[600px]">
                <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs flex items-center space-x-1 font-sans font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Поля 20-20-20-20 (Брак)</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs flex items-center space-x-1 font-sans font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Несуществующие сноски</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs flex items-center space-x-1 font-sans font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>3+ часа ручной правки</span>
                </span>
              </div>
            </div>

            {/* SLIDER HANDLE DISK */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 via-white to-violet-500 cursor-ew-resize z-20 pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center border-2 border-indigo-600">
                <Sliders className="w-5 h-5 text-indigo-600" />
              </div>
            </div>

          </div>
        </div>

        {/* COMPARISON FEATURE MATRIX TABLE */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
              Детальная матрица возможностей
            </h3>
            <p className="text-sm text-slate-400">
              Сравнение AI GostDoc с универсальными ИИ-чатами и ручным набором
            </p>
          </div>

          <GlassCard variant="indigo" glow className="overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-300">
                    <th className="p-4 font-bold">Критерий оценки</th>
                    <th className="p-4 font-bold text-rose-400 text-center w-1/4">ChatGPT / Claude</th>
                    <th className="p-4 font-bold text-amber-400 text-center w-1/4">Обычные ИИ-сайты</th>
                    <th className="p-4 font-bold text-indigo-400 text-center w-1/4 bg-indigo-950/40 border-l border-r border-indigo-500/30">
                      <div className="flex items-center justify-center space-x-1">
                        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        <span>AI GostDoc</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-medium text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Форматирование по ГОСТ 7.32-2017</span>
                    </td>
                    <td className="p-4 text-center text-rose-400 font-medium">
                      <div className="flex items-center justify-center space-x-1">
                        <XCircle className="w-4 h-4" />
                        <span>Отсутствует</span>
                      </div>
                    </td>
                    <td className="p-4 text-center text-amber-400 font-medium">Частично</td>
                    <td className="p-4 text-center text-emerald-400 font-bold bg-indigo-950/20 border-l border-r border-indigo-500/20">
                      <div className="flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>100% Автоматически</span>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-medium text-white flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Источники и сноски по ГОСТ 2018</span>
                    </td>
                    <td className="p-4 text-center text-rose-400 font-medium">Галлюцинирует URL</td>
                    <td className="p-4 text-center text-amber-400 font-medium">Случайные книги</td>
                    <td className="p-4 text-center text-emerald-400 font-bold bg-indigo-950/20 border-l border-r border-indigo-500/20">
                      <div className="flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Реальные ВАК / ГОСТ</span>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-medium text-white flex items-center space-x-2">
                      <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Точечная регенерация (Spot Regeneration)</span>
                    </td>
                    <td className="p-4 text-center text-rose-400 font-medium">Переписывает всё</td>
                    <td className="p-4 text-center text-rose-400 font-medium">Нет</td>
                    <td className="p-4 text-center text-emerald-400 font-bold bg-indigo-950/20 border-l border-r border-indigo-500/20">
                      <div className="flex items-center justify-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Да (Параграф/Глава)</span>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-medium text-white flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Оригинальность Антиплагиат.ВУЗ</span>
                    </td>
                    <td className="p-4 text-center text-amber-400 font-medium">40% – 60%</td>
                    <td className="p-4 text-center text-amber-400 font-medium">50% – 70%</td>
                    <td className="p-4 text-center text-emerald-400 font-bold bg-indigo-950/20 border-l border-r border-indigo-500/20">
                      <div className="flex items-center justify-center space-x-1">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>85% – 98% Проходной</span>
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-medium text-white flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Формат экспорта</span>
                    </td>
                    <td className="p-4 text-center text-rose-400 font-medium">Вставка вручную</td>
                    <td className="p-4 text-center text-slate-300 font-medium">TXT / PDF</td>
                    <td className="p-4 text-center text-indigo-300 font-bold bg-indigo-950/20 border-l border-r border-indigo-500/20">
                      <span>Чистовой .DOCX</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

      </div>
    </section>
  );
};

export default ComparisonSection;
