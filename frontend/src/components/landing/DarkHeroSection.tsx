import React, { useState } from "react";
import { 
  ArrowRight, 
  FileText, 
  Play, 
  Check, 
  Sparkles, 
  Download, 
  Terminal, 
  FileCheck,
  Maximize2
} from "lucide-react";

interface DarkHeroSectionProps {
  onStartClick: () => void;
  onPreviewDocxClick?: () => void;
  videoSrc?: string;
}

export const DarkHeroSection: React.FC<DarkHeroSectionProps> = ({
  onStartClick,
  onPreviewDocxClick,
  videoSrc
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section id="top" className="relative min-h-[85vh] flex flex-col justify-center items-center pt-8 pb-16 overflow-hidden">
      {/* Ambient background subtle radial glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-zinc-700/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-1/4 w-[300px] h-[300px] bg-white/[0.02] blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        {/* Monospace Pill Badge */}
        <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-sm backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-tight">[ ГОСТ 7.32-2017 / 7.0.5-2008 ]</span>
        </div>

        {/* Headline (H1) */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-100 tracking-tight leading-[1.12]">
            Курсовая по ГОСТу за 5 минут <br className="hidden sm:inline" />
            <span className="text-zinc-400 font-normal">без правок в Word</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Нейросеть генерирует глубокое исследование, рассчитывает отступы и собирает готовый .docx с формулами, таблицами и литературой.
          </p>
        </div>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          {/* High-contrast Primary Button */}
          <button
            onClick={onStartClick}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm transition-all shadow-sm hover:shadow-glow-cold cursor-pointer active:scale-95"
          >
            <span>Сгенерировать работу</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary Ghost Button */}
          <button
            onClick={onPreviewDocxClick || (() => {
              const el = document.getElementById("gost-features");
              el?.scrollIntoView({ behavior: "smooth" });
            })}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100 font-medium text-sm transition-all cursor-pointer active:scale-95"
          >
            <FileText className="w-4 h-4 text-zinc-400" />
            <span>Посмотреть пример .docx</span>
          </button>
        </div>

        {/* Micro Guarantee Bullets */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-mono text-zinc-500 pt-1">
          <div className="flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-zinc-400" />
            <span>Шрифт Times New Roman 14pt</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-zinc-400" />
            <span>Отступы 30 / 15 / 20 / 20 мм</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-zinc-400" />
            <span>Оригинальность 85%+</span>
          </div>
        </div>

        {/* Video / Generation Demo Placeholder */}
        <div className="pt-6 w-full max-w-4xl mx-auto">
          <div className="dark-surface rounded-2xl p-2 sm:p-3 relative overflow-hidden group shadow-2xl">
            
            {/* Ambient Radial Gradient Background in Center */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950/90 to-[#09090b] pointer-events-none" />

            {/* Video or Fallback Interface Container */}
            <div className="relative aspect-[16/9] w-full rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden flex flex-col justify-between p-4 sm:p-6">
              {videoSrc ? (
                <video
                  src={videoSrc}
                  controls={isPlaying}
                  autoPlay={isPlaying}
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  {/* Top Bar of Video Frame */}
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-500 z-10">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
                      <span className="ml-2 text-zinc-400 hidden sm:inline">preview_generation_stream.docx</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-zinc-900/90 px-2.5 py-1 rounded-md border border-zinc-800 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-zinc-300">GOST AST Engine: Active</span>
                    </div>
                  </div>

                  {/* Center Radial Glow & Interactive Simulation */}
                  <div className="relative flex flex-col items-center justify-center my-auto py-6 z-10 space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-900/90 border border-zinc-700 flex items-center justify-center text-zinc-200 group-hover:scale-105 group-hover:border-zinc-500 group-hover:text-white transition-all shadow-xl shadow-black/60 cursor-pointer">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 translate-x-0.5 fill-current" />
                    </div>

                    <div className="space-y-1">
                      <div className="font-mono text-xs text-zinc-300 font-medium">
                        Демонстрация генерации и нормоконтроля (0:45)
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Посмотрите, как AST-парсер строит формулы, таблицы и литературу
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stream Status Indicator Bar */}
                  <div className="z-10 grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-400">
                    <div className="text-left">
                      <span className="text-zinc-500 block text-[10px]">ФОРМАТ</span>
                      <span className="text-zinc-200 font-semibold">.DOCX (OpenXML)</span>
                    </div>
                    <div className="text-center">
                      <span className="text-zinc-500 block text-[10px]">ВЕРСТКА</span>
                      <span className="text-zinc-200 font-semibold">ГОСТ 7.32-2017</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-500 block text-[10px]">СКОРОСТЬ</span>
                      <span className="text-emerald-400 font-semibold">~120 сек / работа</span>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default DarkHeroSection;
