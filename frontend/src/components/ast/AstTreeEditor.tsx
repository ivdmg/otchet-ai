import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronRight,
  Edit3, 
  Check, 
  Table as TableIcon, 
  FileText, 
  FolderTree,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  GripVertical,
  CheckCircle2
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

  const [collapsedChapters, setCollapsedChapters] = useState<Record<number, boolean>>({});
  const [editingChapterIdx, setEditingChapterIdx] = useState<number | null>(null);
  const [editingSectionIdx, setEditingSectionIdx] = useState<{ cIdx: number; sIdx: number } | null>(null);
  const [tempText, setTempText] = useState("");

  const toggleCollapse = (cIdx: number) => {
    setCollapsedChapters((prev) => ({ ...prev, [cIdx]: !prev[cIdx] }));
  };

  const calculateTotalPages = () => {
    let totalParagraphs = 0;
    chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        totalParagraphs += sec.target_paragraphs;
      });
    });
    return Math.round(totalParagraphs / 2.2) + 8;
  };

  const startEditChapter = (cIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const addChapter = () => {
    const newIdx = chapters.length + 1;
    setChapters([
      ...chapters,
      {
        title: `Новый раздел исследования ${newIdx}`,
        sections: [
          { title: `Параграф ${newIdx}.1`, target_paragraphs: 3, include_table: false },
          { title: `Параграф ${newIdx}.2`, target_paragraphs: 3, include_table: true },
        ],
      },
    ]);
  };

  const removeChapter = (cIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chapters.length <= 1) return;
    setChapters(chapters.filter((_, idx) => idx !== cIdx));
  };

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

  const removeSection = (cIdx: number, sIdx: number) => {
    const updated = [...chapters];
    if (updated[cIdx].sections.length <= 1) return;
    updated[cIdx].sections = updated[cIdx].sections.filter((_, idx) => idx !== sIdx);
    setChapters(updated);
  };

  const moveChapter = (cIdx: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIdx = direction === "up" ? cIdx - 1 : cIdx + 1;
    if (targetIdx < 0 || targetIdx >= chapters.length) return;
    const updated = [...chapters];
    const temp = updated[cIdx];
    updated[cIdx] = updated[targetIdx];
    updated[targetIdx] = temp;
    setChapters(updated);
  };

  const moveSection = (cIdx: number, sIdx: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? sIdx - 1 : sIdx + 1;
    if (targetIdx < 0 || targetIdx >= chapters[cIdx].sections.length) return;
    const updated = [...chapters];
    const temp = updated[cIdx].sections[sIdx];
    updated[cIdx].sections[sIdx] = updated[cIdx].sections[targetIdx];
    updated[cIdx].sections[targetIdx] = temp;
    setChapters(updated);
  };

  const toggleTable = (cIdx: number, sIdx: number) => {
    const updated = [...chapters];
    updated[cIdx].sections[sIdx].include_table = !updated[cIdx].sections[sIdx].include_table;
    setChapters(updated);
  };

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
      <div className="dark-surface p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-zinc-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Структура документа (AST)</span>
          </div>
          <h2 className="text-lg font-bold text-zinc-100 max-w-2xl line-clamp-1">
            {docTitle || "Без названия"}
          </h2>
          <p className="text-xs text-zinc-400 font-normal">
            Скорректируйте наименования глав и параграфов перед запуском компилятора.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-zinc-500 block">Прогноз объема</span>
            <span className="text-lg font-extrabold font-mono text-zinc-100">
              ~{calculateTotalPages()} стр.
            </span>
          </div>
          <button
            type="button"
            onClick={handleRegeneratePreset}
            title="Восстановить пресет ГОСТ"
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-800 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Обязательный блок: ВВЕДЕНИЕ */}
      <div className="dark-surface p-4 rounded-xl border border-zinc-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <span className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono font-bold flex items-center justify-center">
            00
          </span>
          <div>
            <h4 className="text-xs font-bold text-zinc-200 flex items-center space-x-2">
              <span>ВВЕДЕНИЕ (Обязательный раздел ГОСТ 7.32)</span>
            </h4>
            <p className="text-[11px] text-zinc-500 font-mono">
              Актуальность, объект, предмет, цель, задачи, методы исследования
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
          6 блоков
        </span>
      </div>

      {/* Дерево Глав и Параграфов */}
      <div className="space-y-4">
        {chapters.map((chapter, cIdx) => {
          const isCollapsed = !!collapsedChapters[cIdx];

          return (
            <div
              key={`chapter-${cIdx}`}
              className="dark-surface rounded-2xl p-5 border border-zinc-800 space-y-4 relative shadow-lg"
            >
              {/* Заголовок Главы */}
              <div 
                onClick={() => toggleCollapse(cIdx)}
                className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-800/80 cursor-pointer select-none"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="text-zinc-500 hover:text-zinc-200 transition-colors">
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${!isCollapsed ? "rotate-90" : ""}`} />
                  </div>

                  <span className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 font-mono font-bold text-xs flex items-center justify-center border border-zinc-700">
                    {cIdx + 1}
                  </span>

                  {editingChapterIdx === cIdx ? (
                    <div className="flex items-center space-x-2 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={tempText}
                        onChange={(e) => setTempText(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEditChapter(cIdx)}
                        className="p-1.5 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 flex-1">
                      <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
                        ГЛАВА {cIdx + 1}. {chapter.title}
                      </h3>
                      <button
                        onClick={(e) => startEditChapter(cIdx, e)}
                        className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Управление главой */}
                <div className="flex items-center space-x-2">
                  <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {chapter.sections.length} парагр.
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      disabled={cIdx === 0}
                      onClick={(e) => moveChapter(cIdx, "up", e)}
                      className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 disabled:opacity-20 transition-colors cursor-pointer"
                      title="Переместить вверх"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={cIdx === chapters.length - 1}
                      onClick={(e) => moveChapter(cIdx, "down", e)}
                      className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 disabled:opacity-20 transition-colors cursor-pointer"
                      title="Переместить вниз"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => removeChapter(cIdx, e)}
                      disabled={chapters.length <= 1}
                      className="p-1 rounded-lg hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 disabled:opacity-20 transition-colors cursor-pointer"
                      title="Удалить главу"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Список параграфов внутри главы */}
              {!isCollapsed && (
                <div className="pl-2 sm:pl-4 space-y-2 pt-1">
                  {chapter.sections.map((sec, sIdx) => {
                    const isEditing =
                      editingSectionIdx?.cIdx === cIdx && editingSectionIdx?.sIdx === sIdx;

                    return (
                      <div
                        key={`sec-${cIdx}-${sIdx}`}
                        className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 flex-1 w-full">
                          <GripVertical className="w-3.5 h-3.5 text-zinc-600 hidden sm:block shrink-0" />

                          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 shrink-0">
                            {cIdx + 1}.{sIdx + 1}
                          </span>

                          {isEditing ? (
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="text"
                                value={tempText}
                                onChange={(e) => setTempText(e.target.value)}
                                className="flex-1 px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                                autoFocus
                              />
                              <button
                                onClick={() => saveEditSection(cIdx, sIdx)}
                                className="p-1 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg transition-colors cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 flex-1 min-w-0">
                              <span className="text-xs font-medium text-zinc-300 truncate">
                                {sec.title}
                              </span>
                              <button
                                onClick={() => startEditSection(cIdx, sIdx)}
                                className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Параметры секции */}
                        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-900">
                          <button
                            type="button"
                            onClick={() => toggleTable(cIdx, sIdx)}
                            className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border flex items-center space-x-1.5 transition-all cursor-pointer ${
                              sec.include_table
                                ? "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                                : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                            }`}
                          >
                            <TableIcon className="w-3 h-3" />
                            <span>Таблица</span>
                            {sec.include_table && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          </button>

                          <div className="flex items-center space-x-1">
                            <button
                              disabled={sIdx === 0}
                              onClick={() => moveSection(cIdx, sIdx, "up")}
                              className="p-1 rounded hover:bg-zinc-800 text-zinc-600 disabled:opacity-20 cursor-pointer"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              disabled={sIdx === chapter.sections.length - 1}
                              onClick={() => moveSection(cIdx, sIdx, "down")}
                              className="p-1 rounded hover:bg-zinc-800 text-zinc-600 disabled:opacity-20 cursor-pointer"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeSection(cIdx, sIdx)}
                              disabled={chapter.sections.length <= 1}
                              className="p-1 rounded hover:bg-rose-950/40 text-zinc-600 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Добавить параграф */}
                  <button
                    type="button"
                    onClick={() => addSection(cIdx)}
                    className="w-full py-2 border border-dashed border-zinc-800 rounded-xl text-[11px] font-mono text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Добавить параграф в Главу {cIdx + 1}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Кнопка добавления новой главы */}
      <button
        type="button"
        onClick={addChapter}
        className="w-full py-3.5 border-2 border-dashed border-zinc-800 rounded-2xl text-xs font-mono font-semibold text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>+ Добавить новую главу</span>
      </button>

      {/* Обязательные разделы: Заключение и Список литературы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="dark-surface p-4 rounded-xl border border-zinc-800 flex items-center space-x-3">
          <FileText className="w-4 h-4 text-zinc-400" />
          <div>
            <h4 className="text-xs font-bold text-zinc-200">ЗАКЛЮЧЕНИЕ</h4>
            <p className="text-[11px] text-zinc-500 font-mono">Выводы по поставленным во введении задачам</p>
          </div>
        </div>

        <div className="dark-surface p-4 rounded-xl border border-zinc-800 flex items-center space-x-3">
          <FileText className="w-4 h-4 text-zinc-400" />
          <div>
            <h4 className="text-xs font-bold text-zinc-200">СПИСОК ИСТОЧНИКОВ</h4>
            <p className="text-[11px] text-zinc-500 font-mono">Библиографическое описание по ГОСТ 7.0.5</p>
          </div>
        </div>
      </div>

      {/* Кнопки Навигации Wizard */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors flex items-center space-x-2 cursor-pointer border border-zinc-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Назад</span>
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handleFinish}
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-sm hover:shadow-glow-cold cursor-pointer active:scale-95"
        >
          <span>Утвердить план и запустить генерацию (Шаг 3)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default AstTreeEditor;
