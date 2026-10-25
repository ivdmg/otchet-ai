import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coins, 
  X, 
  CreditCard, 
  QrCode, 
  Wallet, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  Sparkles,
  Info
} from "lucide-react";

interface PaymentTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPayment?: (creditsAdded: number) => void;
}

type PaymentMethod = "sbp" | "card" | "tpay" | "sberpay";

export const PaymentTopUpModal: React.FC<PaymentTopUpModalProps> = ({
  isOpen,
  onClose,
  onSuccessPayment,
}) => {
  const [amountRub, setAmountRub] = useState<number>(600);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("sbp");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  // Rate: 1 credit = 1 ruble (1 CR = 1 ₽)
  const baseCredits = Math.max(0, amountRub);
  // +20% promo bonus
  const bonusCredits = Math.floor(baseCredits * 0.20);
  const totalCredits = baseCredits + bonusCredits;

  const handleSelectPreset = (val: number) => {
    setAmountRub(val);
  };

  const getAffordabilitySummary = (cr: number) => {
    if (cr >= 20) {
      const vkrs = Math.floor(cr / 20);
      const course = Math.floor(cr / 10);
      const abstracts = Math.floor(cr / 5);
      return `Хватит на ${vkrs} ${vkrs === 1 ? "диплом/ВКР" : "диплома/ВКР"}, или ${course} ${course < 5 ? "курсовых" : "курсовых"}, или ${abstracts} рефератов`;
    } else if (cr >= 10) {
      const course = Math.floor(cr / 10);
      const abstracts = Math.floor(cr / 5);
      return `Хватит на ${course} курсовую работу или ${abstracts} реферата`;
    } else if (cr >= 5) {
      const abstracts = Math.floor(cr / 5);
      return `Хватит на ${abstracts} ${abstracts === 1 ? "реферат" : "реферата"}`;
    }
    return "Минимум 5 кредитов для реферата (от 50 ₽)";
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountRub < 50) return;
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      if (onSuccessPayment) {
        onSuccessPayment(totalCredits);
      }
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="dark-surface w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden relative my-auto"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Пополнение баланса</h3>
                <div className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Курс: 1 CR = 1 ₽ (+20% бонус)</span>
                </div>
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

          {/* Body */}
          <form onSubmit={handlePay} className="p-5 sm:p-6 space-y-5">
            
            {/* Quick Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-400 uppercase tracking-wider">Быстрый выбор суммы</span>
                <span className="text-zinc-500 text-[11px]">1 CR = 1 ₽</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { rub: 300, label: "300 ₽", total: 360, popular: false },
                  { rub: 600, label: "600 ₽", total: 720, popular: true },
                  { rub: 1500, label: "1 500 ₽", total: 1800, popular: false },
                ].map((item) => (
                  <button
                    key={item.rub}
                    type="button"
                    onClick={() => handleSelectPreset(item.rub)}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer relative flex flex-col justify-between ${
                      amountRub === item.rub
                        ? "bg-zinc-900 border-white text-white shadow-md ring-1 ring-white/10"
                        : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300"
                    }`}
                  >
                    {item.popular && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-950 font-bold text-[8.5px] font-mono uppercase">
                        Хит
                      </span>
                    )}
                    <span className="text-sm font-bold font-mono">{item.label}</span>
                    <span className="text-[10px] font-mono text-emerald-400 mt-1">
                      {item.total} CR
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Своя сумма пополнения (рубли)
              </label>
              
              <div className="relative">
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={amountRub || ""}
                  onChange={(e) => setAmountRub(Math.max(0, Number(e.target.value)))}
                  placeholder="Введите сумму в рублях"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-sm placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                  required
                />
                <span className="absolute right-4 top-2.5 text-xs font-mono text-zinc-500">
                  ₽
                </span>
              </div>
            </div>

            {/* Live Calculation Calculation Card */}
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Базовые кредиты:</span>
                <span className="text-zinc-200">{baseCredits} CR</span>
              </div>
              <div className="flex items-center justify-between text-emerald-400">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Промо-бонус (+20%):</span>
                </span>
                <span className="font-bold">+{bonusCredits} CR</span>
              </div>
              <div className="pt-2 border-t border-zinc-800 flex items-baseline justify-between">
                <span className="text-white font-semibold">Итого к зачислению:</span>
                <span className="text-lg font-extrabold text-white">{totalCredits} CR</span>
              </div>

              {/* What this amount is enough for */}
              <div className="pt-2 border-t border-zinc-800/60 flex items-start space-x-2 text-[11px] text-zinc-400">
                <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>{getAffordabilitySummary(totalCredits)}</span>
              </div>
            </div>

            {/* Payment Providers */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 block">
                Способ оплаты
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* SBP */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("sbp")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === "sbp"
                      ? "bg-zinc-900 border-white text-white shadow-sm"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono">СБП (QR)</span>
                </button>

                {/* Cards */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "bg-zinc-900 border-white text-white shadow-sm"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-zinc-200" />
                  <span className="text-[11px] font-mono">Карты МИР</span>
                </button>

                {/* T-Bank */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("tpay")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === "tpay"
                      ? "bg-zinc-900 border-white text-white shadow-sm"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-mono">Т-Банк Pay</span>
                </button>

                {/* SberPay */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("sberpay")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === "sberpay"
                      ? "bg-zinc-900 border-white text-white shadow-sm"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono">СберPay</span>
                </button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Защищенный эквайринг РФ. Моментальное зачисление без комиссии.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess || amountRub < 50}
              className="w-full py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {isLoading ? (
                <>
                  <Zap className="w-3.5 h-3.5 animate-pulse" />
                  <span>Переход к оплате...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Оплата успешна! +{totalCredits} CR</span>
                </>
              ) : (
                <>
                  <span>Оплатить {amountRub} ₽ (Получить {totalCredits} CR)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentTopUpModal;
