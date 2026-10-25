import React, { useState } from "react";
import { Check, X, ArrowRight, FileText, BookOpen, GraduationCap, ChevronDown } from "lucide-react";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingTier {
  id: "abstract" | "coursework" | "vkr";
  name: string;
  badge?: string;
  isFeatured?: boolean;
  price: string;
  oldPrice?: string;
  pagesLimit: string;
  description: string;
  features: PlanFeature[];
  icon: React.ReactNode;
}

interface PricingCardsSectionProps {
  onSelectPlan?: (planId: string) => void;
  onStartGenerator?: () => void;
}

const TIERS: PricingTier[] = [
  {
    id: "abstract",
    name: "Реферат / Эссе",
    price: "199 ₽",
    oldPrice: "390 ₽",
    pagesLimit: "До 15 страниц",
    description: "Для текущих студенческих заданий, докладов и эссе с базовым нормоконтролем.",
    isFeatured: false,
    icon: <FileText className="w-4 h-4 text-zinc-400" />,
    features: [
      { text: "Объем работы: до 15 страниц", included: true },
      { text: "Титульный лист по методичке ВУЗа", included: true },
      { text: "Верстка по стандарту ГОСТ 7.32", included: true },
      { text: "Список литературы (от 8 источников)", included: true },
      { text: "Чистовой экспорт в .docx и PDF", included: true },
      { text: "Вставка нативных формул и таблиц", included: true },
      { text: "Гарантия прохода в Антиплагиат.ВУЗ (80-95%)", included: true },
      { text: "Точечная перегенерация параграфов", included: false },
    ]
  },
  {
    id: "coursework",
    name: "Курсовая работа",
    badge: "ХИТ ПРОДАЖ",
    isFeatured: true,
    price: "490 ₽",
    oldPrice: "990 ₽",
    pagesLimit: "До 40 страниц",
    description: "Теоретическая и расчетная части, формулы, таблицы, рисунки и библиография.",
    icon: <BookOpen className="w-4 h-4 text-zinc-100" />,
    features: [
      { text: "Объем работы: до 40 страниц", included: true },
      { text: "Титульный лист по методичке ВУЗа", included: true },
      { text: "Верстка по стандарту ГОСТ 7.32", included: true },
      { text: "Библиография по ГОСТ (20+ источников)", included: true },
      { text: "Чистовой экспорт в .docx и PDF", included: true },
      { text: "Вставка нативных формул и таблиц", included: true },
      { text: "Гарантия прохода в Антиплагиат.ВУЗ (85-98%)", included: true },
      { text: "Точечная перегенерация параграфов", included: true },
    ]
  },
  {
    id: "vkr",
    name: "Дипломный проект / ВКР",
    badge: "МАКС. ГЛУБИНА",
    price: "1 990 ₽",
    oldPrice: "2 990 ₽",
    pagesLimit: "До 80 страниц",
    description: "Комплексное выпускное исследование: 3 главы, глубокий анализ источников и доклад.",
    isFeatured: false,
    icon: <GraduationCap className="w-4 h-4 text-zinc-400" />,
    features: [
      { text: "Объем работы: до 80 страниц", included: true },
      { text: "Титульный лист по методичке ВУЗа", included: true },
      { text: "Верстка по стандарту ГОСТ 7.32", included: true },
      { text: "Расширенный список ВАК (45+ источников)", included: true },
      { text: "Чистовой экспорт в .docx и PDF", included: true },
      { text: "Вставка нативных формул и таблиц", included: true },
      { text: "Гарантия прохода в Антиплагиат.ВУЗ (85-98%)", included: true },
      { text: "Точечная перегенерация параграфов", included: true },
    ]
  }
];

export const PricingCardsSection: React.FC<PricingCardsSectionProps> = ({
  onSelectPlan,
  onStartGenerator
}) => {
  const [expandedMobileTiers, setExpandedMobileTiers] = useState<Record<string, boolean>>({});

  const toggleMobileTier = (id: string) => {
    setExpandedMobileTiers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="pricing" className="py-20 sm:py-24 relative overflow-hidden border-t border-zinc-900">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-zinc-800/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
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
            const isMobileExpanded = !!expandedMobileTiers[tier.id];

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

                <div className="space-y-5 sm:space-y-6">
                  
                  {/* Header: Title */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                        {tier.icon}
                      </div>
                      <h3 className="text-base font-bold text-zinc-100">{tier.name}</h3>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                      {tier.description}
                    </p>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline space-x-2 shrink-0">
                      <span className="font-mono text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight whitespace-nowrap">
                        {tier.price}
                      </span>
                      {tier.oldPrice && (
                        <span className="text-xs text-zinc-600 line-through font-mono whitespace-nowrap">
                          {tier.oldPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 shrink-0">
                      {tier.pagesLimit}
                    </span>
                  </div>

                  {/* DESKTOP FEATURES LIST (Always Visible) */}
                  <div className="hidden md:block space-y-2.5 pt-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                      Что включено:
                    </div>
                    {tier.features.map((feature, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start space-x-2.5 text-xs ${
                          feature.included 
                            ? "text-zinc-200" 
                            : "text-zinc-600"
                        }`}
                      >
                        {feature.included ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                        )}
                        <span>{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* MOBILE FEATURES ACCORDION */}
                  <div className="md:hidden border-t border-zinc-800/80 pt-3">
                    <button
                      type="button"
                      onClick={() => toggleMobileTier(tier.id)}
                      className="w-full flex items-center justify-between text-xs font-mono text-zinc-400 hover:text-zinc-200 py-1 cursor-pointer"
                    >
                      <span>Что включено ({tier.features.filter(f => f.included).length} пунктов)</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobileExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {isMobileExpanded && (
                      <div className="space-y-2 pt-3">
                        {tier.features.map((feature, idx) => (
                          <div 
                            key={`mob-${idx}`} 
                            className={`flex items-start space-x-2.5 text-xs ${
                              feature.included 
                                ? "text-zinc-200" 
                                : "text-zinc-600"
                            }`}
                          >
                            {feature.included ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                            )}
                            <span>{feature.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Card CTA Button */}
                <div className="pt-6 sm:pt-8">
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
                        ? "bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm"
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span>Начать генерацию</span>
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
