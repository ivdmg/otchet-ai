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
  Sparkles, 
  Table as TableIcon, 
  FileText, 
  FolderTree,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  GripVertical,
  Layers,
  CheckCircle2
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

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

  // Toggle collapse for chapter subtree
  const toggleCollapse = (cIdx: number) => {
    setCollapsedChapters((prev) => ({ ...prev, [cIdx]: !prev[cIdx] }));
  };

  // Расчет приблизительного количества страниц по ГОСТу
  const calculateTotalPages = () => {
    let totalParagraphs = 0;
    chapters.forEach((ch) => {
      ch.sections.forEach((sec) => {
        totalParagraphs += sec.target_paragraphs;
      });
    });
    // В среднем 1 страница = ~2.2 параграфа по ГОСТу + Введение (3) + Заключение (3) + Источники (2)
    const pageEst = Math.round(totalParagraphs / 2.2) + 8;
    return pageEst;
  };

  // Редактирование наименования главы
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
  const removeChapter = (cIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Перемещение глав вверх/вниз (с анимированной перекомпоновкой)
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
      <div className="glass-panel p-6 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-indigo-500/20 shadow-glass">
        <div>
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-semibold mb-1 uppercase tracking-wider">
            <FolderTree className="w-4 h-4 text-indigo-400" />
            <span>Интерактивный AST Дерево-Редактор</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block ml-1" />
          </div>
          <h2 className="text-xl font-bold text-white dark:text-white light:text-slate-900 max-w-2xl line-clamp-1">{docTitle || "Без названия"}</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-0.5">
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleRegeneratePreset}
            title="Восстановить пресет ГОСТ"
            className="p-2.5 rounded-xl bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-200 hover:bg-slate-800 text-slate-300 dark:text-slate-300 light:text-slate-700 transition-colors border border-slate-700/50 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Обязательный блок: ВВЕДЕНИЕ */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        className="glass-card p-4 rounded-2xl border border-indigo-500/20 bg-indigo-950/20 flex items-center justify-between opacity-90 shadow-sm"
      >
        <div className="flex items-center space-x-3">
          <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center">
            0.1
          </span>
          <div>
            <h4 className="text-sm font-semibold text-white dark:text-white light:text-slate-900 flex items-center space-x-2">
              <span>ВВЕДЕНИЕ (Обязательный раздел ГОСТ 7.32)</span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
              Включает: Актуальность, Объект, Предмет, Цель, Задачи, Методы исследования
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
          6 Блоков
        </span>
      </motion.div>

      {/* Дерево Глав и Параграфов с Framer Motion Layout Reordering */}
      <div className="space-y-4">
        <AnimatePresence>
          {chapters.map((chapter, cIdx) => {
            const isCollapsed = !!collapsedChapters[cIdx];

            return (
              <motion.div
                key={`chapter-${cIdx}`}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="glass-card rounded-3xl p-5 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 space-y-4 relative group"
              >
                {/* Заголовок Главы */}
                <div 
                  onClick={() => toggleCollapse(cIdx)}
                  className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/60 dark:border-slate-800/60 light:border-slate-200 cursor-pointer select-none"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <motion.div
                      animate={{ rotate: isCollapsed ? 0 : 90 }}
                      transition={{ duration: 0.2 }}
                      className="text-slate-400 hover:text-indigo-400 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.div>

                    <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-600/30">
                      {cIdx + 1}
                    </span>

                    {editingChapterIdx === cIdx ? (
                      <div className="flex items-center space-x-2 flex-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={tempText}
                          onChange={(e) => setTempText(e.target.value)}
                          className="flex-1 px-3 py-1.5 glass-input rounded-xl text-white text-sm focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEditChapter(cIdx)}
                          className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 flex-1">
                        <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900 tracking-wide">
                          ГЛАВА {cIdx + 1}. {chapter.title}
                        </h3>
                        <button
                          onClick={(e) => startEditChapter(cIdx, e)}
                          className="p-1 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Управление главой & Пульсирующий AI Индикатор */}
                  <div className="flex items-center space-x-2">
                    <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs border border-indigo-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span>{chapter.sections.length} подразд.</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        disabled={cIdx === 0}
                        onClick={(e) => moveChapter(cIdx, "up", e)}
                        className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 disabled:opacity-20 transition-colors cursor-pointer"
                        title="Переместить вверх"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        disabled={cIdx === chapters.length - 1}
                        onClick={(e) => moveChapter(cIdx, "down", e)}
                        className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 disabled:opacity-20 transition-colors cursor-pointer"
                        title="Переместить вниз"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => removeChapter(cIdx, e)}
                        disabled={chapters.length <= 1}
                        className="p-1.5 rounded-xl hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 disabled:opacity-20 transition-colors cursor-pointer"
                        title="Удалить главу"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Список параграфов внутри главы с анимацией сворачивания */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden pl-2 sm:pl-6 space-y-2.5 pt-1"
                    >
                      <AnimatePresence>
                        {chapter.sections.map((sec, sIdx) => {
                          const isEditing =
                            editingSectionIdx?.cIdx === cIdx && editingSectionIdx?.sIdx === sIdx;

                          return (
                            <motion.div
                              key={`sec-${cIdx}-${sIdx}`}
                              layout
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              whileHover={{ scale: 1.008 }}
                              transition={{ type: "spring", stiffness: 350, damping: 30 }}
                              className="p-3.5 rounded-2xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-100 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-300 hover:border-indigo-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                            >
                              <div className="flex items-center space-x-3 flex-1 w-full">
                                <GripVertical className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-grab shrink-0 hidden sm:block" />

                                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                                  {cIdx + 1}.{sIdx + 1}
                                </span>

                                {isEditing ? (
                                  <div className="flex items-center space-x-2 flex-1">
                                    <input
                                      type="text"
                                      value={tempText}
                                      onChange={(e) => setTempText(e.target.value)}
                                      className="flex-1 px-3 py-1 glass-input rounded-xl text-white text-xs focus:outline-none"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => saveEditSection(cIdx, sIdx)}
                                      className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center space-x-2 flex-1">
                                    <span className="text-sm font-medium text-slate-200 dark:text-slate-200 light:text-slate-800">
                                      {sec.title}
                                    </span>
                                    <button
                                      onClick={() => startEditSection(cIdx, sIdx)}
                                      className="p-1 text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Параметры секции (Таблица, Объем, Сортировка) */}
                              <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                                {/* Чекбокс включения таблицы */}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  onClick={() => toggleTable(cIdx, sIdx)}
                                  className={`text-xs px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all cursor-pointer ${
                                    sec.include_table
                                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-glow-emerald"
                                      : "bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                                  }`}
                                >
                                  <TableIcon className="w-3.5 h-3.5" />
                                  <span>Таблица ГОСТ</span>
                                  {sec.include_table && <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />}
                                </motion.button>

                                {/* Управление сортировкой и удалением */}
                                <div className="flex items-center space-x-1">
                                  <button
                                    disabled={sIdx === 0}
                                    onClick={() => moveSection(cIdx, sIdx, "up")}
                                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 disabled:opacity-20 cursor-pointer"
                                  >
                                    <ChevronUp className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    disabled={sIdx === chapter.sections.length - 1}
                                    onClick={() => moveSection(cIdx, sIdx, "down")}
                                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 disabled:opacity-20 cursor-pointer"
                                  >
                                    <ChevronDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => removeSection(cIdx, sIdx)}
                                    disabled={chapter.sections.length <= 1}
                                    className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 disabled:opacity-20 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      {/* Кнопка добавления параграфа */}
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="button"
                        onClick={() => addSection(cIdx)}
                        className="w-full py-2.5 border border-dashed border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl text-xs font-semibold text-slate-400 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Добавить параграф в Главу {cIdx + 1}</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Кнопка добавления новой главы */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="button"
        onClick={addChapter}
        className="w-full py-4 border-2 border-dashed border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-3xl text-sm font-semibold text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white hover:border-indigo-500 hover:bg-indigo-500/10 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
      >
        <Plus className="w-4 h-4 text-indigo-400" />
        <span>+ Добавить новую главу</span>
      </motion.button>

      {/* Обязательные разделы: Заключение и Список литературы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard variant="indigo" interactive={false} className="p-4 rounded-2xl opacity-90 flex items-center space-x-3">
          <FileText className="w-5 h-5 text-amber-400" />
          <div>
            <h4 className="text-sm font-semibold text-white dark:text-white light:text-slate-900">ЗАКЛЮЧЕНИЕ</h4>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">Выводы по поставленным во введении задачам</p>
          </div>
        </GlassCard>

        <GlassCard variant="indigo" interactive={false} className="p-4 rounded-2xl opacity-90 flex items-center space-x-3">
          <FileText className="w-5 h-5 text-emerald-400" />
          <div>
            <h4 className="text-sm font-semibold text-white dark:text-white light:text-slate-900">СПИСОК ИСТОЧНИКОВ</h4>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">Оформление по ГОСТ Р 7.0.100-2018</p>
          </div>
        </GlassCard>
      </div>

      {/* Кнопки Навигации Wizard */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
        {onBack ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-900 light:bg-slate-200 hover:bg-slate-800 text-slate-300 dark:text-slate-300 light:text-slate-700 font-semibold text-sm transition-colors flex items-center space-x-2 cursor-pointer border border-slate-800 dark:border-slate-800 light:border-slate-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад к Исходным данным</span>
          </motion.button>
        ) : <div />}

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleFinish}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center space-x-2 cursor-pointer glow-effect-indigo"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Утвердить план и запустить ИИ-генератор (Шаг 3)</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};
