import React from "react";
import { Check, ArrowRight, Sparkles, FileText, BookOpen, GraduationCap, ShieldCheck } from "lucide-react";

interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  isFeatured?: boolean;
  price: string;
  period: string;
  creditsLabel: string;
  pagesLimit: string;
  description: string;
  features: string[];
  ctaLabel: string;
  icon: React.ReactNode;
}

interface PricingCardsSectionProps {
  onSelectPlan?: (planId: string) => void;
  onStartGenerator?: () => void;
}

const TIERS: PricingTier[] = [
  {
    id: "referat",
    name: "Реферат / Эссе",
    price: "199 ₽",
    period: "за 1 документ",
    creditsLabel: "[ 1 КРЕДИТ ]",
    pagesLimit: "До 15 страниц",
    description: "Идеально для текущих студенческих заданий, докладов и эссе с базовой проверкой стандартов.",
    isFeatured: false,
    ctaLabel: "Выбрать тариф",
    icon: <FileText className="w-4 h-4 text-zinc-400" />,
    features: [
      "Объем работы: до 15 страниц",
      "Готовый титульный лист под ВУЗ",
      "Список источников (от 8 штук)",
      "Базовая проверка ГОСТ 7.32-2017",
      "Мгновенный экспорт в .docx"
    ]
  },
  {
    id: "coursework",
    name: "Курсовая работа",
    badge: "ХИТ ПРОДАЖ",
    isFeatured: true,
    price: "490 ₽",
    period: "за 1-2 работы",
    creditsLabel: "[ 3 КРЕДИТА ]",
    pagesLimit: "До 40 страниц",
    description: "Самый популярный тариф: расчетно-графическая часть, таблицы, рисунки и библиография.",
    ctaLabel: "Сгенерировать курсовую",
    icon: <BookOpen className="w-4 h-4 text-zinc-100" />,
    features: [
      "Объем работы: до 40 страниц",
      "Теоретическая + Расчетная часть",
      "Вставка нативных таблиц и формул",
      "Библиография по ГОСТ 7.0.5 (20+ источников)",
      "Неограниченная точечная перегенерация",
      "Проход в Антиплагиат.ВУЗ (85-98%)",
      "Экспорт чистового файла .docx"
    ]
  },
  {
    id: "vkr",
    name: "Дипломный проект / ВКР",
    badge: "МАКС. ГЛУБИНА",
    price: "1 390 ₽",
    period: "полный пакет",
    creditsLabel: "[ 10 КРЕДИТОВ ]",
    pagesLimit: "До 80 страниц",
    description: "Комплексное выпускное исследование: 3 главы, приложения, расширенный поиск свежих источников ВАК.",
    isFeatured: false,
    ctaLabel: "Выбрать ВКР пакет",
    icon: <GraduationCap className="w-4 h-4 text-zinc-400" />,
    features: [
      "Объем работы: до 80 страниц",
      "Комплексная структура (3 главы + приложения)",
      "Глубокий поиск источников ВАК (до 5 лет)",
      "Графики, аналитические матрицы и расчеты",
      "Приоритетная компиляция документа",
      "Автогенерация доклада к защите",
      "Поддержка нормоконтроля 24/7"
    ]
  }
];

export const PricingCardsSection: React.FC<PricingCardsSectionProps> = ({
  onSelectPlan,
  onStartGenerator
}) => {
  return (
    <section id="pricing" className="py-24 relative overflow-hidden border-t border-zinc-900">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-zinc-800/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span>[ ПРОЗРАЧНЫЕ ТАРИФЫ ]</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Честная стоимость без скрытых подписок
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Оплата только за сгенерированные документы. Точечные правки и корректировка структуры бесплатны.
          </p>
        </div>

        {/* 3-Column Minimalist Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {TIERS.map((tier) => {
            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative transition-all duration-300 ${
                  tier.isFeatured
                    ? "bg-[#141417] border-2 border-zinc-400/80 shadow-2xl shadow-black/60 scale-[1.02] z-10 ring-1 ring-white/10"
                    : "dark-surface dark-surface-hover border border-zinc-800"
                }`}
              >
                {/* Featured Badge */}
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-100 text-zinc-950 text-[10px] font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-6">
                  
                  {/* Header: Title & Monospace Badge */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                          {tier.icon}
                        </div>
                        <h3 className="text-base font-bold text-zinc-100">{tier.name}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800">
                        {tier.creditsLabel}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                      {tier.description}
                    </p>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-baseline justify-between">
                    <div>
                      <span className="font-mono text-3xl font-extrabold text-zinc-100 tracking-tight">
                        {tier.price}
                      </span>
                      <span className="text-xs text-zinc-500 ml-2 font-mono">
                        {tier.period}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                      {tier.pagesLimit}
                    </span>
                  </div>

                  {/* Features Bullet List */}
                  <div className="space-y-2.5 pt-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                      Что включено:
                    </div>
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 text-xs text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Card CTA Button */}
                <div className="pt-8">
                  <button
                    onClick={() => {
                      if (onSelectPlan) {
                        onSelectPlan(tier.id);
                      } else if (onStartGenerator) {
                        onStartGenerator();
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95 ${
                      tier.isFeatured
                        ? "bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm hover:shadow-glow-cold"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span>{tier.ctaLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PricingCardsSection;
