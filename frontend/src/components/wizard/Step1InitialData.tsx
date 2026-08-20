import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  GraduationCap, 
  BookOpen, 
  Upload, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Info, 
  Building2, 
  User, 
  MapPin, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { WizardFormData, DocType } from "./types";

interface Step1InitialDataProps {
  data: WizardFormData;
  onChange: (data: Partial<WizardFormData>) => void;
  onNext: () => void;
}

const docTypesConfig: { type: DocType; label: string; desc: string; icon: any; badge: string }[] = [
  {
    type: "coursework",
    label: "Курсовая работа",
    desc: "25-40 страниц, 2-3 главы, практическая и теоретическая части",
    icon: GraduationCap,
    badge: "ГОСТ 7.32-2017",
  },
  {
    type: "abstract",
    label: "Реферат / Эссе",
    desc: "10-20 страниц, теоретический обзор с акцентом на источники",
    icon: BookOpen,
    badge: "Быстрый старт",
  },
  {
    type: "vkr",
    label: "ВКР / Диплом",
    desc: "50-80 страниц, глубокое исследование, расчёты и приложения",
    icon: FileText,
    badge: "Расширенный ГОСТ",
  },
];

const sampleTopics = [
  "Применение искусственного интеллекта в автоматизации банковских процессов",
  "Правовое регулирование цифровых финансовых активов в РФ",
  "Разработка микросервисной архитектуры высоконагруженных систем",
];

export const Step1InitialData: React.FC<Step1InitialDataProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = [".pdf", ".docx", ".doc", ".txt"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(ext)) {
      setError("Поддерживаются только форматы .docx, .pdf, .txt");
      return;
    }
    setError(null);
    onChange({ guideFile: file });
  };

  const removeFile = () => {
    onChange({ guideFile: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.title.trim()) {
      setError("Пожалуйста, укажите тему работы");
      return;
    }
    if (!data.subject.trim()) {
      setError("Пожалуйста, укажите предмет / дисциплину");
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-4xl mx-auto">
      
      {/* 1. Выбор типа работы */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>1. Выберите тип работы:</span>
          <span className="text-[11px] text-zinc-500 font-mono">Стандарт ГОСТ 7.32-2017</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {docTypesConfig.map((item) => {
            const Icon = item.icon;
            const isSelected = data.docType === item.type;
            return (
              <div
                key={item.type}
                onClick={() => onChange({ docType: item.type })}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#18181c] border-zinc-400 shadow-xl shadow-black/50 ring-1 ring-white/10"
                    : "dark-surface dark-surface-hover hover:border-zinc-700"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3.5 right-3.5 text-zinc-100">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2.5 mb-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isSelected 
                          ? "bg-zinc-100 text-zinc-950 font-bold" 
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-zinc-100 text-sm mb-1">{item.label}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Исходные данные работы */}
      <div className="dark-surface rounded-2xl p-6 sm:p-7 border border-zinc-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            2. Тема и параметры документа
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Автоструктура по ГОСТ</span>
        </div>

        {/* Тема работы */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
            <span>Тема работы *</span>
            <span className="text-[11px] text-zinc-500 font-mono">Точное наименование</span>
          </label>
          <textarea
            rows={2}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Например: Разработка и исследование алгоритмов машинного обучения для задач классификации"
            className="w-full px-4 py-3 bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all resize-none text-xs sm:text-sm font-sans"
          />

          {/* Быстрый выбор примеров */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-zinc-500 flex items-center space-x-1">
              <Info className="w-3 h-3" />
              <span>Примеры тем:</span>
            </span>
            {sampleTopics.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange({ title: topic })}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors border border-zinc-800 text-left truncate max-w-xs cursor-pointer font-sans"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Предмет и количество глав */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Предмет / Дисциплина *</label>
            <input
              type="text"
              value={data.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder="Информационные технологии"
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Количество глав основного текста</label>
            <select
              value={data.chapterCount}
              onChange={(e) => onChange({ chapterCount: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 text-xs sm:text-sm cursor-pointer focus:outline-none focus:border-zinc-500"
            >
              <option value={2} className="bg-zinc-900 text-zinc-100">2 главы (Теория + Практика)</option>
              <option value={3} className="bg-zinc-900 text-zinc-100">3 главы (Стандарт ГОСТ: Теория, Анализ, Проект)</option>
              <option value={4} className="bg-zinc-900 text-zinc-100">4 главы (Глубокое исследование)</option>
            </select>
          </div>
        </div>

        {/* Дополнительные метаданные для титульного листа */}
        <div className="pt-4 border-t border-zinc-800/80 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Данные для титульного листа (опционально)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={data.authorName || ""}
                onChange={(e) => onChange({ authorName: e.target.value })}
                placeholder="ФИО Студента (Иванов И.И.)"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm"
              />
            </div>

            <div className="relative">
              <Building2 className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={data.institution || ""}
                onChange={(e) => onChange({ institution: e.target.value })}
                placeholder="ВУЗ / Кафедра (МГТУ им. Баумана)"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm"
              />
            </div>

            <div className="relative">
              <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={data.city || ""}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Город (Москва)"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm"
              />
            </div>

            <div className="relative">
              <Calendar className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="number"
                value={data.year || new Date().getFullYear()}
                onChange={(e) => onChange({ year: Number(e.target.value) })}
                placeholder="Год (2026)"
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 3. Drag and Drop Загрузка Методички */}
      <div className="space-y-3">
        <label className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center justify-between">
          <span>3. Методические указания / план (Опционально)</span>
          <span className="text-[11px] text-zinc-500 font-mono">PDF, DOCX, TXT</span>
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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-zinc-400 bg-zinc-900/60 shadow-glow-silver"
                : "border-zinc-800 bg-zinc-950/40 hover:border-zinc-600 hover:bg-zinc-900/40"
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-zinc-200 mb-1">
              Перетащите файл методички сюда или нажмите для выбора
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">
              ИИ автоматически извлечет требования к структуре и оформлению
            </p>
          </div>
        ) : (
          <div className="dark-surface p-4 rounded-2xl border border-zinc-700 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-100">{data.guideFile.name}</p>
                <p className="text-[11px] font-mono text-zinc-500">
                  {(data.guideFile.size / (1024 * 1024)).toFixed(2)} МБ • Файл прикреплен
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Ошибка валидации */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка "Далее" */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-sm hover:shadow-glow-cold cursor-pointer active:scale-95"
        >
          <span>Сформировать план документа (Шаг 2)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </form>
  );
};

export default Step1InitialData;
