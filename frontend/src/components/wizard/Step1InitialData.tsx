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
import { GlassCard } from "../ui/GlassCard";

interface Step1InitialDataProps {
  data: WizardFormData;
  onChange: (data: Partial<WizardFormData>) => void;
  onNext: () => void;
}

const docTypesConfig: { type: DocType; label: string; desc: string; icon: any; badge: string }[] = [
  {
    type: "coursework",
    label: "Курсовая работа",
    desc: "20-35 страниц, 2-3 главы, практическая и теоретическая части",
    icon: GraduationCap,
    badge: "ГОСТ 7.32-2017",
  },
  {
    type: "abstract",
    label: "Реферат",
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
        <label className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">1</span>
            <span>Выберите тип академической работы</span>
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 font-normal">Стандарт ГОСТ 7.32-2017</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {docTypesConfig.map((item) => {
            const Icon = item.icon;
            const isSelected = data.docType === item.type;
            return (
              <motion.div
                key={item.type}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange({ docType: item.type })}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? "bg-indigo-950/40 dark:bg-indigo-950/40 light:bg-indigo-50 border-indigo-500 shadow-glow-indigo ring-2 ring-indigo-500/50"
                    : "glass-card hover:border-indigo-500/40"
                }`}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3 text-indigo-400 dark:text-indigo-400 light:text-indigo-600"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </motion.div>
                )}
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`p-2.5 rounded-xl transition-colors ${
                        isSelected 
                          ? "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30" 
                          : "bg-slate-800 dark:bg-slate-800 light:bg-slate-200 text-slate-400 dark:text-slate-400 light:text-slate-600"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/80 dark:bg-slate-800/80 light:bg-slate-200 text-indigo-300 dark:text-indigo-300 light:text-indigo-700 font-mono border border-slate-700/50">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white dark:text-white light:text-slate-900 text-base mb-1">{item.label}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 2. Исходные данные работы */}
      <GlassCard variant="indigo" glow={false} interactive={false} className="space-y-6">
        <h2 className="text-lg font-semibold text-white dark:text-white light:text-slate-900 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <span>Тема и параметры документа</span>
        </h2>

        {/* Тема работы */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700 flex items-center justify-between">
            <span>Тема работы *</span>
            <span className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-500">Точное наименование темы</span>
          </label>
          <textarea
            rows={2}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Например: Разработка системы мониторинга серверных ресурсов на базе Python"
            className="w-full px-4 py-3 glass-input rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 focus:outline-none transition-all resize-none text-sm"
          />

          {/* Быстрый выбор примеров */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-500 light:text-slate-600 flex items-center space-x-1">
              <Info className="w-3 h-3" />
              <span>Примеры:</span>
            </span>
            {sampleTopics.map((topic, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onChange({ title: topic })}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-200 hover:bg-indigo-950/60 dark:hover:bg-indigo-950/60 light:hover:bg-indigo-100 text-slate-300 dark:text-slate-300 light:text-slate-700 transition-colors border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300 text-left truncate max-w-xs cursor-pointer"
              >
                {topic}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Предмет и количество глав */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">Предмет / Дисциплина *</label>
            <input
              type="text"
              value={data.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder="Информационные технологии"
              className="w-full px-4 py-2.5 glass-input rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">Количество глав основного текста</label>
            <select
              value={data.chapterCount}
              onChange={(e) => onChange({ chapterCount: Number(e.target.value) })}
              className="w-full px-4 py-2.5 glass-input rounded-xl text-white dark:text-white light:text-slate-900 text-sm cursor-pointer"
            >
              <option value={2} className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white light:bg-white light:text-slate-900">2 главы (Теория + Практика)</option>
              <option value={3} className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white light:bg-white light:text-slate-900">3 главы (Стандарт ГОСТ: Теория, Анализ, Проект)</option>
              <option value={4} className="bg-slate-900 text-white dark:bg-slate-900 dark:text-white light:bg-white light:text-slate-900">4 главы (Глубокое исследование)</option>
            </select>
          </div>
        </div>

        {/* Дополнительные метаданные для титульного листа */}
        <div className="pt-4 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 light:text-slate-600 mb-4">
            Данные для титульного листа (опционально)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={data.authorName || ""}
                onChange={(e) => onChange({ authorName: e.target.value })}
                placeholder="ФИО Студента (Иванов И.И.)"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 text-sm"
              />
            </div>

            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={data.institution || ""}
                onChange={(e) => onChange({ institution: e.target.value })}
                placeholder="ВУЗ / Кафедра (МГТУ им. Баумана)"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 text-sm"
              />
            </div>

            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={data.city || ""}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Город (Москва)"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 text-sm"
              />
            </div>

            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="number"
                value={data.year || new Date().getFullYear()}
                onChange={(e) => onChange({ year: Number(e.target.value) })}
                placeholder="Год (2026)"
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-white dark:text-white light:text-slate-900 placeholder-slate-500 text-sm"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 3. Drag and Drop Загрузка Методички */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">3</span>
            <span>Загрузить методические указания / план (Опционально)</span>
          </span>
          <span className="text-xs text-indigo-400 dark:text-indigo-400 light:text-indigo-600 font-normal">ИИ адаптирует структуру под требования VUZ</span>
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!data.guideFile ? (
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-indigo-500 bg-indigo-500/10 scale-[1.01] shadow-glow-indigo"
                : "border-slate-800 dark:border-slate-800 light:border-slate-300 bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-200/50 hover:border-indigo-500/50 hover:bg-slate-900/70"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 dark:text-indigo-400 light:text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-glass-sm">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white dark:text-white light:text-slate-900 mb-1">
              Перетащите файл сюда или нажмите для выбора
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
              Поддерживаются файлы методических указаний в формате PDF, DOCX или TXT (до 20 МБ)
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-4 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 flex items-center justify-between shadow-glow-indigo"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white dark:text-white light:text-slate-900">{data.guideFile.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
                  {(data.guideFile.size / (1024 * 1024)).toFixed(2)} МБ • Успешно прикреплен
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Ошибка валидации с анимацией */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center space-x-2"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Кнопка "Далее" */}
      <div className="flex justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center space-x-2 group cursor-pointer glow-effect-indigo"
        >
          <span>Сформировать план документа (Шаг 2)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </form>
  );
};
