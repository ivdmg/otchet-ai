import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, 
  Sparkles, 
  Check, 
  Zap, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Layers,
  Coins,
  Flame,
  Award
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface PricingCalculatorSectionProps {
  onSelectPlan?: (planId: string) => void;
  onStartGenerator?: () => void;
}

type WorkType = "referat" | "coursework" | "vkr" | "article";

interface WorkTypeConfig {
  id: WorkType;
  title: string;
  defaultPages: number;
  minPages: number;
  maxPages: number;
  pricePerPage: number; // in rubles per page
  baseCredits: number;
  icon: React.ReactNode;
  description: string;
}

const WORK_TYPES: WorkTypeConfig[] = [
  {
    id: "referat",
    title: "Реферат",
    defaultPages: 15,
    minPages: 10,
    maxPages: 25,
    pricePerPage: 9,
    baseCredits: 1,
    icon: <FileText className="w-5 h-5 text-indigo-400" />,
    description: "Введение, 2 главы, вывод и 10+ источников по ГОСТ"
  },
  {
    id: "coursework",
    title: "Курсовая работа",
    defaultPages: 30,
    minPages: 20,
    maxPages: 45,
    pricePerPage: 11,
    baseCredits: 2,
    icon: <BookOpen className="w-5 h-5 text-violet-400" />,
    description: "Теория + Практика, расчетная часть, рисунки и таблицы"
  },
  {
    id: "vkr",
    title: "ВКР / Диплом",
    defaultPages: 65,
    minPages: 50,
    maxPages: 90,
    pricePerPage: 13,
    baseCredits: 5,
    icon: <GraduationCap className="w-5 h-5 text-amber-400" />,
    description: "Полная структура 3-х глав, 35+ источников ВАК, доклады"
  },
  {
    id: "article",
    title: "Научная статья",
    defaultPages: 12,
    minPages: 6,
    maxPages: 20,
    pricePerPage: 15,
    baseCredits: 1,
    icon: <Award className="w-5 h-5 text-emerald-400" />,
    description: "Форматирование под требования РИНЦ / ВАК"
  }
];

export const PricingCalculatorSection: React.FC<PricingCalculatorSectionProps> = ({
  onSelectPlan,
  onStartGenerator
}) => {
  const [selectedType, setSelectedType] = useState<WorkType>("coursework");
  const currentConfig = WORK_TYPES.find((w) => w.id === selectedType) || WORK_TYPES[1];
  
  const [pagesCount, setPagesCount] = useState<number>(currentConfig.defaultPages);

  // Handle work type change & update pages to default for that work type
  const handleTypeChange = (typeId: WorkType) => {
    setSelectedType(typeId);
    const cfg = WORK_TYPES.find((w) => w.id === typeId);
    if (cfg) {
      setPagesCount(cfg.defaultPages);
    }
  };

  // Calculations
  const calculatedCredits = useMemo(() => {
    const ratio = pagesCount / currentConfig.defaultPages;
    return Math.max(1, Math.round(currentConfig.baseCredits * ratio));
  }, [pagesCount, currentConfig]);

  const calculatedPrice = useMemo(() => {
    const rawPrice = pagesCount * currentConfig.pricePerPage;
    // Round to clean ending
    return Math.round(rawPrice / 10) * 10;
  }, [pagesCount, currentConfig]);

  const estimatedTime = useMemo(() => {
    if (pagesCount <= 20) return "~1.5 мин";
    if (pagesCount <= 45) return "~2.5 мин";
    return "~4.0 мин";
  }, [pagesCount]);

  const estimatedSources = useMemo(() => {
    return Math.max(10, Math.round(pagesCount * 0.8));
  }, [pagesCount]);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-br from-indigo-600/15 via-violet-600/10 to-amber-600/10 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border border-amber-500/30 text-xs font-semibold text-amber-300">
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>Прозрачный калькулятор стоимости</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-outfit">
            Рассчитайте стоимость вашей работы в <span className="gradient-heading">1 клик</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Никаких скрытых платежей. Оплата только за сгенерированные кредиты. Точечная перегенерация разделов бесплатна.
          </p>
        </div>

        {/* CALCULATOR MAIN WIDGET GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-20">
          
          {/* Left Column: Controls (Work Type + Slider) - 7 cols */}
          <GlassCard variant="indigo" glow className="lg:col-span-7 p-6 sm:p-8 space-y-8">
            
            {/* Step 1: Work Type Selector */}
            <div className="space-y-4">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 block">
                1. Выберите тип работы:
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WORK_TYPES.map((type) => {
                  const isActive = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleTypeChange(type.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isActive
                          ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {type.icon}
                        {isActive && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <span className="font-bold text-xs sm:text-sm">{type.title}</span>
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-slate-400 bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                💡 <span className="text-slate-300 font-medium">{currentConfig.title}:</span> {currentConfig.description}
              </p>
            </div>

            {/* Step 2: Page Slider */}
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  2. Укажите количество страниц:
                </label>
                <div className="flex items-center space-x-1.5 bg-indigo-950/80 px-3 py-1 rounded-lg border border-indigo-500/30">
                  <span className="text-xl font-extrabold text-white font-outfit">{pagesCount}</span>
                  <span className="text-xs text-indigo-300">стр.</span>
                </div>
              </div>

              {/* Slider Component */}
              <div className="space-y-2">
                <input
                  type="range"
                  min={currentConfig.minPages}
                  max={currentConfig.maxPages}
                  step={1}
                  value={pagesCount}
                  onChange={(e) => setPagesCount(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />

                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>{currentConfig.minPages} стр. (Мин.)</span>
                  <span>{Math.round((currentConfig.minPages + currentConfig.maxPages) / 2)} стр.</span>
                  <span>{currentConfig.maxPages} стр. (Макс.)</span>
                </div>
              </div>
            </div>

            {/* Micro Feature Highlights */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Время генерации: <strong className="text-white">{estimatedTime}</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Источников ГОСТ: <strong className="text-white">{estimatedSources}+ шт.</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Нормоконтроль: <strong className="text-white">100% Валидация</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Zap className="w-4 h-4 text-violet-400 shrink-0" />
                <span>Spot Regeneration: <strong className="text-white">Бесплатно</strong></span>
              </div>
            </div>

          </GlassCard>

          {/* Right Column: Calculated Total Card - 5 cols */}
          <GlassCard variant="indigo" glow className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between border border-indigo-500/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-indigo-500 to-violet-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Выгода до -40%
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-300 block mb-1">
                  Итоговый расчёт
                </span>
                <h3 className="text-2xl font-bold text-white font-outfit">
                  {currentConfig.title} ({pagesCount} стр.)
                </h3>
              </div>

              {/* Price & Credits Counter Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/80 to-slate-950 border border-indigo-500/30 space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-400">Стоимость списания:</span>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white font-outfit">
                      {calculatedPrice} ₽
                    </span>
                    <span className="text-xs text-slate-500 line-through block font-mono">
                      ~{Math.round(calculatedPrice * 1.55)} ₽ у авторов
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-slate-300 flex items-center space-x-1.5">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>Потребуется кредитов:</span>
                  </span>
                  <span className="font-extrabold text-amber-400 text-sm font-mono">
                    {calculatedCredits} {calculatedCredits === 1 ? "кредит" : calculatedCredits < 5 ? "кредита" : "кредитов"}
                  </span>
                </div>
              </div>

              {/* Benefits Bullet Points */}
              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Мгновенный экспорт в чистовой <strong>.DOCX</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Готовый титульный лист под Ваш ВУЗ</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Автоматический список источников ГОСТ 2018</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Проход оригинальности в Антиплагиат.ВУЗ</span>
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onStartGenerator}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer glow-effect-indigo"
              >
                <span>Сгенерировать работу за {calculatedPrice} ₽</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>

          </GlassCard>

        </div>

        {/* READY PACKAGES / TARIFF CARDS GRID */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
              Пакеты кредитов
            </h3>
            <p className="text-sm text-slate-400">
              Покупайте кредиты оптом и экономьте на генерациях нескольких работ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tariff 1: Start */}
            <GlassCard variant="indigo" glow className="p-6 flex flex-col justify-between border border-slate-800">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider font-semibold">Старт</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">1 работа</span>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-white font-outfit">199 ₽</div>
                  <div className="text-xs text-slate-400 mt-0.5">1 Кредит (до 20 стр.)</div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>1 Реферат или Доклад</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ГОСТ 7.32-2017 валидатор</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Скачивание в DOCX</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onSelectPlan?.("start")}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Купить 1 Кредит
                </button>
              </div>
            </GlassCard>

            {/* Tariff 2: Student (POPULAR) */}
            <GlassCard variant="indigo" glow className="p-6 flex flex-col justify-between border-2 border-indigo-500 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center space-x-1">
                <Flame className="w-3 h-3 text-amber-300" />
                <span>Хит продаж</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-indigo-300 uppercase tracking-wider font-bold">Студент</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 font-mono border border-indigo-500/30">Экономия 30%</span>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-white font-outfit">490 ₽</div>
                  <div className="text-xs text-indigo-300 mt-0.5">3 Кредита (163 ₽ / кредит)</div>
                </div>

                <div className="space-y-2 text-xs text-slate-200 pt-3 border-t border-indigo-500/30">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Хватит на 1 Курсовую + 1 Реферат</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Бесконечная Spot Regeneration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Приоритетная генерация</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onSelectPlan?.("student")}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
                >
                  Купить 3 Кредита
                </button>
              </div>
            </GlassCard>

            {/* Tariff 3: Pro */}
            <GlassCard variant="indigo" glow className="p-6 flex flex-col justify-between border border-slate-800">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">ВКР / Сессия Pro</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/80 text-amber-300 font-mono border border-amber-500/30">Макс. Выгода</span>
                </div>

                <div>
                  <div className="text-3xl font-extrabold text-white font-outfit">1 390 ₽</div>
                  <div className="text-xs text-slate-400 mt-0.5">10 Кредитов (139 ₽ / кредит)</div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Хватит на полную ВКР (70+ стр.)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Все 10 работ или диплом под ключ</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Поддержка 24/7 по ГОСТу</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => onSelectPlan?.("pro")}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Купить 10 Кредитов
                </button>
              </div>
            </GlassCard>

          </div>
        </div>

      </div>
    </section>
  );
};

export default PricingCalculatorSection;
