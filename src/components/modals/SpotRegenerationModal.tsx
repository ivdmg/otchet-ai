import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  Coins
} from "lucide-react";

interface SpotRegenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string | null;
  currentText: string;
  onRegenerate: (nodeId: string, userInstructions: string) => Promise<void> | void;
}

const quickPrompts = [
  "Сделать стиль более строго академическим",
  "Добавить статистические данные и ссылки на авторитеты",
  "Расширить аргументацию и добавить примеры",
  "Сократить объем и убрать вводные конструкции",
];

export const SpotRegenerationModal: React.FC<SpotRegenerationModalProps> = ({
  isOpen,
  onClose,
  nodeId,
  currentText,
  onRegenerate,
}) => {
  const [userInstructions, setUserInstructions] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !nodeId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onRegenerate(nodeId, userInstructions);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        setUserInstructions("");
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="kast-floating-glass w-full max-w-xl rounded-2xl border border-white/15 overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.08] flex items-center justify-between bg-transparent">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-transparent border border-white/[0.08] flex items-center justify-center text-zinc-200">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Точечная перегенерация</h3>
                <p className="text-[11px] text-zinc-500 font-mono">Node ID: {nodeId}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Текущий исходный фрагмент */}
            <div className="p-3.5 rounded-xl bg-transparent border border-white/[0.08] text-xs text-zinc-300 line-clamp-3 leading-relaxed italic">
              "{currentText}"
            </div>

            {/* Ввод инструкций */}
            <div className="space-y-2">
              <textarea
                rows={3}
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                placeholder="Инструкция для ИИ (добавить расчет, сменить тон, раскрыть подробнее)..."
                className="w-full px-4 py-3 bg-transparent border border-white/[0.08] rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-white/30 text-xs resize-none"
              />

              {/* Быстрые промпты */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserInstructions(prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white border border-white/[0.06] transition-colors text-left cursor-pointer font-mono"
                  >
                    + {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Инфо плашка */}
            <div className="p-3 rounded-xl bg-transparent border border-white/[0.06] text-zinc-400 text-xs flex items-center justify-between font-mono">
              <div className="flex items-center space-x-2">
                <Zap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span>Остальная часть документа сохранится без изменений</span>
              </div>
              <span className="text-zinc-400 font-mono text-[11px] flex items-center space-x-1 shrink-0">
                <Coins className="w-3 h-3 text-zinc-400" />
                <span>1 Кредит</span>
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-zinc-300 font-mono text-xs transition-colors border border-white/[0.08] cursor-pointer"
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Перегенерация...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Готово!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Перегенерировать</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SpotRegenerationModal;
