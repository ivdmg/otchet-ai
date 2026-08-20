import React, { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { 
  UploadCloud, 
  Layers, 
  FileDown 
} from "lucide-react";

interface StepItem {
  id: number;
  number: string;
  title: string;
  desc: string;
  tag: string;
  icon: React.ReactNode;
  align: "left" | "right";
}

const STEPS: StepItem[] = [
  {
    id: 0,
    number: "01",
    title: "Ввод требований",
    desc: "Тема или файл методички ВУЗа. ИИ моментально считывает формат и правила оформления.",
    tag: "PDF / DOCX / Тема",
    icon: <UploadCloud className="w-5 h-5" />,
    align: "left"
  },
  {
    id: 1,
    number: "02",
    title: "Архитектура AST",
    desc: "Сбалансированное оглавление глав и параграфов с быстрой корректировкой в один клик.",
    tag: "Интерактивный план",
    icon: <Layers className="w-5 h-5" />,
    align: "right"
  },
  {
    id: 2,
    number: "03",
    title: "Чистовой .DOCX",
    desc: "Детерминированная сборка в Word с идеальными полями, формулами и списком источников.",
    tag: "ГОСТ 7.32-2017",
    icon: <FileDown className="w-5 h-5" />,
    align: "left"
  }
];

export const PipelineSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress Listener across the vertical timeline
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 65%", "end 45%"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001
  });

  const beamHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section 
      ref={containerRef}
      id="how-it-works" 
      className="py-32 sm:py-40 relative overflow-hidden border-t border-zinc-900"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[600px] bg-zinc-800/10 blur-[200px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-24 sm:mb-32">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight">
            Как устроен процесс
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-lg mx-auto">
            От темы до готового документа за 3 минуты
          </p>
        </div>

        {/* Wide Vertical Zig-Zag Timeline with Strictly Centered Rail */}
        <div className="relative py-8">
          
          {/* Central Vertical Background Rail */}
          <div className="hidden md:block absolute left-1/2 top-6 bottom-6 -translate-x-1/2 w-[2px] bg-zinc-800/90 rounded-full z-0" />
          
          {/* Central Glowing Animated Beam on Scroll */}
          <motion.div 
            style={{ height: beamHeight }}
            className="hidden md:block absolute left-1/2 top-6 -translate-x-1/2 w-[2px] bg-gradient-to-b from-zinc-500 via-zinc-200 to-white rounded-full z-0 shadow-glow-silver origin-top"
          />

          {/* Steps 3-Column Grid Container (Left | Center 80px | Right) */}
          <div className="space-y-20 md:space-y-32 relative z-10">
            {STEPS.map((step) => {
              const isLeft = step.align === "left";

              return (
                <div 
                  key={step.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_80px_1fr] items-center gap-6 md:gap-0 group"
                >
                  
                  {/* Left Column */}
                  {isLeft ? (
                    <div className="md:text-right md:pr-8">
                      <div className="dark-surface dark-surface-hover rounded-2xl p-6 sm:p-7 border border-zinc-800/90 shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2.5 md:justify-end">
                          <span className="font-mono text-xs font-bold text-zinc-400">
                            {step.number}.
                          </span>
                          <h3 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors">
                            {step.title}
                          </h3>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            {step.tag}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block" />
                  )}

                  {/* Center Column: Icon Node (Strictly Locked to Central Rail) */}
                  <div className="flex items-center justify-center relative">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#141417] border border-zinc-800 group-hover:border-zinc-400 transition-all duration-300 flex items-center justify-center text-zinc-300 group-hover:text-white shadow-xl shadow-black/80 z-10 group-hover:shadow-glow-silver group-hover:scale-105">
                      {step.icon}
                    </div>
                  </div>

                  {/* Right Column */}
                  {!isLeft ? (
                    <div className="md:text-left md:pl-8">
                      <div className="dark-surface dark-surface-hover rounded-2xl p-6 sm:p-7 border border-zinc-800/90 shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-2 mb-2.5 md:justify-start">
                          <span className="font-mono text-xs font-bold text-zinc-400">
                            {step.number}.
                          </span>
                          <h3 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors">
                            {step.title}
                          </h3>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                            {step.tag}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block" />
                  )}

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default PipelineSection;
