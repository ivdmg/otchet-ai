import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { GraduationCap, Landmark } from "lucide-react";

interface UniversityItem {
  shortName: string;
  fullName: string;
  city: string;
  badge: string;
}

const UNIVERSITIES: UniversityItem[] = [
  { shortName: "МГУ им. Ломоносова", fullName: "Московский государственный университет", city: "Москва", badge: "Топ-1 РФ" },
  { shortName: "МГТУ им. Баумана", fullName: "Московский государственный технический университет", city: "Москва", badge: "Инженерия" },
  { shortName: "НИУ ВШЭ", fullName: "Высшая школа экономики", city: "Москва / СПб", badge: "Экономика & IT" },
  { shortName: "МФТИ", fullName: "Московский физико-технический институт (Физтех)", city: "Долгопрудный", badge: "Точные науки" },
  { shortName: "СПбГУ", fullName: "Санкт-Петербургский государственный университет", city: "Санкт-Петербург", badge: "Классический" },
  { shortName: "ИТМО", fullName: "Национальный исследовательский университет ИТМО", city: "Санкт-Петербург", badge: "IT & AI" },
  { shortName: "НИЯУ МИФИ", fullName: "Национальный исследовательский ядерный университет", city: "Москва", badge: "Физика & Кибернетика" },
  { shortName: "МГИМО", fullName: "Московский институт международных отношений", city: "Москва", badge: "Международный" },
  { shortName: "РАНХиГС", fullName: "Президентская академия", city: "Москва", badge: "Управление" },
  { shortName: "НГУ", fullName: "Новосибирский государственный университет", city: "Новосибирск", badge: "Академгородок" },
  { shortName: "СПбПУ Петра Великого", fullName: "Санкт-Петербургский политехнический университет", city: "Санкт-Петербург", badge: "Политех" },
  { shortName: "УрФУ", fullName: "Уральский федеральный университет", city: "Екатеринбург", badge: "Урал" },
  { shortName: "КФУ", fullName: "Казанский федеральный университет", city: "Казань", badge: "Поволжье" },
  { shortName: "ТГУ", fullName: "Томский государственный университет", city: "Томск", badge: "Сибирь" },
  { shortName: "РЭУ им. Плеханова", fullName: "Российский экономический университет", city: "Москва", badge: "Финансы" },
];

export const UniversitiesTickerSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Listener with extended trigger window
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Softened, cinematic spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 35,
    damping: 30,
    restDelta: 0.001
  });

  // Significantly reduced and smoothened travel distance for slow, elegant scroll
  const x1 = useTransform(smoothProgress, [0, 1], ["0%", "-8%"]);
  const x2 = useTransform(smoothProgress, [0, 1], ["-8%", "0%"]);

  return (
    <section 
      ref={sectionRef} 
      className="py-20 relative overflow-hidden border-t border-zinc-900 bg-[#09090b]"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-zinc-800/10 blur-[160px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 relative z-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
          Адаптировано под методички ведущих ВУЗов
        </h2>
      </div>

      {/* Ticker Container with Left and Right Fade Gradients */}
      <div className="relative w-full overflow-hidden space-y-4 py-3">
        
        {/* Left & Right Fade Overlay */}
        <div className="absolute top-0 bottom-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-[#09090b] via-[#09090b]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-[#09090b] via-[#09090b]/80 to-transparent z-20 pointer-events-none" />

        {/* Row 1: Leftward moving track */}
        <motion.div 
          style={{ x: x1 }}
          className="flex items-center gap-2.5 w-max will-change-transform py-1.5"
        >
          {[...UNIVERSITIES, ...UNIVERSITIES].map((uni, idx) => (
            <div
              key={`row1-${idx}`}
              className="dark-surface dark-surface-hover rounded-xl px-3.5 py-2.5 border border-zinc-800/80 flex items-center space-x-2.5 shadow-md shrink-0 select-none group transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 group-hover:border-zinc-700 transition-colors shrink-0">
                <Landmark className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-bold text-zinc-100 group-hover:text-white transition-colors">
                    {uni.shortName}
                  </span>
                  <span className="text-[8.5px] font-mono text-zinc-500 bg-zinc-900/90 px-1 py-0.2 rounded border border-zinc-800">
                    {uni.badge}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 truncate max-w-[170px]">
                  {uni.fullName}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Row 2: Rightward moving track */}
        <motion.div 
          style={{ x: x2 }}
          className="flex items-center gap-2.5 w-max will-change-transform py-1.5 pb-2"
        >
          {[...UNIVERSITIES.slice(7), ...UNIVERSITIES.slice(0, 7), ...UNIVERSITIES].map((uni, idx) => (
            <div
              key={`row2-${idx}`}
              className="dark-surface dark-surface-hover rounded-xl px-3.5 py-2.5 border border-zinc-800/80 flex items-center space-x-2.5 shadow-md shrink-0 select-none group transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 group-hover:border-zinc-700 transition-colors shrink-0">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-bold text-zinc-100 group-hover:text-white transition-colors">
                    {uni.shortName}
                  </span>
                  <span className="text-[8.5px] font-mono text-zinc-500 bg-zinc-900/90 px-1 py-0.2 rounded border border-zinc-800">
                    {uni.city}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 truncate max-w-[170px]">
                  {uni.fullName}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default UniversitiesTickerSection;
