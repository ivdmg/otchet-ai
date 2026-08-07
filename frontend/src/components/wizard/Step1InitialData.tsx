import React, { useState, useRef } from "react";
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
  Calendar 
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
        <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
          <span>1. Выберите тип академической работы</span>
          <span className="text-xs text-slate-400 font-normal">Стандарт ГОСТ 7.32-2017</span>
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
                    ? "bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500"
                    : "glass-card hover:border-slate-600"
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-blue-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isSelected ? "bg-blue-500 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-white text-base mb-1">{item.label}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Исходные данные работы */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
        <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Тема и параметры документа</span>
        </h2>

        {/* Тема работы */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
            <span>Тема работы *</span>
            <span className="text-xs text-slate-400">Точное наименование темы</span>
          </label>
          <textarea
            rows={2}
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Например: Разработка системы мониторинга серверных ресурсов на базе Python"
            className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none text-sm"
          />

          {/* Быстрый выбор примеров */}
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs text-slate-500 flex items-center space-x-1">
              <Info className="w-3 h-3" />
              <span>Примеры:</span>
            </span>
            {sampleTopics.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange({ title: topic })}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700/50 text-left truncate max-w-xs"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Предмет и количество глав */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Предмет / Дисциплина *</label>
            <input
              type="text"
              value={data.subject}
              onChange={(e) => onChange({ subject: e.target.value })}
              placeholder="Информационные технологии"
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Количество глав основного текста</label>
            <select
              value={data.chapterCount}
              onChange={(e) => onChange({ chapterCount: Number(e.target.value) })}
              className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
            >
              <option value={2}>2 главы (Теория + Практика)</option>
              <option value={3}>3 главы (Стандарт ГОСТ: Теория, Анализ, Проект)</option>
              <option value={4}>4 главы (Глубокое исследование)</option>
            </select>
          </div>
        </div>

        {/* Дополнительные метаданные для титульного листа */}
        <div className="pt-4 border-t border-slate-800/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={data.institution || ""}
                onChange={(e) => onChange({ institution: e.target.value })}
                placeholder="ВУЗ / Кафедра (МГТУ им. Баумана)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={data.city || ""}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="Город (Москва)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
              />
            </div>

            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="number"
                value={data.year || new Date().getFullYear()}
                onChange={(e) => onChange({ year: Number(e.target.value) })}
                placeholder="Год (2026)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Drag and Drop Загрузка Методички */}
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-200 flex items-center justify-between">
          <span>3. Загрузить методические указания / план (Опционально)</span>
          <span className="text-xs text-blue-400">ИИ адаптирует структуру под требования VUZ</span>
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
                ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                : "border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-900/80"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Перетащите файл сюда или нажмите для выбора
            </p>
            <p className="text-xs text-slate-400">
              Поддерживаются файлы методических указаний в формате PDF, DOCX или TXT (до 20 МБ)
            </p>
          </div>
        ) : (
          <div className="glass-card p-4 rounded-xl border border-blue-500/30 bg-blue-950/20 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{data.guideFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(data.guideFile.size / (1024 * 1024)).toFixed(2)} МБ • Успешно прикреплен
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Ошибка валидации */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Кнопка "Далее" */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center space-x-2 group cursor-pointer"
        >
          <span>Сформировать план документа (Шаг 2)</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </form>
  );
};
