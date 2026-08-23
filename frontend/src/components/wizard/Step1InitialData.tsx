import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  X, 
  ArrowRight, 
  AlertCircle,
  FileText,
  Paperclip
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
    minPages: 5,
    maxPages: 40,
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
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentConfig = docConfigs[data.docType] || docConfigs.coursework;

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
        setError("Поддерживаются только .docx, .pdf, .txt");
        return;
      }
      setError(null);
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
    if (!data.title.trim()) {
      setError("Укажите тему работы");
      return;
    }
    if (!data.subject.trim()) {
      setError("Укажите предмет");
      return;
    }
    setError(null);
    onNext();
  };

  const getPagePresets = () => {
    switch (data.docType) {
      case "abstract":
        return [5, 10, 15, 20];
      case "coursework":
        return [15, 20, 25, 30, 40];
      case "vkr":
        return [50, 60, 75, 90, 100];
      default:
        return [15, 20, 25, 30];
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-4 font-sans">
      
      {/* 1. Минималистичный навбар типов документов */}
      <div className="flex p-1 bg-zinc-900/90 border border-zinc-800 rounded-xl gap-1">
        {docTypeList.map((type) => {
          const isSelected = data.docType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => handleSelectDocType(type)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all text-center cursor-pointer ${
                isSelected
                  ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
              }`}
            >
              {docConfigs[type].label}
            </button>
          );
        })}
      </div>

      {/* 2. Основная компактная карточка с параметрами */}
      <div className="dark-surface rounded-2xl p-5 sm:p-6 border border-zinc-800 space-y-4 shadow-xl">
        
        {/* Тема работы */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Тема работы <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Введите тему работы"
            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm"
          />
        </div>

        {/* Предмет и Количество глав */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Предмет <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={data.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder="Например: Экономика"
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Количество глав
            </label>
            <div className="flex gap-2">
              {currentConfig.chapterOptions.map((ch) => {
                const isActive = data.chapterCount === ch;
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => onChange({ chapterCount: ch })}
                    className={`flex-1 py-2 px-2.5 rounded-xl border text-xs font-medium transition-all text-center cursor-pointer ${
                      isActive
                        ? "bg-zinc-800 border-zinc-400 text-zinc-100 shadow-sm"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {ch} {ch === 5 ? "глав" : "главы"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Количество страниц */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-300">
              Количество страниц
            </label>
            <span className="text-xs font-mono font-semibold text-zinc-100 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {data.pageCount || currentConfig.defaultPages} стр.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min={currentConfig.minPages}
              max={currentConfig.maxPages}
              step={1}
              value={data.pageCount || currentConfig.defaultPages}
              onChange={(e) => onChange({ pageCount: Number(e.target.value) })}
              className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-200 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>{currentConfig.minPages} стр.</span>
            <div className="flex gap-1.5">
              {getPagePresets().map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange({ pageCount: preset })}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                    (data.pageCount || currentConfig.defaultPages) === preset
                      ? "bg-zinc-200 text-zinc-950 font-bold"
                      : "bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            <span>{currentConfig.maxPages} стр.</span>
          </div>
        </div>

        {/* Пожелания к работе и Методичка */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          
          {/* Пожелания */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Пожелания к работе
            </label>
            <textarea
              rows={2}
              value={data.customPrompt || ""}
              onChange={(e) => onChange({ customPrompt: e.target.value })}
              placeholder="Особые требования, важные акценты или кейсы"
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs resize-none"
            />
            <p className="text-[10px] text-zinc-500 font-mono">
              ИИ учтет ваши пожелания
            </p>
          </div>

          {/* Методичка */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Методичка (опционально)
            </label>
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
                className="h-[58px] border border-dashed border-zinc-800 rounded-xl bg-zinc-950/60 hover:bg-zinc-900/60 hover:border-zinc-700 flex items-center justify-center gap-2 px-3 cursor-pointer transition-colors text-zinc-400 hover:text-zinc-200"
              >
                <Upload className="w-4 h-4 text-zinc-400" />
                <span className="text-xs">Загрузить PDF, DOCX, TXT</span>
              </div>
            ) : (
              <div className="h-[58px] px-3 bg-zinc-950 border border-zinc-700 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <Paperclip className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="text-zinc-200 truncate">{data.guideFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-zinc-500 font-mono">
              Для извлечения требований
            </p>
          </div>

        </div>

      </div>

      {/* Ошибка валидации */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка "Далее" */}
      <div className="flex justify-end pt-1">
        <button
          type="submit"
          className="inline-flex items-center space-x-2 px-7 py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-sm cursor-pointer active:scale-95"
        >
          <span>Далее: План документа</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </form>
  );
};

export default Step1InitialData;
