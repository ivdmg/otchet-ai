import React, { useState } from "react";
import { 
  FileText, 
  GraduationCap, 
  BookOpen, 
  ArrowRight, 
  Sliders, 
  AlertCircle,
  Coins,
  Plus,
  Wallet
} from "lucide-react";
import { WizardFormData } from "./types";
import { useUserStore } from "../../store/useUserStore";
import { PaymentTopUpModal } from "../modals/PaymentTopUpModal";

interface Step1InitialDataProps {
  data: WizardFormData;
  onChange: (patch: Partial<WizardFormData>) => void;
  onNext: () => void;
}

export const Step1InitialData: React.FC<Step1InitialDataProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const { user, addCredits } = useUserStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const calculateCost = () => {
    let base = 10;
    if (data.docType === "abstract") base = 5;
    if (data.docType === "vkr") base = 20;
    const extraChapters = data.chapterCount > 4 ? (data.chapterCount - 4) * 5 : 0;
    return base + extraChapters;
  };

  const costCredits = calculateCost();
  const hasEnoughCredits = user.credits >= costCredits;

  const handleSelectDocType = (type: WizardFormData["docType"]) => {
    let pages = 35;
    let chapters = 3;
    if (type === "abstract") {
      pages = 18;
      chapters = 2;
    } else if (type === "vkr") {
      pages = 65;
      chapters = 3;
    }
    onChange({ docType: type, pageCount: pages, chapterCount: chapters });
    setErrorMessage(null);
  };

  const handleSelectChapters = (num: number) => {
    onChange({ chapterCount: num });
  };

  const handleAddExtraChapter = () => {
    if (data.docType === "vkr") {
      onChange({ chapterCount: Math.min(6, (data.chapterCount || 4) + 1) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.title.trim()) {
      setErrorMessage("Пожалуйста, укажите тему работы");
      return;
    }
    if (!hasEnoughCredits) {
      setIsTopUpOpen(true);
      return;
    }
    setErrorMessage(null);
    onNext();
  };

  const docTypeName = 
    data.docType === "vkr" 
      ? "ВКР / Диплом" 
      : data.docType === "abstract" 
      ? "Реферат" 
      : "Курсовая работа";

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (2/3): Document Type Tabs + Detailed Work Settings */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* 1. Document Type Tabs (Situated strictly in the left column above settings) */}
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#0c0c10]/70 border border-white/[0.08]">
              {/* Abstract */}
              <button
                type="button"
                onClick={() => handleSelectDocType("abstract")}
                className={`py-3 px-2 sm:px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                  data.docType === "abstract"
                    ? "border-white bg-white/10 text-white shadow-sm"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold truncate">Реферат</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  5 CR • 15–20 стр.
                </span>
              </button>

              {/* Coursework */}
              <button
                type="button"
                onClick={() => handleSelectDocType("coursework")}
                className={`py-3 px-2 sm:px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 relative ${
                  data.docType === "coursework"
                    ? "border-white bg-white/10 text-white shadow-sm"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold truncate">Курсовая</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  10 CR • 25–40 стр.
                </span>
              </button>

              {/* VKR */}
              <button
                type="button"
                onClick={() => handleSelectDocType("vkr")}
                className={`py-3 px-2 sm:px-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1 ${
                  data.docType === "vkr"
                    ? "border-white bg-white/10 text-white shadow-sm"
                    : "border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold truncate">ВКР / Диплом</span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  20 CR • 50–80 стр.
                </span>
              </button>
            </div>

            {/* 2. Detailed Work Settings Card */}
            <div className="bg-[#0c0c10]/70 p-5 sm:p-7 rounded-2xl border border-white/[0.08] space-y-5">
              
              {/* Topic Input (resize-none) */}
              <div>
                <label className="text-xs text-zinc-300 block mb-1.5 font-medium">
                  Тема работы <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={data.title}
                  onChange={(e) => {
                    onChange({ title: e.target.value });
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Например: Применение искусственного интеллекта в автоматизации банковских процессов"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-white transition-colors resize-none"
                  required
                />
              </div>

              {/* Discipline Input */}
              <div>
                <label className="text-xs text-zinc-300 block mb-1.5 font-medium">
                  Дисциплина / Направление подготовки
                </label>
                <input
                  type="text"
                  value={data.subject}
                  onChange={(e) => onChange({ subject: e.target.value })}
                  placeholder="Например: Информационные технологии / Финансы и кредит"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 text-sm placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Volume Slider */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Целевой объем страниц:</span>
                  <span className="font-mono font-bold text-white text-sm">{data.pageCount} стр.</span>
                </div>
                <input
                  type="range"
                  min={data.docType === "abstract" ? 12 : data.docType === "vkr" ? 45 : 20}
                  max={data.docType === "abstract" ? 25 : data.docType === "vkr" ? 85 : 45}
                  value={data.pageCount}
                  onChange={(e) => onChange({ pageCount: Number(e.target.value) })}
                  className="w-full accent-white cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span>{data.docType === "abstract" ? "12 стр." : data.docType === "vkr" ? "45 стр." : "20 стр."}</span>
                  <span>{data.docType === "abstract" ? "25 стр." : data.docType === "vkr" ? "85 стр." : "45 стр."}</span>
                </div>
              </div>

              {/* Chapter Buttons */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-300 font-medium">Количество глав:</span>
                  <span className="font-mono text-zinc-400">{data.chapterCount} {data.chapterCount === 2 ? "главы" : data.chapterCount < 5 ? "главы" : "глав"}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {/* 2 главы */}
                  <button
                    type="button"
                    onClick={() => handleSelectChapters(2)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${
                      data.chapterCount === 2
                        ? "bg-white text-zinc-950 border-white shadow-sm"
                        : "bg-zinc-900/80 text-zinc-300 border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    2 главы
                  </button>

                  {/* 3 главы */}
                  <button
                    type="button"
                    onClick={() => handleSelectChapters(3)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer border ${
                      data.chapterCount === 3
                        ? "bg-white text-zinc-950 border-white shadow-sm"
                        : "bg-zinc-900/80 text-zinc-300 border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    3 главы
                  </button>

                  {/* 4 главы */}
                  <button
                    type="button"
                    disabled={data.docType !== "vkr"}
                    onClick={() => handleSelectChapters(4)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                      data.chapterCount === 4
                        ? "bg-white text-zinc-950 border-white shadow-sm cursor-pointer"
                        : data.docType !== "vkr"
                        ? "bg-zinc-900/30 text-zinc-600 border-white/[0.04] cursor-not-allowed opacity-50"
                        : "bg-zinc-900/80 text-zinc-300 border-white/[0.08] hover:border-white/20 cursor-pointer"
                    }`}
                  >
                    4 главы
                  </button>

                  {/* Extra chapter for VKR */}
                  {data.docType === "vkr" && (
                    <button
                      type="button"
                      onClick={handleAddExtraChapter}
                      className={`px-3 py-2 rounded-xl text-xs font-mono transition-all border border-dashed flex items-center space-x-1 cursor-pointer ${
                        data.chapterCount > 4
                          ? "bg-amber-400/20 text-amber-300 border-amber-400/60 font-semibold"
                          : "bg-transparent text-zinc-400 border-white/20 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{data.chapterCount > 4 ? `${data.chapterCount} глав (+5 CR)` : "+ Добавить главу (+5 кредитов)"}</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column (1/3): ONLY Parameters Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-[#0c0c10]/70 p-6 rounded-2xl border border-white/[0.08] space-y-5 sticky top-24">
              <div className="flex items-center space-x-2 text-xs font-mono text-zinc-300 border-b border-white/[0.06] pb-3">
                <Sliders className="w-4 h-4 text-zinc-400" />
                <span className="font-semibold uppercase tracking-wider">Параметры работы</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400">Тип документа:</span>
                  <span className="text-white font-semibold">{docTypeName}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-white/[0.04]">
                  <span className="text-zinc-400">Объем:</span>
                  <span className="font-mono text-zinc-200">{data.pageCount} стр. ({data.chapterCount} {data.chapterCount === 2 ? "главы" : data.chapterCount < 5 ? "главы" : "глав"})</span>
                </div>

                {/* Credit Cost */}
                <div className="pt-2 pb-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-zinc-400 text-xs">Стоимость:</span>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold font-mono text-white">
                        {costCredits} кредитов
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono text-zinc-400 mt-1">
                    На балансе: <span className={hasEnoughCredits ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"}>{user.credits} кредитов</span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Dynamic Action Button: Pay & Proceed or Top Up */}
              {hasEnoughCredits ? (
                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs tracking-wide uppercase transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
                >
                  <span>Списать кредиты и перейти к генерации</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsTopUpOpen(true)}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide uppercase transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Пополнить баланс</span>
                </button>
              )}

              <p className="text-[10px] text-zinc-500 text-center font-mono">
                {hasEnoughCredits 
                  ? "На следующем шаге вы сможете утвердить или отредактировать план" 
                  : `Не хватает ${costCredits - user.credits} CR для запуска генерации`}
              </p>
            </div>
          </div>

        </div>
      </form>

      {/* Embedded Top-Up Modal */}
      <PaymentTopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccessPayment={(added) => {
          addCredits(added);
          setIsTopUpOpen(false);
        }}
      />
    </>
  );
};

export default Step1InitialData;
