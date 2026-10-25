import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck, Flame, Lock, CheckCircle2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface ConversionFooterBannerProps {
  onStartClick: () => void;
}

export const ConversionFooterBanner: React.FC<ConversionFooterBannerProps> = ({ onStartClick }) => {
  const [liveCounter, setLiveCounter] = useState<number>(14258);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCounter((prev) => prev + Math.floor(Math.random() * 2) + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <GlassCard 
          variant="indigo" 
          glow 
          className="p-8 sm:p-14 border border-indigo-500/40 relative overflow-hidden text-center space-y-8 bg-gradient-to-br from-indigo-950/90 via-slate-950 to-violet-950/90"
        >
          {/* Background Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[120px] pointer-events-none rounded-full" />

          {/* Micro Announcement Chip */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Уже сгенерировано <strong className="text-white font-mono">{liveCounter.toLocaleString("ru-RU")}</strong> работ</span>
          </div>

          {/* Heading */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-outfit leading-tight">
              Готовы сдать Курсовую или ВКР по ГОСТу с <span className="gradient-heading">первого раза</span>?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Присоединяйтесь к тысячам студентов. Сгенерируйте документ за 3 минуты без форматирования вручную и риска ошибок в нормах ВУЗа.
            </p>
          </div>

          {/* CTA Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <motion.button
              whileHover={{ scale: 1.05, translateY: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={onStartClick}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-lg shadow-2xl shadow-indigo-600/40 border border-indigo-400/40 flex items-center justify-center space-x-3 cursor-pointer glow-effect-indigo"
            >
              <span>Попробовать бесплатно</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Trust Guarantees Footer Bar */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-400 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Валидация ГОСТ 7.32-2017</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Lock className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Безопасная оплата 54-ФЗ / СБП</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Бесплатная Spot Regeneration</span>
            </div>
          </div>

        </GlassCard>
      </div>
    </section>
  );
};

export default ConversionFooterBanner;
