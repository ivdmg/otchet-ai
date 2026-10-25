import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { 
  FileEdit, 
  CheckSquare, 
  DownloadCloud 
} from "lucide-react";

interface StepItem {
  id: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
  align: "left" | "right";
}

const STEPS: StepItem[] = [
  {
    id: 0,
    title: "Введи название и выбери объем",
    desc: "Просто укажи тему своей работы, предмет и нужный объем страниц (от 15 до 80). Можно прикрепить методичку твоего университета для автоматического учета всех требований к оформлению.",
    icon: <FileEdit className="w-5 h-5 text-indigo-400" />,
    align: "left"
  },
  {
    id: 1,
    title: "Утверди план работы",
    desc: "Система моментально сформирует академический план с логичным разделением на главы и параграфы. Названия можно легко скорректировать в один клик или перегенерировать структуру.",
    icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
    align: "right"
  },
  {
    id: 2,
    title: "Получи готовую работу",
    desc: "Скачивай чистовой документ в Word (.docx) или PDF со всеми отступами 30/10/20/20 мм, формулами, таблицами и списком актуальной литературы с гарантией прохода нормоконтроля.",
    icon: <DownloadCloud className="w-5 h-5 text-blue-400" />,
    align: "left"
  }
];

export const PipelineSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 25,
    restDelta: 0.001
  });

  const beamHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section 
      ref={containerRef}
      id="how-it-works" 
      className="py-20 sm:py-32 relative overflow-hidden border-t border-white/[0.08]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-24">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Как устроен процесс
          </h2>
        </div>

        {/* DESKTOP TIMELINE (Centered Rail) */}
        <div className="hidden md:block relative py-4">
          
          {/* Central Vertical Background Rail */}
          <div className="absolute left-1/2 top-6 bottom-6 -translate-x-1/2 w-[2px] bg-zinc-800 rounded-full z-0" />
          
          {/* Central Glowing Animated Beam on Scroll */}
          <motion.div 
            style={{ height: beamHeight }}
            className="absolute left-1/2 top-6 -translate-x-1/2 w-[2px] bg-gradient-to-b from-indigo-500 via-white to-emerald-400 rounded-full z-0 shadow-glow-silver origin-top"
          />

          {/* Steps Grid */}
          <div className="space-y-20 relative z-10">
            {STEPS.map((step) => {
              const isLeft = step.align === "left";

              return (
                <div 
                  key={step.id}
                  className="grid grid-cols-[1fr_80px_1fr] items-center group"
                >
                  {/* Left Column */}
                  {isLeft ? (
                    <div className="text-left pr-8">
                      <div className="rounded-2xl p-6 sm:p-7 border border-white/[0.08] bg-[#0c0c10]/80 shadow-xl transition-all duration-300 hover:border-white/20">
                        <h3 className="text-sm sm:text-base font-bold text-white text-left mb-2 group-hover:text-zinc-200 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-zinc-400 text-justify leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}

                  {/* Center Column: Icon Node */}
                  <div className="flex items-center justify-center relative">
                    <div className="w-14 h-14 rounded-2xl bg-[#121216] border border-white/[0.1] group-hover:border-white/40 transition-all duration-300 flex items-center justify-center text-zinc-300 shadow-xl z-10 group-hover:scale-105">
                      {step.icon}
                    </div>
                  </div>

                  {/* Right Column */}
                  {!isLeft ? (
                    <div className="text-left pl-8">
                      <div className="rounded-2xl p-6 sm:p-7 border border-white/[0.08] bg-[#0c0c10]/80 shadow-xl transition-all duration-300 hover:border-white/20">
                        <h3 className="text-sm sm:text-base font-bold text-white text-left mb-2 group-hover:text-zinc-200 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-zinc-400 text-justify leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* MOBILE TIMELINE (Smooth Continuous Left Vertical Rail) */}
        <div className="md:hidden relative pl-7 sm:pl-9 py-2">
          {/* Vertical continuous line */}
          <div className="absolute left-3 top-4 bottom-4 w-[2px] bg-zinc-800 rounded-full z-0" />
          
          <motion.div 
            style={{ height: beamHeight }}
            className="absolute left-3 top-4 w-[2px] bg-gradient-to-b from-indigo-500 via-white to-emerald-400 rounded-full z-0 origin-top"
          />

          <div className="space-y-6 relative z-10">
            {STEPS.map((step) => (
              <div key={`mobile-${step.id}`} className="relative group">
                {/* Timeline Node Dot */}
                <div className="absolute -left-[23px] top-6 w-3 h-3 rounded-full bg-zinc-900 border-2 border-indigo-400 shadow-sm z-10" />

                {/* Card with embedded icon */}
                <div className="rounded-2xl p-5 border border-white/[0.08] bg-[#0c0c10]/90 shadow-lg space-y-2.5">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#121216] border border-white/[0.1] flex items-center justify-center shrink-0">
                      {step.icon}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white text-left leading-snug">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-[11px] text-zinc-400 text-justify leading-relaxed pt-0.5">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default PipelineSection;
