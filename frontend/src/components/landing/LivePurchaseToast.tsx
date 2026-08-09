import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Sparkles, X, ShoppingCart, FileText, Zap } from "lucide-react";

interface NotificationItem {
  id: string;
  name: string;
  university: string;
  action: string;
  timeAgo: string;
  type: "purchase" | "generation" | "download";
}

const NOTIFICATION_POOL: NotificationItem[] = [
  {
    id: "1",
    name: "Анна С.",
    university: "МГТУ им. Баумана",
    action: "сгенерировала ВКР на 68 стр. по ГОСТ 7.32",
    timeAgo: "14 сек. назад",
    type: "generation"
  },
  {
    id: "2",
    name: "Максим К.",
    university: "НИУ ВШЭ",
    action: "приобрел пакет «Студент» (3 кредита)",
    timeAgo: "42 сек. назад",
    type: "purchase"
  },
  {
    id: "3",
    name: "Екатерина Д.",
    university: "МГУ им. Ломоносова",
    action: "скачала чистовой DOCX (98.4% оригинальность)",
    timeAgo: "1 мин. назад",
    type: "download"
  },
  {
    id: "4",
    name: "Игорь Т.",
    university: "СПбГУ",
    action: "сгенерировал курсовую работу по экономике",
    timeAgo: "2 мин. назад",
    type: "generation"
  },
  {
    id: "5",
    name: "Артем В.",
    university: "МФТИ",
    action: "воспользовался точечной перегенерацией Spot Regeneration",
    timeAgo: "3 мин. назад",
    type: "generation"
  }
];

export const LivePurchaseToast: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    if (isDismissed) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % NOTIFICATION_POOL.length);
        setIsVisible(true);
      }, 500);
    }, 7000);

    return () => clearInterval(interval);
  }, [isDismissed]);

  if (isDismissed) return null;

  const item = NOTIFICATION_POOL[currentIndex];

  return (
    <div className="fixed bottom-5 left-5 z-50 max-w-sm w-full pointer-events-auto">
      <AnimatePresence mode="wait">
        {isVisible && (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="p-4 rounded-2xl glass-panel border border-indigo-500/30 shadow-2xl shadow-indigo-950/50 flex items-start space-x-3 backdrop-blur-xl relative overflow-hidden"
          >
            {/* Left Icon Pill */}
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              {item.type === "purchase" ? (
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
              ) : item.type === "download" ? (
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
              ) : (
                <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
              )}
            </div>

            {/* Notification Text */}
            <div className="flex-1 space-y-1 pr-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white">{item.name}</span>
                <span className="text-slate-400 font-mono text-[10px]">{item.timeAgo}</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {item.action}
              </p>
              <div className="text-[10px] text-indigo-400 font-semibold flex items-center space-x-1 pt-0.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{item.university}</span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LivePurchaseToast;
