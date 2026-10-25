import React, { useState } from "react";
import { 
  OutlineAST, 
  OutlineChapterItem, 
  OutlineSectionItem 
} from "../../schemas/docAstSchema";
import { 
  Trash2, 
  ChevronRight,
  Edit3, 
  Check, 
  FileText, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  BookOpen,
  AlertCircle
} from "lucide-react";
import { useUserStore } from "../../store/useUserStore";

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

// Генератор адаптивной структуры под введенную тему, предмет и количество глав
const generateSmartChapters = (
  title: string,
  subject: string = "",
  count: number = 3,
  docType: string = "coursework",
  variationSeed: number = 0
): OutlineChapterItem[] => {
  const cleanTitle = title.trim() || "Исследуемая предметная область";
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
  onSave,
  onBack,
}) => {
  const { user, deductCredits } = useUserStore();
  const [variationSeed, setVariationSeed] = useState(0);
  const [regenCount, setRegenCount] = useState(0);
  const [regenError, setRegenError] = useState<string | null>(null);

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

  const removeChapter = (cIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (chapters.length <= 1) return;
    setChapters(chapters.filter((_, idx) => idx !== cIdx));
  };

  const removeSection = (cIdx: number, sIdx: number) => {
    const updated = [...chapters];
    if (updated[cIdx].sections.length <= 1) return;
    updated[cIdx].sections = updated[cIdx].sections.filter((_, idx) => idx !== sIdx);
    setChapters(updated);
  };

  const handleRegenerateOutline = () => {
    if (regenCount >= 1) {
      if (user.credits < 5) {
        setRegenError("Недостаточно кредитов (+5 CR) для повторной генерации плана");
        return;
      }
      deductCredits(5);
    }
    setRegenError(null);
    const nextSeed = variationSeed + 1;
    setVariationSeed(nextSeed);
    setRegenCount((prev) => prev + 1);
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
    <div className="w-full max-w-4xl mx-auto space-y-5 font-sans">
      
      {/* 1. Header Toolbar with Title & Refresh Action (Responsive flex-col / sm:flex-row) */}
      <div className="p-5 bg-[#0c0c10]/80 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400">
            <span>План документа</span>
            <span>•</span>
            <span className="text-zinc-300 font-semibold">{targetPages} стр.</span>
            <span>•</span>
            <span className="text-white">{chapters.length} {chapters.length === 2 ? "главы" : chapters.length < 5 ? "главы" : "глав"}</span>
          </div>
          <h2 className="text-sm sm:text-base font-semibold text-white break-words">
            {docTitle || "Без названия"}
          </h2>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={handleRegenerateOutline}
            title="Сгенерировать другой вариант плана"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 text-xs font-mono transition-colors border border-white/[0.1] hover:border-white/20 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span>
              {regenCount === 0 
                ? "Перегенерировать план (бесплатно, 1 попытка)" 
                : "Перегенерировать (+5 кредитов)"}
            </span>
          </button>
        </div>
      </div>

      {regenError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2 font-mono">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{regenError}</span>
        </div>
      )}

      {/* 2. Main Document Structure Container */}
      <div className="bg-[#0c0c10]/70 rounded-2xl p-4 sm:p-6 border border-white/[0.08] space-y-3">
        
        {/* ВВЕДЕНИЕ */}
        <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Введение
            </span>
          </div>
        </div>

        {/* ГЛАВЫ И ПАРАГРАФЫ */}
        <div className="space-y-3">
          {chapters.map((chapter, cIdx) => {
            const isCollapsed = !!collapsedChapters[cIdx];
            const chapterNumStr = String(cIdx + 1).padStart(2, "0");

            return (
              <div
                key={`chapter-${cIdx}`}
                className="rounded-xl bg-zinc-950/60 border border-white/[0.08] p-4 space-y-3 transition-colors"
              >
                {/* Заголовок Главы */}
                <div 
                  onClick={() => toggleCollapse(cIdx)}
                  className="flex items-start justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                    <ChevronRight className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 shrink-0 mt-0.5 ${!isCollapsed ? "rotate-90" : ""}`} />
                    
                    <span className="text-xs font-mono font-bold text-zinc-400 shrink-0 mt-0.5">
                      {chapterNumStr}.
                    </span>

                    {editingChapterIdx === cIdx ? (
                      <div className="flex flex-col gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                        <textarea
                          rows={2}
                          value={tempText}
                          onChange={(e) => setTempText(e.target.value)}
                          className="w-full px-3 py-1.5 bg-zinc-900 border border-white/20 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-white resize-none"
                          autoFocus
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => saveEditChapter(cIdx)}
                            className="px-3 py-1 bg-white text-zinc-950 rounded-lg cursor-pointer font-medium text-xs flex items-center space-x-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Сохранить</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingChapterIdx(null)}
                            className="px-3 py-1 bg-zinc-800 text-zinc-300 hover:text-white rounded-lg cursor-pointer text-xs"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start space-x-2 flex-1 min-w-0">
                        <span className="text-xs font-semibold text-zinc-100 break-words leading-snug">
                          {chapter.title}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => startEditChapter(cIdx, e)}
                          className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
                          title="Редактировать название"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Chapter Control Buttons (Hidden while editing) */}
                  {editingChapterIdx !== cIdx && (
                    <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => removeChapter(cIdx, e)}
                        disabled={chapters.length <= 1}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-white/5 disabled:opacity-20 cursor-pointer transition-colors"
                        title="Удалить главу"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Paragraphs List */}
                {!isCollapsed && (
                  <div className="pl-3 sm:pl-5 space-y-1.5 pt-2 border-t border-white/[0.04]">
                    {chapter.sections.map((sec, sIdx) => {
                      const isEditing = editingSectionIdx?.cIdx === cIdx && editingSectionIdx?.sIdx === sIdx;

                      return (
                        <div
                          key={`sec-${cIdx}-${sIdx}`}
                          className="py-2 px-3 rounded-lg hover:bg-white/[0.04] flex items-start justify-between gap-2.5 text-xs transition-colors"
                        >
                          <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                            <span className="font-mono text-[11px] text-zinc-500 shrink-0 mt-0.5">
                              {cIdx + 1}.{sIdx + 1}
                            </span>

                            {isEditing ? (
                              <div className="flex flex-col gap-2 flex-1">
                                <textarea
                                  rows={2}
                                  value={tempText}
                                  onChange={(e) => setTempText(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-zinc-900 border border-white/20 rounded text-zinc-100 text-xs focus:outline-none focus:border-white resize-none"
                                  autoFocus
                                />
                                <div className="flex items-center space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => saveEditSection(cIdx, sIdx)}
                                    className="px-2.5 py-1 bg-white text-zinc-950 rounded cursor-pointer font-medium text-xs flex items-center space-x-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Сохранить</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSectionIdx(null)}
                                    className="px-2.5 py-1 bg-zinc-800 text-zinc-300 hover:text-white rounded cursor-pointer text-xs"
                                  >
                                    Отмена
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start space-x-2 flex-1 min-w-0">
                                <span className="text-zinc-300 break-words leading-relaxed">
                                  {sec.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => startEditSection(cIdx, sIdx)}
                                  className="p-0.5 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer shrink-0 mt-0.5"
                                  title="Редактировать параграф"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {!isEditing && (
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => removeSection(cIdx, sIdx)}
                                disabled={chapter.sections.length <= 1}
                                className="p-1 rounded text-zinc-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                                title="Удалить параграф"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ЗАКЛЮЧЕНИЕ */}
        <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Заключение
            </span>
          </div>
        </div>

        {/* СПИСОК ИСТОЧНИКОВ */}
        <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
              Список источников
            </span>
          </div>
        </div>

      </div>

      {/* 3. Navigation Actions (Icon-only Back button on mobile) */}
      <div className="flex items-center justify-between gap-3 pt-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="w-12 sm:w-auto px-0 sm:px-5 py-3 sm:py-3.5 rounded-xl bg-transparent hover:bg-white/5 text-zinc-300 font-mono text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer border border-white/[0.08] hover:border-white/20 shrink-0"
            title="Назад"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад</span>
          </button>
        ) : <div />}

        <button
          type="button"
          onClick={handleFinish}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-2 px-5 sm:px-8 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-all shadow-md cursor-pointer active:scale-[0.99]"
        >
          <span>Утвердить план и перейти к генерации</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};

export default AstTreeEditor;
