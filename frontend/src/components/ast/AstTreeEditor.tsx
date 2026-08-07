import React, { useState } from "react";
import { 
  OutlineAST, 
  OutlineChapterItem, 
  OutlineSectionItem 
} from "../../schemas/docAstSchema";
import { 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Edit3, 
  Check, 
  Sparkles, 
  Table as TableIcon, 
  FileText, 
  FolderTree,
  ArrowRight,
  ArrowLeft,
  RefreshCw
} from "lucide-react";

interface AstTreeEditorProps {
  initialOutline?: OutlineAST;
  docTitle: string;
  docType: "coursework" | "abstract" | "vkr";
  onSave: (outline: OutlineAST) => void;
  onBack?: () => void;
}

const defaultInitialChapters: OutlineChapterItem[] = [
  {
    title: "Теоретические основы и понятийный аппарат исследования",
    sections: [
      { title: "Понятие, сущность и ключевые характеристики предметной области", target_paragraphs: 3, include_table: false },
      { title: "Анализ современных подходов и нормативно-правового регулирования", target_paragraphs: 4, include_table: true },
      { title: "Классификация и зарубежный опыт в изучаемой сфере", target_paragraphs: 3, include_table: false },
    ],
  },
  {
    title: "Аналитическая часть и диагностика текущего состояния",
    sections: [
      { title: "Общая характеристика объекта исследования и методический инструментарий", target_paragraphs: 4, include_table: true },
      { title: "Оценка ключевых показателей и выявление проблемных зон", target_paragraphs: 4, include_table: true },
      { title: "Сравнительный анализ и факторный аудит процессов", target_paragraphs: 3, include_table: false },
    ],
  },
  {
    title: "Разработка рекомендаций и проектных решений",
    sections: [
      { title: "Мероприятия по совершенствованию и устранению выявленных проблем", target_paragraphs: 4, include_table: true },
      { title: "Оценка социально-экономической и практической эффективности", target_paragraphs: 3, include_table: true },
    ],
  },
];

export const AstTreeEditor: React.FC<AstTreeEditorProps> = ({
  initialOutline,
  docTitle,
  docType,
  onSave,
  onBack,
}) => {
  const [chapters, setChapters] = useState<OutlineChapterItem[]>(
    initialOutline?.chapters && initialOutline.chapters.length > 0
      ? initialOutline.chapters
      : defaultInitialChapters
  );

  const [editingChapterIdx, setEditingChapterIdx] = useState<number | null>(null);
  const [editingSectionIdx, setEditingSectionIdx] = useState<{ cIdx: number; sIdx: number } | null>(null);
  const [tempText, setTempText] = useState("");

  // Расчет приблизительного количества страниц по ГОСТу
  const calculateTotalPages = () => {
    let totalParagraphs = 0;
    chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        totalParagraphs += sec.target_paragraphs;
      });
    });
    // В среднем 1 страница = ~2.5-3 параграфа по ГОСТу + Введение (3) + Заключение (3) + Источники (2)
    const pageEst = Math.round(totalParagraphs / 2.2) + 8;
    return pageEst;
  };

  // Редактирование наименования главы
  const startEditChapter = (cIdx: number) => {
    setEditingChapterIdx(cIdx);
    setTempText(chapters[cIdx].title);
  };

  const saveEditChapter = (cIdx: number) => {
    if (tempText.trim()) {
      const updated = [...chapters];
      updated[cIdx].title = tempText.trim();
      setChapters(updated);
    }
    setEditingChapterIdx(null);
  };

  // Редактирование наименования секции
  const startEditSection = (cIdx: number, sIdx: number) => {
    setEditingSectionIdx({ cIdx, sIdx });
    setTempText(chapters[cIdx].sections[sIdx].title);
  };

  const saveEditSection = (cIdx: number, sIdx: number) => {
    if (tempText.trim()) {
      const updated = [...chapters];
      updated[cIdx].sections[sIdx].title = tempText.trim();
      setChapters(updated);
    }
    setEditingSectionIdx(null);
  };

  // Добавление новой главы
  const addChapter = () => {
    const newChapterNum = chapters.length + 1;
    const newChapter: OutlineChapterItem = {
      title: `Новая глава ${newChapterNum}`,
      sections: [
        { title: `Параграф ${newChapterNum}.1`, target_paragraphs: 3, include_table: false },
        { title: `Параграф ${newChapterNum}.2`, target_paragraphs: 3, include_table: true },
      ],
    };
    setChapters([...chapters, newChapter]);
  };

  // Удаление главы
  const removeChapter = (cIdx: number) => {
    if (chapters.length <= 1) return;
    setChapters(chapters.filter((_, idx) => idx !== cIdx));
  };

  // Добавление параграфа в главу
  const addSection = (cIdx: number) => {
    const updated = [...chapters];
    const sNum = updated[cIdx].sections.length + 1;
    updated[cIdx].sections.push({
      title: `Параграф ${cIdx + 1}.${sNum}`,
      target_paragraphs: 3,
      include_table: false,
    });
    setChapters(updated);
  };

  // Удаление параграфа
  const removeSection = (cIdx: number, sIdx: number) => {
    const updated = [...chapters];
    if (updated[cIdx].sections.length <= 1) return;
    updated[cIdx].sections = updated[cIdx].sections.filter((_, idx) => idx !== sIdx);
    setChapters(updated);
  };

  // Перемещение глав вверх/вниз
  const moveChapter = (cIdx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? cIdx - 1 : cIdx + 1;
    if (targetIdx < 0 || targetIdx >= chapters.length) return;
    const updated = [...chapters];
    const temp = updated[cIdx];
    updated[cIdx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setChapters(updated);
  };

  // Перемещение секций
  const moveSection = (cIdx: number, sIdx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? sIdx - 1 : sIdx + 1;
    if (targetIdx < 0 || targetIdx >= chapters[cIdx].sections.length) return;
    const updated = [...chapters];
    const temp = updated[cIdx].sections[sIdx];
    updated[cIdx].sections[sIdx] = updated[cIdx].sections[targetIdx];
    updated[cIdx].sections[targetIdx] = temp;
    setChapters(updated);
  };

  // Переключение таблицы в секции
  const toggleTable = (cIdx: number, sIdx: number) => {
    const updated = [...chapters];
    updated[cIdx].sections[sIdx].include_table = !updated[cIdx].sections[sIdx].include_table;
    setChapters(updated);
  };

  // Авто-сгенерировать оптимизированный план
  const handleRegeneratePreset = () => {
    setChapters(defaultInitialChapters);
  };

  const handleFinish = () => {
    const outline: OutlineAST = {
      doc_type: docType,
      title: docTitle,
      chapters,
    };
    onSave(outline);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Bar с информацией о теме и прогнозом объема */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-xs text-blue-400 font-semibold mb-1 uppercase tracking-wider">
            <FolderTree className="w-4 h-4" />
            <span>Интерактивный AST Дерево-Редактор</span>
          </div>
          <h2 className="text-xl font-bold text-white max-w-2xl line-clamp-1">{docTitle || "Без названия"}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Настройте структуру глав и параграфов. Все изменения автоматически применятся к генерации ИИ.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-[10px] uppercase text-slate-500 font-semibold">Прогноз объема</p>
            <p className="text-lg font-extrabold text-amber-400 flex items-center justify-end space-x-1">
              <span>~{calculateTotalPages()} стр.</span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleRegeneratePreset}
            title="Восстановить пресет ГОСТ"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Обязательный блок: ВВЕДЕНИЕ */}
      <div className="glass-card p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 flex items-center justify-between opacity-80">
        <div className="flex items-center space-x-3">
          <span className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-mono font-bold flex items-center justify-center">
            0.1
          </span>
          <div>
            <h4 className="text-sm font-semibold text-white">ВВЕДЕНИЕ (Обязательный раздел ГОСТ 7.32)</h4>
            <p className="text-xs text-slate-400">
              Включает: Актуальность, Объект, Предмет, Цель, Задачи, Методы исследования
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-mono">
          6 Блоков
        </span>
      </div>

      {/* Дерево Глав и Параграфов */}
      <div className="space-y-4">
        {chapters.map((chapter, cIdx) => (
          <div
            key={cIdx}
            className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 relative group"
          >
            {/* Заголовок Главы */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3 flex-1">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                  {cIdx + 1}
                </span>

                {editingChapterIdx === cIdx ? (
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="text"
                      value={tempText}
                      onChange={(e) => setTempText(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-950 border border-blue-500 rounded-lg text-white text-sm focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEditChapter(cIdx)}
                      className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 flex-1">
                    <h3 className="text-base font-bold text-white tracking-wide">
                      ГЛАВА {cIdx + 1}. {chapter.title}
                    </h3>
                    <button
                      onClick={() => startEditChapter(cIdx)}
                      className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Управление главой */}
              <div className="flex items-center space-x-1">
                <button
                  disabled={cIdx === 0}
                  onClick={() => moveChapter(cIdx, "up")}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  disabled={cIdx === chapters.length - 1}
                  onClick={() => moveChapter(cIdx, "down")}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 disabled:opacity-30 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeChapter(cIdx)}
                  disabled={chapters.length <= 1}
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Список параграфов внутри главы */}
            <div className="pl-4 sm:pl-8 space-y-2">
              {chapter.sections.map((sec, sIdx) => {
                const isEditing =
                  editingSectionIdx?.cIdx === cIdx && editingSectionIdx?.sIdx === sIdx;

                return (
                  <div
                    key={sIdx}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center space-x-3 flex-1 w-full">
                      <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-slate-800 text-blue-400">
                        {cIdx + 1}.{sIdx + 1}
                      </span>

                      {isEditing ? (
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="text"
                            value={tempText}
                            onChange={(e) => setTempText(e.target.value)}
                            className="flex-1 px-3 py-1 bg-slate-950 border border-blue-500 rounded-lg text-white text-xs focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => saveEditSection(cIdx, sIdx)}
                            className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 flex-1">
                          <span className="text-sm font-medium text-slate-200">{sec.title}</span>
                          <button
                            onClick={() => startEditSection(cIdx, sIdx)}
                            className="p-1 text-slate-500 hover:text-blue-400 transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Параметры секции (Таблица, Объем, Сортировка) */}
                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      {/* Чекбокс включения таблицы */}
                      <button
                        type="button"
                        onClick={() => toggleTable(cIdx, sIdx)}
                        className={`text-xs px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 transition-all ${
                          sec.include_table
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                            : "bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <TableIcon className="w-3.5 h-3.5" />
                        <span>Таблица ГОСТ</span>
                      </button>

                      {/* Управление сортировкой и удалением */}
                      <div className="flex items-center space-x-1">
                        <button
                          disabled={sIdx === 0}
                          onClick={() => moveSection(cIdx, sIdx, "up")}
                          className="p-1 rounded hover:bg-slate-800 text-slate-500 disabled:opacity-20"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={sIdx === chapter.sections.length - 1}
                          onClick={() => moveSection(cIdx, sIdx, "down")}
                          className="p-1 rounded hover:bg-slate-800 text-slate-500 disabled:opacity-20"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeSection(cIdx, sIdx)}
                          disabled={chapter.sections.length <= 1}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 disabled:opacity-20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Кнопка добавления параграфа */}
              <button
                type="button"
                onClick={() => addSection(cIdx)}
                className="w-full py-2.5 border border-dashed border-slate-800 rounded-xl text-xs font-semibold text-slate-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить параграф в Главу {cIdx + 1}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка добавления новой главы */}
      <button
        type="button"
        onClick={addChapter}
        className="w-full py-3.5 border-2 border-dashed border-slate-800 rounded-2xl text-sm font-semibold text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10 transition-all flex items-center justify-center space-x-2 cursor-pointer"
      >
        <Plus className="w-4 h-4 text-blue-400" />
        <span>+ Добавить новую главу</span>
      </button>

      {/* Обязательные разделы: Заключение и Список литературы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 opacity-80 flex items-center space-x-3">
          <FileText className="w-5 h-5 text-amber-400" />
          <div>
            <h4 className="text-sm font-semibold text-white">ЗАКЛЮЧЕНИЕ</h4>
            <p className="text-xs text-slate-400">Выводы по поставленным во введении задачам</p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 opacity-80 flex items-center space-x-3">
          <FileText className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="text-sm font-semibold text-white">СПИСОК ИСТОЧНИКОВ</h4>
            <p className="text-xs text-slate-400">Оформление по ГОСТ Р 7.0.100-2018</p>
          </div>
        </div>
      </div>

      {/* Кнопки Навигации Wizard */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад к Исходным данным</span>
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handleFinish}
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center space-x-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Утвердить план и запустить ИИ-генератор (Шаг 3)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
