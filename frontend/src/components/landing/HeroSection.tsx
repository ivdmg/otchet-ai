import React, { useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Award, 
  FileCheck, 
  Eye, 
  Flame,
  ChevronRight,
  Star,
  Check,
  Layout,
  BookMarked
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface HeroSectionProps {
  onStartClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onStartClick }) => {
  const [activeTab, setActiveTab] = useState<"title" | "body" | "biblio">("body");

  // 3D tilt logic for the demo document viewer
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-6, 6]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(e.clientX - centerX);
    y.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="relative pt-6 pb-16 overflow-hidden">
      {/* Background radial spotlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/15 to-blue-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Badges & Announcement */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-violet-950/80 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 text-xs font-medium text-indigo-300 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-semibold text-white">ГОСТ 7.32-2017 & 2026 Ready</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Автоматическая верстка без MS Word рутины</span>
            <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-5xl leading-[1.12] text-center font-outfit"
          >
            Идеальная Курсовая и ВКР <br />
            по <span className="gradient-heading">ГОСТ 7.32-2017</span> за 3 минуты
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-3xl leading-relaxed text-center"
          >
            Первый ИИ-движок с <span className="text-indigo-400 font-semibold">AST-архитектурой</span>. Забудьте про съехавшие поля 30/10/20/20 мм, ручной поиск сносок и разрывы страниц — готовый <span className="text-white font-medium">.DOCX</span> генерируется строго под требования вашего ВУЗа.
          </motion.p>

          {/* CTA Buttons & Social Proof Counters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="pt-4 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            {/* Primary 3D Animated CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onStartClick}
              className="relative group w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-lg shadow-xl shadow-indigo-600/35 border border-indigo-400/30 flex items-center justify-center space-x-3 overflow-hidden cursor-pointer glow-effect-indigo"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              <Flame className="w-5 h-5 text-amber-300 animate-pulse" />
              <span>Попробовать бесплатно</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* Secondary Demo CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const el = document.getElementById("demo-viewer");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold text-base flex items-center justify-center space-x-2 transition-all cursor-pointer backdrop-blur-md"
            >
              <Eye className="w-5 h-5 text-indigo-400" />
              <span>Живой ГОСТ-просмотрщик</span>
            </motion.button>
          </motion.div>

          {/* Quick Features Micro List */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 pt-3 text-xs sm:text-sm text-slate-400"
          >
            <div className="flex items-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Без регистрации для старта</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>100% Антиплагиат.ВУЗ совместимость</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Экспорт в чистовой Word DOCX</span>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Metrics Row */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
        >
          <GlassCard variant="indigo" glow className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold gradient-heading font-outfit">14 250+</div>
            <div className="text-xs text-slate-400 mt-1">Сгенерировано работ</div>
          </GlassCard>
          
          <GlassCard variant="indigo" glow className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-outfit">98.4%</div>
            <div className="text-xs text-slate-400 mt-1">Средний проходной балл</div>
          </GlassCard>

          <GlassCard variant="indigo" glow className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-outfit">ГОСТ 7.32</div>
            <div className="text-xs text-slate-400 mt-1">Точная спецификация</div>
          </GlassCard>

          <GlassCard variant="indigo" glow className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-outfit">&lt; 3 мин</div>
            <div className="text-xs text-slate-400 mt-1">Время от темы до DOCX</div>
          </GlassCard>
        </motion.div>

        {/* Live GOST Document 3D Demo Previewer Card */}
        <motion.div
          id="demo-viewer"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="relative max-w-5xl mx-auto perspective-1000"
        >
          {/* Interactive tabs above the document */}
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                spec_gost_7.32_2017_preview.docx
              </span>
            </div>

            {/* Document view switches */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab("title")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeTab === "title" ? "bg-indigo-600 text-white font-medium shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Титульный лист</span>
              </button>
              <button
                onClick={() => setActiveTab("body")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeTab === "body" ? "bg-indigo-600 text-white font-medium shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Глава 1 (ГОСТ)</span>
              </button>
              <button
                onClick={() => setActiveTab("biblio")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeTab === "biblio" ? "bg-indigo-600 text-white font-medium shadow" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Список литературы</span>
              </button>
            </div>
          </div>

          {/* 3D Motion Container for Page */}
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative rounded-2xl bg-slate-900/95 border border-indigo-500/30 p-4 sm:p-8 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl"
          >
            {/* Top Indicator Overlay Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 text-[11px] font-mono">
              <div className="bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Левое поле: 30 мм</span>
              </div>
              <div className="bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Пр/Верх/Низ: 10/20/20 мм</span>
              </div>
              <div className="bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Абзац: 1.25 см (1.5)</span>
              </div>
              <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 px-3 py-1.5 rounded-lg flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ГОСТ Валидация: OK</span>
              </div>
            </div>

            {/* A4 Paper Emulation Container */}
            <div className="relative bg-white text-slate-900 rounded-lg shadow-2xl p-6 sm:p-12 min-h-[460px] font-serif transition-all duration-300 border border-slate-200 overflow-hidden">
              
              {/* Visual Margin Guides (dotted representation for GOST inspection) */}
              <div className="absolute top-[38px] bottom-[38px] left-[56px] right-[24px] border border-dashed border-indigo-300/40 pointer-events-none rounded opacity-60" />
              <div className="absolute top-2 right-4 text-[10px] text-indigo-500 font-mono font-semibold uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                A4 • ГОСТ 7.32-2017
              </div>

              {/* Tab 1: Title Page */}
              {activeTab === "title" && (
                <div className="space-y-4 text-center text-xs sm:text-sm text-slate-800 leading-snug">
                  <div className="uppercase font-bold text-[10px] sm:text-xs text-slate-600 tracking-wider">
                    МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ РОССИЙСКОЙ ФЕДЕРАЦИИ
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900">
                    ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ
                  </div>
                  
                  <div className="py-8">
                    <div className="text-xs uppercase text-slate-500 mb-2 font-sans font-semibold">Курсовая работа</div>
                    <div className="text-base sm:text-xl font-bold text-slate-900 font-sans max-w-lg mx-auto leading-tight">
                      «Разработка и исследование моделей искусственного интеллекта для автоматизации верстки научной документации»
                    </div>
                  </div>

                  <div className="pt-6 text-right max-w-xs ml-auto space-y-1 text-xs text-slate-700">
                    <div><span className="font-semibold">Выполнил:</span> студент гр. ИВТ-401</div>
                    <div>Иванов А. А.</div>
                    <div><span className="font-semibold">Проверил:</span> д.т.н., профессор</div>
                    <div>Петров В. С.</div>
                  </div>

                  <div className="pt-12 text-center text-xs text-slate-600 font-sans">
                    Москва — 2026
                  </div>
                </div>
              )}

              {/* Tab 2: Body Chapter */}
              {activeTab === "body" && (
                <div className="space-y-4 text-xs sm:text-sm text-slate-800 leading-relaxed text-justify">
                  <div className="text-center font-bold text-sm sm:text-base uppercase text-slate-900 tracking-tight font-sans">
                    ГЛАВА 1. ТЕОРЕТИЧЕСКИЕ ОСНОВЫ АВТОМАТИЗАЦИИ ВЕРСТКИ
                  </div>

                  <div className="text-center font-semibold text-xs sm:text-sm text-slate-800 mb-4 font-sans">
                    1.1. Анализ существующих стандартов оформления по ГОСТ 7.32-2017
                  </div>

                  <p className="indent-8">
                    Оформление научно-технических отчетов и курсовых работ строго регламентируется межгосударственным стандартом ГОСТ 7.32-2017<sup className="text-indigo-600 font-bold font-sans ml-0.5">[1]</sup>. Основная проблема классических текстовых процессоров заключается в отсутствии жесткого синтаксического контроля структуры абстрактного синтаксического дерева (AST).
                  </p>

                  <p className="indent-8">
                    В процессе формирования документа ИИ-движок <span className="font-semibold text-indigo-900">AI GostDoc</span> формирует промежуточное представление элементов, устраняя ошибки в нумерации рисунков, таблиц и формул<sup className="text-indigo-600 font-bold font-sans ml-0.5">[2]</sup>.
                  </p>

                  {/* Formula Box Emulation */}
                  <div className="my-3 py-2 px-4 bg-slate-50 border border-slate-200 rounded font-mono text-center text-xs flex justify-between items-center">
                    <span className="flex-1 font-semibold text-slate-900">
                      S_GOST = &Sigma; (Margin_i + LineSpacing &middot; 1.5)
                    </span>
                    <span className="text-slate-500 font-sans text-[11px]">(1.1)</span>
                  </div>

                  <p className="indent-8">
                    Каждая формула центрируется, а её порядковый номер выравнивается по правому краю страницы в соответствии с пунктом 6.8 ГОСТ 7.32.
                  </p>

                  {/* Footnotes line */}
                  <div className="pt-4 border-t border-slate-300 text-[10px] text-slate-600 font-sans space-y-0.5">
                    <div><sup>1</sup> ГОСТ 7.32-2017. Отчет о научно-исследовательской работе. Структура и правила оформления. — М.: Стандартинформ, 2017.</div>
                    <div><sup>2</sup> Сидоров И. В. Методы построения AST-деревьев для генераторов документации // Вестник ИТ. — 2025. — № 4. — С. 12–18.</div>
                  </div>
                </div>
              )}

              {/* Tab 3: Bibliography */}
              {activeTab === "biblio" && (
                <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-normal">
                  <div className="text-center font-bold text-sm sm:text-base uppercase text-slate-900 mb-4 font-sans">
                    СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ
                  </div>

                  <ol className="list-decimal list-inside space-y-2 text-justify pl-2">
                    <li className="indent-4">
                      ГОСТ 7.32-2017. Межгосударственный стандарт. Отчет о научно-исследовательской работе. Структура и правила оформления. — Введ. 2018-07-01. — М.: Стандартинформ, 2017. — 34 с.
                    </li>
                    <li className="indent-4">
                      ГОСТ Р 7.0.100-2018. Библиографическая запись. Библиографическое описание. Общие требования и правила составления. — М.: Стандартинформ, 2018. — 68 с.
                    </li>
                    <li className="indent-4">
                      Алексеев, В. П. Искусственный интеллект и обработка естественного языка в задачах академического письма / В. П. Алексеев, Е. М. Морозов. — СПб.: Наука, 2024. — 256 с.
                    </li>
                    <li className="indent-4">
                      Дмитриев, Н. С. Автоматизация контроля нормоконтроля дипломных проектов: учеб. пособие / Н. С. Дмитриев. — М.: МГТУ им. Н. Э. Баумана, 2025. — 140 с.
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Bottom floating live notification pill */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-slate-300 font-medium">Живой генератор:</span>
                <span className="text-slate-400">Сгенерировано 14 секунд назад в МГТУ им. Баумана</span>
              </div>

              <div className="flex items-center space-x-3 text-indigo-400 font-medium">
                <span className="flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-slate-200">4.97 / 5.00</span>
                </span>
                <span>•</span>
                <span>Более 3,500 отзывов</span>
              </div>
            </div>

          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroSection;
