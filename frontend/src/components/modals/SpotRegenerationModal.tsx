import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  MessageSquare, 
  Zap, 
  ShieldAlert,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="glass-panel w-full max-w-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Точечная перегенерация параграфа</h3>
                <p className="text-xs text-slate-400 font-mono">AST Node ID: {nodeId}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Текущий исходный фрагмент */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Текущий сгенерированный текст
              </label>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 line-clamp-3 leading-relaxed italic">
                "{currentText}"
              </div>
            </div>

            {/* Ввод специальных инструкций для ИИ */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Инструкции для ИИ-Оркестратора</span>
                <span className="text-amber-400 font-mono text-[11px] font-normal flex items-center space-x-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>1 Кредит</span>
                </span>
              </label>
              <textarea
                rows={3}
                value={userInstructions}
                onChange={(e) => setUserInstructions(e.target.value)}
                placeholder="Опишите, что необходимо изменить в этом параграфе..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-xs resize-none"
              />

              {/* Чипсы быстрых промптов */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUserInstructions(prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-amber-500/30 transition-colors text-left"
                  >
                    + {prompt}
                  </button>
                ))}
              </div>
            </div>

            {/* Информационный баннер */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Остальная часть документа останется без изменений. Спишется 1 кредит.</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                Отмена
              </button>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Перегенерация...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>Параграф обновлен!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Перегенерировать (1 Кредит)</span>
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
