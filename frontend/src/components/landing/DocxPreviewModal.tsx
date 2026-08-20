import React, { useState } from "react";
import { X, Download, FileText, Check, ArrowRight, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";

interface DocxPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartClick: () => void;
}

export const DocxPreviewModal: React.FC<DocxPreviewModalProps> = ({
  isOpen,
  onClose,
  onStartClick
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 3;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="dark-surface w-full max-w-4xl max-h-[90vh] rounded-2xl border border-zinc-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-100 font-mono">
                Пример_Курсовой_Работы_ГОСТ_7.32.docx
              </div>
              <div className="text-[11px] text-zinc-500 font-mono">
                Формат: OpenXML • Шрифт: Times New Roman 14 pt • Поля: 30/15/20/20 мм
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: A4 Paper Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0b0b0e] flex justify-center items-start">
          <div className="bg-white text-zinc-900 w-full max-w-2xl min-h-[640px] rounded shadow-2xl p-8 sm:p-14 font-serif text-xs sm:text-sm border border-zinc-200 select-none">
            
            {/* Top Page Number */}
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono border-b border-zinc-200 pb-2 mb-6">
              <span>ГОСТ 7.32-2017 / 7.0.5-2008</span>
              <span className="font-serif text-zinc-900 font-bold">Стр. {currentPage}</span>
            </div>

            {/* Page 1: Title Page */}
            {currentPage === 1 && (
              <div className="text-center space-y-6 pt-4 text-zinc-900">
                <div className="text-[10px] sm:text-xs uppercase font-sans font-bold tracking-wider text-zinc-700">
                  МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ РФ<br />
                  МОСКОВСКИЙ ГОСУДАРСТВЕННЫЙ ТЕХНИЧЕСКИЙ УНИВЕРСИТЕТ
                </div>

                <div className="py-12 space-y-3">
                  <div className="text-xs uppercase font-sans text-zinc-500 font-semibold tracking-wider">
                    КУРСОВАЯ РАБОТА
                  </div>
                  <div className="text-sm sm:text-lg font-bold font-sans text-zinc-900 max-w-md mx-auto leading-snug">
                    «Применение нейросетевых архитектур для автоматической генерации и нормоконтроля научно-технической документации»
                  </div>
                </div>

                <div className="pt-10 text-right text-xs text-zinc-800 space-y-1 max-w-xs ml-auto font-sans">
                  <div><strong>Выполнил:</strong> студент гр. ИУ-71</div>
                  <div>Смирнов Д. А.</div>
                  <div><strong>Руководитель:</strong> доц., к.т.н.</div>
                  <div>Васильев П. Н.</div>
                </div>

                <div className="pt-16 text-center text-xs font-sans text-zinc-600">
                  Москва — 2026
                </div>
              </div>
            )}

            {/* Page 2: Body Chapter with Formulas & Tables */}
            {currentPage === 2 && (
              <div className="space-y-4 text-justify leading-relaxed text-zinc-800">
                <div className="text-center font-bold font-sans text-sm uppercase text-zinc-900 mb-4">
                  1. АНАЛИЗ МЕТОДОВ ДЕТЕРМИНИРОВАННОЙ КОМПИЛЯЦИИ
                </div>

                <p style={{ textIndent: "1.25rem" }}>
                  В соответствии с требованиями ГОСТ 7.32-2017 абзацный отступ устанавливается равным 1,25 см. Текст форматируется по ширине страницы без разреженных интервалов. Разработанный алгоритм осуществляет синтаксическую верификацию каждого строкового блока перед вставкой в OpenXML-контейнер<sup className="text-blue-700 font-bold">[1]</sup>.
                </p>

                {/* Formula */}
                <div className="my-4 py-2 px-4 bg-zinc-50 border border-zinc-200 rounded font-mono text-center text-xs flex justify-between items-center">
                  <span className="flex-1 font-semibold text-zinc-900">
                    F_accuracy = &sum; (AST_nodes &middot; StrictRule_i) / N
                  </span>
                  <span className="text-zinc-500 font-sans text-[11px]">(1.1)</span>
                </div>

                <p style={{ textIndent: "1.25rem" }}>
                  Формулы центрируются, а их порядковые номера заключаются в круглые скобки и выравниваются по правому краю страницы. Результаты тестирования модулей представлены в таблице 1.1.
                </p>

                {/* Table */}
                <div className="my-3 font-sans text-xs">
                  <div className="text-left text-zinc-600 mb-1">Таблица 1.1 — Сводные показатели нормоконтроля</div>
                  <table className="w-full border-collapse border border-zinc-900 text-center">
                    <thead>
                      <tr className="bg-zinc-100">
                        <th className="border border-zinc-900 p-1.5 font-semibold text-left">Параметр</th>
                        <th className="border border-zinc-900 p-1.5 font-semibold">ГОСТ 7.32-2017</th>
                        <th className="border border-zinc-900 p-1.5 font-semibold">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-zinc-900 p-1 text-left">Межстрочный интервал</td>
                        <td className="border border-zinc-900 p-1">1.5 (Строго)</td>
                        <td className="border border-zinc-900 p-1 text-emerald-700 font-bold">100% OK</td>
                      </tr>
                      <tr>
                        <td className="border border-zinc-900 p-1 text-left">Левое поле</td>
                        <td className="border border-zinc-900 p-1">30 мм</td>
                        <td className="border border-zinc-900 p-1 text-emerald-700 font-bold">100% OK</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-zinc-300 text-[10px] font-sans text-zinc-600">
                  <sup>1</sup> ГОСТ 7.32-2017. Отчет о научно-исследовательской работе. Структура и правила оформления.
                </div>
              </div>
            )}

            {/* Page 3: Bibliography */}
            {currentPage === 3 && (
              <div className="space-y-4 text-justify leading-relaxed text-zinc-800">
                <div className="text-center font-bold font-sans text-sm uppercase text-zinc-900 mb-4">
                  СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ
                </div>

                <ol className="list-decimal list-inside space-y-2.5 text-xs">
                  <li className="pl-2" style={{ textIndent: "1.25rem" }}>
                    ГОСТ 7.32-2017. Отчет о научно-исследовательской работе. Структура и правила оформления. — Введ. 2018-07-01. — М.: Стандартинформ, 2017. — 34 с.
                  </li>
                  <li className="pl-2" style={{ textIndent: "1.25rem" }}>
                    ГОСТ Р 7.0.100-2018. Библиографическая запись. Библиографическое описание. Общие требования и правила составления. — М.: Стандартинформ, 2018. — 68 с.
                  </li>
                  <li className="pl-2" style={{ textIndent: "1.25rem" }}>
                    Иванов, А. С. Алгоритмы синтеза академических текстов на основе деревьев AST / А. С. Иванов // Программная инженерия. — 2025. — Т. 16, № 3. — С. 112–119.
                  </li>
                  <li className="pl-2" style={{ textIndent: "1.25rem" }}>
                    Ковалев, М. Д. Автоматизация нормоконтроля в высших учебных заведениях: монография / М. Д. Ковалев. — СПб.: Политех-Пресс, 2024. — 190 с.
                  </li>
                </ol>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Page Switcher */}
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:bg-zinc-800 text-zinc-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Страница {currentPage} из {totalPages}</span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 disabled:opacity-40 hover:bg-zinc-800 text-zinc-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Action CTA */}
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition-colors"
            >
              Закрыть
            </button>
            <button
              onClick={() => {
                onClose();
                onStartClick();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <span>Сгенерировать такую же работу</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DocxPreviewModal;
