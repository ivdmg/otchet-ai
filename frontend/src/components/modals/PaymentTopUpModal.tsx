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
  Zap
} from "lucide-react";

interface PaymentTopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessPayment?: (creditsAdded: number) => void;
}

interface PackageItem {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
  desc: string;
}

const creditPackages: PackageItem[] = [
  {
    id: "pkg_start",
    name: "Старт",
    credits: 5,
    price: 290,
    desc: "1 документ любого объема",
  },
  {
    id: "pkg_academic",
    name: "Академический",
    credits: 15,
    price: 690,
    popular: true,
    desc: "3 документа + точечные правки",
  },
  {
    id: "pkg_max",
    name: "Сессионный Макс",
    credits: 50,
    price: 1890,
    desc: "Для дипломных проектов и ВКР",
  },
];

type PaymentMethod = "card" | "sbp" | "yookassa";

export const PaymentTopUpModal: React.FC<PaymentTopUpModalProps> = ({
  isOpen,
  onClose,
  onSuccessPayment,
}) => {
  const [selectedPkgId, setSelectedPkgId] = useState<string>("pkg_academic");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("sbp");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const selectedPackage = creditPackages.find((p) => p.id === selectedPkgId) || creditPackages[1];

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      if (onSuccessPayment) {
        onSuccessPayment(selectedPackage.credits);
      }
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="dark-surface w-full max-w-lg rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Пополнение баланса кредитов</h3>
                <p className="text-[11px] text-zinc-400 font-mono">Зачисление через ЮKassa</p>
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
          <form onSubmit={handlePay} className="p-6 space-y-5">
            {/* 1. Выбор Пакета */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                1. Выберите пакет
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {creditPackages.map((pkg) => {
                  const isSelected = pkg.id === selectedPkgId;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`cursor-pointer rounded-xl p-3.5 border transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-zinc-900 border-zinc-400 shadow-md ring-1 ring-white/10"
                          : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-950 font-bold text-[9px] font-mono uppercase">
                          Популярный
                        </span>
                      )}

                      <div>
                        <h4 className="text-xs font-bold text-zinc-200 mb-0.5">{pkg.name}</h4>
                        <div className="text-lg font-extrabold text-zinc-100 font-mono mb-1">
                          {pkg.credits} <span className="text-xs text-zinc-400">CR</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 leading-tight">{pkg.desc}</p>
                      </div>

                      <div className="pt-2.5 mt-2.5 border-t border-zinc-800 text-right">
                        <span className="text-xs font-bold text-zinc-100 font-mono">{pkg.price} ₽</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Способы Оплаты */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                2. Способ оплаты
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("sbp")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === "sbp"
                      ? "bg-zinc-900 border-zinc-400 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono">СБП (QR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "bg-zinc-900 border-zinc-400 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-zinc-200" />
                  <span className="text-[11px] font-mono">Карта РФ</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("yookassa")}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === "yookassa"
                      ? "bg-zinc-900 border-zinc-400 text-white"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <Wallet className="w-4 h-4 text-zinc-200" />
                  <span className="text-[11px] font-mono">ЮKassa</span>
                </button>
              </div>
            </div>

            {/* Безопасность */}
            <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Защищенный SSL-платеж. Электронный чек на Email.</span>
            </div>

            {/* Submit Pay Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs shadow-sm hover:shadow-glow-cold flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Zap className="w-3.5 h-3.5 animate-pulse" />
                    <span>Переход к оплате...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Оплата успешна! +{selectedPackage.credits} CR</span>
                  </>
                ) : (
                  <>
                    <span>Оплатить {selectedPackage.price} ₽ ({selectedPackage.credits} CR)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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

export default PaymentTopUpModal;
