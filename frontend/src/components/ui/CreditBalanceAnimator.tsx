import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Plus, Sparkles, Minus } from "lucide-react";

interface CreditBalanceAnimatorProps {
  initialCredits?: number;
  onTopUpClick?: () => void;
}

export const CreditBalanceAnimator: React.FC<CreditBalanceAnimatorProps> = ({
  initialCredits = 45,
  onTopUpClick,
}) => {
  const [credits, setCredits] = useState<number>(initialCredits);
  const [floatingDelta, setFloatingDelta] = useState<{ id: string; text: string; isPositive: boolean } | null>(null);

  const triggerCreditChange = (delta: number) => {
    setCredits((prev) => Math.max(0, prev + delta));
    const isPositive = delta > 0;
    const text = isPositive ? `+${delta} Кредитов` : `${delta} Кредит`;
    const id = Math.random().toString(36).substring(2, 9);
    
    setFloatingDelta({ id, text, isPositive });
    setTimeout(() => {
      setFloatingDelta(null);
    }, 1800);
  };

  return (
    <div className="relative inline-flex items-center">
      <motion.div
        whileHover={{ scale: 1.04 }}
        className="glass-card px-4 py-2 rounded-2xl border border-amber-500/30 flex items-center space-x-3 shadow-glow-gold bg-amber-950/20"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
          <Coins className="w-4 h-4 text-amber-100 animate-pulse" />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">Баланс Кредитов</span>
          <div className="flex items-center space-x-1.5 font-mono font-bold text-sm text-white">
            <AnimatePresence mode="wait">
              <motion.span
                key={credits}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="gradient-gold text-base"
              >
                {credits}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs text-amber-200/80 font-sans font-normal">CR</span>
          </div>
        </div>

        {/* Action Buttons for Demo/TopUp */}
        <div className="flex items-center space-x-1 pl-2 border-l border-amber-500/20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => triggerCreditChange(-1)}
            title="Тест списания (1 Кредит)"
            className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-300 transition-colors cursor-pointer text-xs font-mono font-bold"
          >
            -1
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerCreditChange(25);
              if (onTopUpClick) onTopUpClick();
            }}
            title="Пополнить баланс (+25 Кредитов)"
            className="p-1 rounded-lg bg-amber-500/30 hover:bg-amber-500/40 text-amber-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.div>

      {/* Floating Animated Popup for Credit Change */}
      <AnimatePresence>
        {floatingDelta && (
          <motion.div
            key={floatingDelta.id}
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -30, scale: 1 }}
            exit={{ opacity: 0, y: -45, scale: 0.8 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={`absolute top-0 right-4 px-3 py-1 rounded-full text-xs font-bold font-mono shadow-xl pointer-events-none z-50 flex items-center space-x-1 border ${
              floatingDelta.isPositive
                ? "bg-emerald-600 text-white border-emerald-400 shadow-glow-emerald"
                : "bg-amber-600 text-white border-amber-400 shadow-glow-gold"
            }`}
          >
            {floatingDelta.isPositive ? <Sparkles className="w-3 h-3 text-amber-200" /> : <Minus className="w-3 h-3 text-amber-200" />}
            <span>{floatingDelta.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
