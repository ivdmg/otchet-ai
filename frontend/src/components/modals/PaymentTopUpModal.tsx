import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coins, 
  X, 
  CreditCard, 
  QrCode, 
  Wallet, 
  CheckCircle2, 
  Sparkles, 
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
    desc: "Хватит на 1 генерацию полномерного документа",
  },
  {
    id: "pkg_academic",
    name: "Академический",
    credits: 15,
    price: 690,
    popular: true,
    desc: "Хватит на 3 документа или 15 точечных перегенераций",
  },
  {
    id: "pkg_max",
    name: "Сессионный Макс",
    credits: 50,
    price: 1890,
    desc: "Полный безлимит для написания дипломов и ВКР",
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

    // Симуляция обращения к эндпоинту платежного шлюза ЮKassa
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
    }, 1800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-bold">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Пополнение баланса кредитов</h3>
                <p className="text-xs text-slate-400">Мгновенное зачисление через защищенный шлюз ЮKassa</p>
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

          {/* Body */}
          <form onSubmit={handlePay} className="p-6 space-y-6">
            {/* 1. Выбор Пакета */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                1. Выберите тарифный пакет
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {creditPackages.map((pkg) => {
                  const isSelected = pkg.id === selectedPkgId;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkgId(pkg.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all duration-200 relative flex flex-col justify-between ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500"
                          : "glass-card hover:border-slate-700"
                      }`}
                    >
                      {pkg.popular && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider shadow">
                          Хит продаж
                        </span>
                      )}

                      <div>
                        <h4 className="text-xs font-bold text-white mb-1">{pkg.name}</h4>
                        <div className="text-xl font-extrabold text-amber-400 font-mono mb-1">
                          {pkg.credits} <span className="text-xs font-normal">CR</span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">{pkg.desc}</p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-800 text-right">
                        <span className="text-sm font-bold text-white">{pkg.price} ₽</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Способы Оплаты */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Способ оплаты
              </label>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("sbp")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                    paymentMethod === "sbp"
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-semibold">СБП (по QR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                    paymentMethod === "card"
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-semibold">Банковская карта</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("yookassa")}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all ${
                    paymentMethod === "yookassa"
                      ? "bg-blue-600/20 border-blue-500 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Wallet className="w-5 h-5 text-indigo-400" />
                  <span className="text-xs font-semibold">ЮKassa</span>
                </button>
              </div>
            </div>

            {/* Безопасность */}
            <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Защищенный 256-bit SSL платёж. Электронный чек на ваш Email.</span>
            </div>

            {/* Submit Pay Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Zap className="w-4 h-4 animate-bounce" />
                    <span>Переход к оплате ЮKassa...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>Оплата успешна! +{selectedPackage.credits} CR зачислено</span>
                  </>
                ) : (
                  <>
                    <span>Оплатить {selectedPackage.price} ₽ ({selectedPackage.credits} Кредитов)</span>
                    <ArrowRight className="w-4 h-4" />
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
