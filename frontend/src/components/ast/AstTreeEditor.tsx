import React, { useState, useEffect } from "react";
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
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  Sparkles,
  BookOpen
} from "lucide-react";

interface AstTreeEditorProps {
  initialOutline?: OutlineAST;
  docTitle: string;
  docSubject?: string;
  docType: "coursework" | "abstract" | "vkr";
  chapterCount?: number;
  targetPages?: number;
  customPrompt?: string;
  onSave: (outline: OutlineAST) => void;
  onBack?: () => void;
}

// Умный генератор адаптивной структуры под введенную тему, предмет и количество глав
const generateSmartChapters = (
  title: string,
  subject: string = "",
  count: number = 3,
  docType: string = "coursework",
  variationSeed: number = 0
): OutlineChapterItem[] => {
  const cleanTitle = title.trim() || "Исследуемая предметная область";
  // Краткая тема для подстановки в заголовки
  const shortTopic = cleanTitle.length > 50 ? `${cleanTitle.slice(0, 48)}...` : cleanTitle;

  if (count <= 2) {
    return [
      {
        title: variationSeed % 2 === 0
          ? `Теоретические основы и сущность темы «${shortTopic}»`
          : `Теоретико-методологические аспекты исследования темы «${shortTopic}»`,
        sections: [
          { title: "Понятие, сущность и ключевые характеристики предметной области", target_paragraphs: 3, include_table: false },
          { title: "Нормативно-правовая база и современные подходы к исследованию", target_paragraphs: 3, include_table: false },
          { title: "Классификация и ключевые факторы развития", target_paragraphs: 3, include_table: false },
        ],
      },
      {
        title: variationSeed % 2 === 0
          ? `Практический анализ и направления совершенствования`
          : `Аналитическая оценка текущего состояния и рекомендации`,
        sections: [
          { title: "Анализ современного состояния и ключевых показателей объекта исследования", target_paragraphs: 4, include_table: false },
          { title: "Выявление основных проблем, тенденций и практические рекомендации", target_paragraphs: 3, include_table: false },
        ],
      },
    ];
  }

  const generated: OutlineChapterItem[] = [
    {
      title: variationSeed % 2 === 0
        ? `Теоретические и методические основы исследования темы «${shortTopic}»`
        : `Теоретический базис и понятийный аппарат в контексте темы «${shortTopic}»`,
      sections: [
        { title: "Понятие, экономико-правовая сущность и значение предметной области", target_paragraphs: 3, include_table: false },
        { title: "Нормативно-правовое регулирование и методические подходы к анализу", target_paragraphs: 3, include_table: false },
        { title: "Современные тенденции и зарубежный опыт в исследуемой сфере", target_paragraphs: 3, include_table: false },
      ],
    },
    {
      title: variationSeed % 2 === 0
        ? `Анализ современного состояния и оценка ключевых показателей`
        : `Диагностика процессов и аналитическая оценка предметной области`,
      sections: [
        { title: "Общая характеристика объекта исследования и динамика показателей", target_paragraphs: 4, include_table: false },
        { title: "Факторный анализ и выявление ключевых проблемных зон", target_paragraphs: 3, include_table: false },
      ],
    },
    {
      title: variationSeed % 2 === 0
        ? `Разработка комплекса рекомендаций и оценка их эффективности`
        : `Проектные предложения по совершенствованию и практические решения`,
      sections: [
        { title: "Мероприятия по оптимизации и устранению выявленных проблем", target_paragraphs: 3, include_table: false },
        { title: "Оценка социально-экономической и практической результативности решений", target_paragraphs: 3, include_table: false },
      ],
    },
    {
      title: "План внедрения и оценка сопутствующих рисков",
      sections: [
        { title: "Организационно-экономический механизм реализации предложенных мер", target_paragraphs: 3, include_table: false },
        { title: "Идентификация ключевых рисков и методы их минимизации", target_paragraphs: 3, include_table: false },
      ],
    },
    {
      title: "Стратегические перспективы развития и система мониторинга",
      sections: [
        { title: "Система индикаторов результативности и контроля выполнения", target_paragraphs: 3, include_table: false },
        { title: "Долгосрочный прогноз развития исследуемой области", target_paragraphs: 3, include_table: false },
      ],
    },
  ];

  return generated.slice(0, Math.min(count, generated.length));
};

export const AstTreeEditor: React.FC<AstTreeEditorProps> = ({
  initialOutline,
  docTitle,
  docSubject = "",
  docType,
  chapterCount = 3,
  targetPages = 25,
  customPrompt = "",
  onSave,
  onBack,
}) => {
  const [variationSeed, setVariationSeed] = useState(0);
  const [chapters, setChapters] = useState<OutlineChapterItem[]>(() => {
    if (initialOutline?.chapters && initialOutline.chapters.length > 0) {
      return initialOutline.chapters;
    }
    return generateSmartChapters(docTitle, docSubject, chapterCount, docType, 0);
  });

  const [collapsedChapters, setCollapsedChapters] = useState<Record<number, boolean>>({});
  const [editingChapterIdx, setEditingChapterIdx] = useState<number | null>(null);
  const [editingSectionIdx, setEditingSectionIdx] = useState<{ cIdx: number; sIdx: number } | null>(null);
  const [tempText, setTempText] = useState("");

  const toggleCollapse = (cIdx: number) => {
    setCollapsedChapters((prev) => ({ ...prev, [cIdx]: !prev[cIdx] }));
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
        title: `Новая глава ${newIdx}`,
        sections: [
          { title: `Параграф ${newIdx}.1`, target_paragraphs: 3, include_table: false },
          { title: `Параграф ${newIdx}.2`, target_paragraphs: 3, include_table: false },
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

  const handleRegenerateOutline = () => {
    const nextSeed = variationSeed + 1;
    setVariationSeed(nextSeed);
    setChapters(generateSmartChapters(docTitle, docSubject, chapterCount, docType, nextSeed));
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
    <div className="w-full max-w-3xl mx-auto space-y-4 font-sans">
      
      {/* 1. Компактная шапка с темой и действием перегенерации */}
      <div className="flex items-center justify-between p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-sm">
        <div className="space-y-0.5 min-w-0 pr-3">
          <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400">
            <span>План документа</span>
            <span>•</span>
            <span>{targetPages} стр.</span>
          </div>
          <h2 className="text-sm font-semibold text-zinc-100 truncate">
            {docTitle || "Без названия"}
          </h2>
        </div>

        <button
          type="button"
          onClick={handleRegenerateOutline}
          title="Сгенерировать другой вариант плана"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 text-xs font-medium transition-colors border border-zinc-700/60 cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Перегенерировать</span>
        </button>
      </div>

      {/* 2. Единая структура документа (Содержание) */}
      <div className="dark-surface rounded-2xl p-4 sm:p-5 border border-zinc-800 space-y-3 shadow-xl">
        
        {/* ВВЕДЕНИЕ (Интегрировано в структуру) */}
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
              Введение
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            Обязательный раздел ГОСТ
          </span>
        </div>

        {/* ГЛАВЫ И ПАРАГРАФЫ */}
        <div className="space-y-2.5">
          {chapters.map((chapter, cIdx) => {
            const isCollapsed = !!collapsedChapters[cIdx];

            return (
              <div
                key={`chapter-${cIdx}`}
                className="rounded-xl bg-zinc-950/80 border border-zinc-800/90 p-3 space-y-2.5"
              >
                {/* Заголовок Главы */}
                <div 
                  onClick={() => toggleCollapse(cIdx)}
                  className="flex items-center justify-between gap-2 cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 shrink-0 ${!isCollapsed ? "rotate-90" : ""}`} />
                    
                    <span className="text-xs font-mono font-bold text-zinc-400 shrink-0">
                      Глава {cIdx + 1}.
                    </span>

                    {editingChapterIdx === cIdx ? (
                      <div className="flex items-center space-x-1.5 flex-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={tempText}
                          onChange={(e) => setTempText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && saveEditChapter(cIdx)}
                          className="flex-1 px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => saveEditChapter(cIdx)}
                          className="p-1 bg-zinc-100 text-zinc-950 rounded-md cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-zinc-100 truncate">
                          {chapter.title}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => startEditChapter(cIdx, e)}
                          className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Элементы управления главой */}
                  <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={cIdx === 0}
                      onClick={(e) => moveChapter(cIdx, "up", e)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={cIdx === chapters.length - 1}
                      onClick={(e) => moveChapter(cIdx, "down", e)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-20 cursor-pointer"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => removeChapter(cIdx, e)}
                      disabled={chapters.length <= 1}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Параграфы */}
                {!isCollapsed && (
                  <div className="pl-4 space-y-1.5 pt-1 border-t border-zinc-900">
                    {chapter.sections.map((sec, sIdx) => {
                      const isEditing = editingSectionIdx?.cIdx === cIdx && editingSectionIdx?.sIdx === sIdx;

                      return (
                        <div
                          key={`sec-${cIdx}-${sIdx}`}
                          className="py-1.5 px-2.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/60 flex items-center justify-between gap-2 text-xs transition-colors"
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <span className="font-mono text-[11px] text-zinc-500 shrink-0">
                              {cIdx + 1}.{sIdx + 1}
                            </span>

                            {isEditing ? (
                              <div className="flex items-center space-x-1.5 flex-1">
                                <input
                                  type="text"
                                  value={tempText}
                                  onChange={(e) => setTempText(e.target.value)}
                                  onKeyDown={(e) => e.key === "Enter" && saveEditSection(cIdx, sIdx)}
                                  className="flex-1 px-2 py-0.5 bg-zinc-950 border border-zinc-700 rounded text-zinc-100 text-xs focus:outline-none focus:border-zinc-400"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => saveEditSection(cIdx, sIdx)}
                                  className="p-1 bg-zinc-100 text-zinc-950 rounded cursor-pointer"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1.5 flex-1 min-w-0">
                                <span className="text-zinc-300 truncate">
                                  {sec.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => startEditSection(cIdx, sIdx)}
                                  className="p-0.5 text-zinc-600 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              type="button"
                              disabled={sIdx === 0}
                              onClick={() => moveSection(cIdx, sIdx, "up")}
                              className="p-0.5 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-20 cursor-pointer"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={sIdx === chapter.sections.length - 1}
                              onClick={() => moveSection(cIdx, sIdx, "down")}
                              className="p-0.5 rounded text-zinc-500 hover:text-zinc-300 disabled:opacity-20 cursor-pointer"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSection(cIdx, sIdx)}
                              disabled={chapter.sections.length <= 1}
                              className="p-0.5 rounded text-zinc-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Добавить параграф */}
                    <button
                      type="button"
                      onClick={() => addSection(cIdx)}
                      className="w-full py-1.5 border border-dashed border-zinc-800 rounded-lg text-[11px] font-mono text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Добавить параграф</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Кнопка добавления главы */}
        <button
          type="button"
          onClick={addChapter}
          className="w-full py-2.5 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить главу</span>
        </button>

        {/* ЗАКЛЮЧЕНИЕ (Интегрировано в структуру) */}
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
              Заключение
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            Выводы по задачам
          </span>
        </div>

        {/* СПИСОК ИСТОЧНИКОВ (Интегрировано в структуру) */}
        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sparkles className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
              Список использованных источников
            </span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            ГОСТ Р 7.0.100
          </span>
        </div>

      </div>

      {/* 3. Кнопки Навигации */}
      <div className="flex items-center justify-between pt-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors flex items-center space-x-1.5 cursor-pointer border border-zinc-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Назад</span>
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handleFinish}
          className="inline-flex items-center space-x-2 px-7 py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-sm cursor-pointer active:scale-95"
        >
          <span>Утвердить план и перейти к генерации</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default AstTreeEditor;
