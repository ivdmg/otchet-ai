import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Star, 
  Award, 
  CheckCircle2, 
  GraduationCap, 
  FileCheck, 
  ThumbsUp, 
  Sparkles, 
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface Testimonial {
  id: string;
  name: string;
  avatarBg: string;
  university: string;
  workType: string;
  pages: number;
  score: string;
  rating: number;
  date: string;
  text: string;
  antiplagiatScore: number;
}

const UNIVERSITIES = [
  "МГУ им. Ломоносова",
  "МГТУ им. Баумана",
  "НИУ ВШЭ",
  "СПбГУ",
  "МФТИ",
  "УрФУ",
  "КФУ",
  "ИТМО",
  "РАНХиГС",
  "РЭУ им. Плеханова"
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Александр В.",
    avatarBg: "bg-indigo-600",
    university: "МГТУ им. Баумана",
    workType: "ВКР (Информатика)",
    pages: 72,
    score: "Оценка: Отлично (5)",
    rating: 5,
    date: "Вчера, 18:40",
    text: "Нейросеть сгенерировала полноценный диплом с графом зависимостей и ГОСТ таблицами. Самое главное — нормоконтролер в Бауманке принял файл .docx с первого раза без единой правки по полям 30/10/20!",
    antiplagiatScore: 96.8
  },
  {
    id: "2",
    name: "Екатерина С.",
    avatarBg: "bg-violet-600",
    university: "НИУ ВШЭ",
    workType: "Курсовая по экономике",
    pages: 34,
    score: "Оценка: 10 / 10",
    rating: 5,
    date: "3 дня назад",
    text: "ChatGPT до этого выдавал какой-то заезженный текст и сноски на несуществующие статьи. AI GostDoc вставил реальные источники ВАК 2024-2025 годов и прошел Антиплагиат.ВУЗ на 94%!",
    antiplagiatScore: 94.2
  },
  {
    id: "3",
    name: "Дмитрий К.",
    avatarBg: "bg-emerald-600",
    university: "МГУ им. Ломоносова",
    workType: "Магистерская диссертация",
    pages: 82,
    score: "Защита на 5",
    rating: 5,
    date: "5 дней назад",
    text: "Оценил функцию Spot Regeneration. Мне нужно было переделать только 2-й параграф 3-й главы без изменения остальных 80 страниц. Сработало за 40 секунд!",
    antiplagiatScore: 97.5
  },
  {
    id: "4",
    name: "Мария П.",
    avatarBg: "bg-rose-600",
    university: "СПбГУ",
    workType: "Курсовая по юриспруденции",
    pages: 28,
    score: "Оценка: Отлично",
    rating: 5,
    date: "Неделю назад",
    text: "Обычно оформление списка литературы по ГОСТ 2018 занимает полдня. Движок сам расставил все тире, точки и библиографические записи с точностью до символа.",
    antiplagiatScore: 95.1
  }
];

export const SocialProofSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "vkr" | "coursework">("all");
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState<number>(0);

  const filteredTestimonials = TESTIMONIALS.filter((t) => {
    if (activeTab === "vkr") return t.workType.includes("ВКР") || t.workType.includes("диссертация");
    if (activeTab === "coursework") return t.workType.includes("Курсовая");
    return true;
  });

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Социальное доказательство & Отзывы</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-outfit">
            Принимается в <span className="gradient-heading">ведущих ВУЗах</span> и проходит Антиплагиат
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Тысячи студентов уже сдали свои работы на «Отлично» без рутинной переверстки в Word и нервов перед нормоконтролем.
          </p>
        </div>

        {/* TOP UNIVERSITIES TICKER / BADGES */}
        <div className="mb-20 space-y-4 text-center">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Успешные защиты студентов из 120+ ВУЗов России и СНГ
          </span>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-5xl mx-auto pt-2">
            {UNIVERSITIES.map((uni, i) => (
              <motion.div
                key={uni}
                whileHover={{ scale: 1.05, translateY: -2 }}
                className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs sm:text-sm font-medium flex items-center space-x-2 shadow-sm backdrop-blur-md"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>{uni}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ANTIPLAGIAT VERIFICATION REPORT PROOF CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20">
          
          {/* Left Description - 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-500/30">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Официальные протоколы проверок</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit leading-tight">
              Гарантия прохода в системы «Антиплагиат.ВУЗ»
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              AI GostDoc не генерирует заезженные речевые штампы. Благодаря глубокой контекстной модели генерация дает от 85% до 98% оригинального авторского текста.
            </p>

            <div className="space-y-3 text-xs text-slate-200">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Отсутствие технических обходов и синонимизайзеров</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Корректные цитирования ВАК со сносками ГОСТ</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Проверка перед скачиванием чистового файла .DOCX</span>
              </div>
            </div>
          </div>

          {/* Right Interactive Antiplagiat Card - 7 cols */}
          <GlassCard variant="indigo" glow className="lg:col-span-7 p-6 sm:p-8 border border-emerald-500/30 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Протокол проверки № AP-2026-8941</h4>
                  <p className="text-xs text-slate-400">Система: «Антиплагиат.ВУЗ» (Полный пакет)</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                ПРОВЕРЕНО
              </span>
            </div>

            {/* Score Stats Progress Bar */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Итоговая уникальность:</span>
                <span className="text-3xl font-extrabold text-emerald-400 font-outfit">
                  96.8%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
                <div className="bg-emerald-500 h-full rounded-full w-[96.8%]" />
                <div className="bg-amber-500 h-full rounded-full w-[2.2%]" />
                <div className="bg-slate-600 h-full rounded-full w-[1.0%]" />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div className="bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20">
                  <div className="font-bold text-emerald-400 font-mono">96.8%</div>
                  <div className="text-[10px] text-slate-400">Оригинальность</div>
                </div>
                <div className="bg-amber-950/40 p-2 rounded-lg border border-amber-500/20">
                  <div className="font-bold text-amber-400 font-mono">2.2%</div>
                  <div className="text-[10px] text-slate-400">Цитирование (ГОСТ)</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <div className="font-bold text-slate-400 font-mono">1.0%</div>
                  <div className="text-[10px] text-slate-400">Заимствования</div>
                </div>
              </div>
            </div>

            {/* Micro verification badge */}
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Статус: <strong>Допущено к защите в МГТУ / МГУ</strong></span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">10.08.2026</span>
            </div>
          </GlassCard>

        </div>

        {/* STUDENT TESTIMONIALS CAROUSEL / CARDS GRID */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit">
                Отзывы реальных студентов
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                ⭐ <strong className="text-white">4.97 / 5.0</strong> на основе 3 840+ проверенных работ
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => { setActiveTab("all"); setCurrentTestimonialIndex(0); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "all" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Все отзывы
              </button>
              <button
                onClick={() => { setActiveTab("vkr"); setCurrentTestimonialIndex(0); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "vkr" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                ВКР и Дипломы
              </button>
              <button
                onClick={() => { setActiveTab("coursework"); setCurrentTestimonialIndex(0); }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === "coursework" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Курсовые
              </button>
            </div>
          </div>

          {/* Testimonials Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTestimonials.map((item) => (
              <GlassCard key={item.id} variant="indigo" glow className="p-6 flex flex-col justify-between space-y-4 border border-slate-800">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${item.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-md`}>
                        {item.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.name}</h4>
                        <p className="text-xs text-slate-400">{item.university}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                    «{item.text}»
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/20 font-medium">
                      {item.workType}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-emerald-400 font-semibold">{item.antiplagiatScore}% Уникальность</span>
                  </div>

                  <span className="text-slate-500 text-[11px]">{item.date}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default SocialProofSection;
