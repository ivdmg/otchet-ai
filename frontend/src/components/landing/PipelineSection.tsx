import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";
import { UploadCloud, Layers, FileDown } from "lucide-react";

interface StepData {
  number: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

const STEPS: StepData[] = [
  {
    number: "01",
    title: "Ввод данных",
    desc: "Тема или методичка ВУЗа",
    icon: <UploadCloud className="w-6 h-6" />
  },
  {
    number: "02",
    title: "Структура",
    desc: "Согласование содержания",
    icon: <Layers className="w-6 h-6" />
  },
  {
    number: "03",
    title: "Готовый .docx",
    desc: "Скачивание файла по ГОСТу",
    icon: <FileDown className="w-6 h-6" />
  }
];

const DockStepNode: React.FC<{
  step: StepData;
  mouseX: MotionValue<number>;
}> = ({ step, mouseX }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Measure distance from mouse position to center of this node
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // macOS Dock magnification physics (smooth curve)
  const scaleSync = useTransform(distance, [-160, 0, 160], [1, 1.2, 1]);
  const scale = useSpring(scaleSync, { mass: 0.1, stiffness: 240, damping: 18 });

  const ySync = useTransform(distance, [-160, 0, 160], [0, -12, 0]);
  const y = useSpring(ySync, { mass: 0.1, stiffness: 240, damping: 18 });

  return (
    <div className="flex flex-col items-center text-center space-y-3.5 relative z-10 group">
      {/* Magnifying Node Box */}
      <motion.div
        ref={ref}
        style={{ scale, y }}
        className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#141417] border border-zinc-800 group-hover:border-zinc-500 transition-colors flex flex-col items-center justify-center shadow-xl shadow-black/60 relative cursor-pointer group-hover:shadow-glow-silver"
      >
        <span className="font-mono text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors absolute top-2 left-2.5">
          {step.number}
        </span>
        <div className="text-zinc-300 group-hover:text-white transition-colors mt-1">
          {step.icon}
        </div>
      </motion.div>

      {/* Step Title & Short Subtitle */}
      <div className="space-y-1 max-w-[170px]">
        <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
          {step.number}. {step.title}
        </h3>
        <p className="text-xs text-zinc-400 leading-snug">
          {step.desc}
        </p>
      </div>
    </div>
  );
};

export const PipelineSection: React.FC = () => {
  const mouseX = useMotionValue(Infinity);

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden border-t border-zinc-900">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-zinc-800/10 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header (Centered, Clean, No badge) */}
        <div className="text-center max-w-xl mx-auto space-y-2.5 mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Как устроен процесс
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            От темы до готового документа за 3 минуты
          </p>
        </div>

        {/* macOS Dock Style Magnifying Pipeline Container (Centered) */}
        <div 
          onMouseMove={(e) => mouseX.set(e.clientX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 max-w-2xl mx-auto py-6"
        >
          
          {/* Node 01 */}
          <DockStepNode step={STEPS[0]} mouseX={mouseX} />

          {/* Simple Connecting Line 1 (Desktop) */}
          <div className="hidden md:block flex-1 h-[1px] bg-zinc-800 mx-4 -translate-y-6" />

          {/* Node 02 */}
          <DockStepNode step={STEPS[1]} mouseX={mouseX} />

          {/* Simple Connecting Line 2 (Desktop) */}
          <div className="hidden md:block flex-1 h-[1px] bg-zinc-800 mx-4 -translate-y-6" />

          {/* Node 03 */}
          <DockStepNode step={STEPS[2]} mouseX={mouseX} />

        </div>

      </div>
    </section>
  );
};

export default PipelineSection;
