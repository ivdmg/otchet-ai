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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="dark-surface w-full max-w-xl rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Точечная перегенерация параграфа</h3>
                <p className="text-[11px] text-zinc-500 font-mono">AST Node: {nodeId}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Текущий исходный фрагмент */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Текущий текст параграфа
              </label>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 line-clamp-3 leading-relaxed italic">
                "{currentText}"
              </div>
            </div>

            {/* Ввод инструкций */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
                <span>Инструкция для перегенерации</span>
                <span className="text-zinc-400 font-mono text-[11px] flex items-center space-x-1">
                  <Coins className="w-3 h-3 text-amber-400" />
                  <span>1 Кредит</span>
                </span>
              </label>
              <textarea
                rows={3}
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                placeholder="Опишите, что изменить (добавить расчет, сменить тон, раскрыть подробнее)..."
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs resize-none"
              />

              {/* Быстрые промпты */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserInstructions(prompt)}
                    className="text-[11px] px-2 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors text-left cursor-pointer"
                  >
                    + {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Инфо плашка */}
            <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-xs flex items-center space-x-2 font-mono">
              <Zap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Остальная часть документа сохранится без изменений.</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors border border-zinc-800 cursor-pointer"
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="px-5 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-sm hover:shadow-glow-cold flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
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
