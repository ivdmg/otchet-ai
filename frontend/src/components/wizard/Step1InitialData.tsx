import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  X, 
  ArrowRight, 
  AlertCircle,
  Paperclip,
  CheckCircle2,
  Sliders,
  Clock
} from "lucide-react";
import { WizardFormData, DocType } from "./types";

interface Step1InitialDataProps {
  data: WizardFormData;
  onChange: (data: Partial<WizardFormData>) => void;
  onNext: () => void;
}

interface DocConfig {
  type: DocType;
  label: string;
  minPages: number;
  maxPages: number;
  defaultPages: number;
  chapterOptions: number[];
  defaultChapters: number;
}

const docConfigs: Record<DocType, DocConfig> = {
  abstract: {
    type: "abstract",
    label: "Реферат",
    minPages: 5,
    maxPages: 20,
    defaultPages: 15,
    chapterOptions: [2, 3],
    defaultChapters: 2,
  },
  coursework: {
    type: "coursework",
    label: "Курсовая работа",
    minPages: 15,
    maxPages: 45,
    defaultPages: 25,
    chapterOptions: [2, 3, 4],
    defaultChapters: 3,
  },
  vkr: {
    type: "vkr",
    label: "ВКР / Диплом",
    minPages: 50,
    maxPages: 100,
    defaultPages: 75,
    chapterOptions: [3, 4, 5],
    defaultChapters: 3,
  },
};

const docTypeList: DocType[] = ["abstract", "coursework", "vkr"];

export const Step1InitialData: React.FC<Step1InitialDataProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentConfig = docConfigs[data.docType] || docConfigs.coursework;
  const currentPageCount = data.pageCount || currentConfig.defaultPages;

  const estimatedChars = currentPageCount * 1800;

  const handleSelectDocType = (type: DocType) => {
    const nextConfig = docConfigs[type];
    const newChapters = nextConfig.chapterOptions.includes(data.chapterCount)
      ? data.chapterCount
      : nextConfig.defaultChapters;

    onChange({
      docType: type,
      pageCount: nextConfig.defaultPages,
      chapterCount: newChapters,
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = [".pdf", ".docx", ".doc", ".txt"];
      const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!validExtensions.includes(ext)) {
        return;
      }
      onChange({ guideFile: file });
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ guideFile: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!data.title.trim() || !data.subject.trim()) {
      return;
    }
    onNext();
  };

  const getPagePresets = () => {
    switch (data.docType) {
      case "abstract":
        return [5, 10, 15, 20];
      case "coursework":
        return [20, 25, 30, 40];
      case "vkr":
        return [50, 65, 75, 90];
      default:
        return [20, 25, 30, 40];
    }
  };

  const isTitleInvalid = submitted && !data.title.trim();
  const isSubjectInvalid = submitted && !data.subject.trim();

  return (
    <form onSubmit={handleSubmit} className="w-full font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Form Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* 1. Document Type Segmented Selector */}
          <div className="flex p-1 bg-transparent rounded-xl border border-white/[0.08] gap-1">
            {docTypeList.map((type) => {
              const isSelected = data.docType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleSelectDocType(type)}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-medium transition-colors text-center cursor-pointer ${
                    isSelected
                      ? "bg-white text-zinc-950 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {docConfigs[type].label}
                </button>
              );
            })}
          </div>

          {/* 2. Main Parameters Surface Card */}
          <div className="bg-transparent rounded-2xl p-5 sm:p-6 border border-white/[0.08] space-y-4">
            
            {/* Тема работы */}
            <div>
              <input
                type="text"
                value={data.title}
                onChange={(e) => onChange({ title: e.target.value })}
                placeholder="Введите тему работы..."
                className={`w-full px-4 py-3 bg-transparent rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:outline-none text-xs sm:text-sm transition-colors duration-150 border ${
                  isTitleInvalid
                    ? "border-rose-500 ring-1 ring-rose-500/50 placeholder-rose-400/60"
                    : "border-white/[0.08] focus:border-white/40"
                }`}
              />
            </div>

            {/* Предмет и Количество глав */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7">
                <input
                  type="text"
                  value={data.subject}
                  onChange={(e) => onChange({ subject: e.target.value })}
                  placeholder="Предмет / дисциплина..."
                  className={`w-full px-4 py-3 bg-transparent rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:outline-none text-xs sm:text-sm transition-colors duration-150 border ${
                    isSubjectInvalid
                      ? "border-rose-500 ring-1 ring-rose-500/50 placeholder-rose-400/60"
                      : "border-white/[0.08] focus:border-white/40"
                  }`}
                />
              </div>

              <div className="sm:col-span-5 flex gap-1.5">
                {currentConfig.chapterOptions.map((ch) => {
                  const isActive = data.chapterCount === ch;
                  return (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => onChange({ chapterCount: ch })}
                      className={`flex-1 py-3 px-2 rounded-xl border text-xs font-mono transition-colors text-center cursor-pointer ${
                        isActive
                          ? "bg-white text-zinc-950 font-bold border-white"
                          : "bg-transparent border-white/[0.08] text-zinc-400 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {ch} {ch === 5 ? "глав" : "главы"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Количество страниц & Slider */}
            <div className="space-y-2 pt-2 border-t border-white/[0.04]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-400">
                  Объем документа: <strong className="text-white">{currentPageCount} стр.</strong>
                </span>
                <div className="flex gap-1.5">
                  {getPagePresets().map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => onChange({ pageCount: preset })}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-colors cursor-pointer border ${
                        currentPageCount === preset
                          ? "bg-white text-zinc-950 font-bold border-white"
                          : "bg-transparent text-zinc-400 hover:text-white border-white/[0.08]"
                      }`}
                    >
                      {preset} стр
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min={currentConfig.minPages}
                  max={currentConfig.maxPages}
                  step={1}
                  value={currentPageCount}
                  onChange={(e) => onChange({ pageCount: Number(e.target.value) })}
                  className="flex-1 h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none"
                />
              </div>
            </div>

            {/* Пожелания к работе и Методичка */}
            <div className="space-y-3 pt-2 border-t border-white/[0.04]">
              <textarea
                rows={2}
                value={data.customPrompt || ""}
                onChange={(e) => onChange({ customPrompt: e.target.value })}
                placeholder="Особые пожелания или требования к содержанию (опционально)..."
                className="w-full px-4 py-2.5 bg-transparent border border-white/[0.08] rounded-xl text-zinc-100 placeholder-zinc-500 outline-none focus:outline-none focus:border-white/40 text-xs resize-none transition-colors duration-150"
              />

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!data.guideFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-12 border border-dashed border-white/[0.12] hover:border-white/30 rounded-xl bg-transparent flex items-center justify-center gap-2 px-3 cursor-pointer transition-colors text-zinc-400 hover:text-white"
                  >
                    <Upload className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-mono">Прикрепить методичку или файл (PDF / DOCX)</span>
                  </div>
                ) : (
                  <div className="h-12 px-3 bg-transparent border border-white/20 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <Paperclip className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="text-zinc-200 truncate font-mono">{data.guideFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-1 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Large Floating Glassmorphic Specification Card (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          
          <div className="kast-floating-glass rounded-2xl p-6 border border-white/15 space-y-5 relative overflow-hidden">
            
            {/* Top Eyebrow & Live Indicator */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">
                  Спецификация документа
                </div>
              </div>
              
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/60 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ГОТОВ К СБОРКЕ</span>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-transparent border border-white/[0.08] space-y-1">
                <div className="text-[10px] font-mono uppercase text-zinc-500">Объем</div>
                <div className="text-lg font-mono font-bold text-white">
                  {currentPageCount} <span className="text-xs font-normal text-zinc-400">стр.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-transparent border border-white/[0.08] space-y-1">
                <div className="text-[10px] font-mono uppercase text-zinc-500">Знаки</div>
                <div className="text-lg font-mono font-bold text-white">
                  ~{(estimatedChars / 1000).toFixed(0)}k <span className="text-xs font-normal text-zinc-400">зн.</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-transparent border border-white/[0.08] space-y-1">
                <div className="text-[10px] font-mono uppercase text-zinc-500">Главы</div>
                <div className="text-lg font-mono font-bold text-white">
                  {data.chapterCount} <span className="text-xs font-normal text-zinc-400">главы</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-transparent border border-white/[0.08] space-y-1">
                <div className="text-[10px] font-mono uppercase text-zinc-500">Время сборки</div>
                <div className="text-lg font-mono font-bold text-white">
                  ~15-20 <span className="text-xs font-normal text-zinc-400">сек</span>
                </div>
              </div>
            </div>

            {/* Standard Compliance Checklist */}
            <div className="space-y-2 pt-1 border-t border-white/[0.08]">
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Поля: 30 мм слева, 15 мм справа, 20/20 мм</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Шрифт 14 pt, полуторный интервал</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Абзацный отступ ровно 1.25 см</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Сквозная нумерация формул и таблиц</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Автоматический список литературы</span>
                </div>
              </div>
            </div>

            {/* Main Submit Action */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Далее: План документа</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </form>
  );
};

export default Step1InitialData;
