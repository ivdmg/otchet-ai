import React from "react";
import { 
  UploadCloud, 
  GitBranch, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  FileText,
  Settings2,
  FileDown
} from "lucide-react";

interface StepItem {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: React.ReactNode;
  details: string[];
}

const STEPS: StepItem[] = [
  {
    number: "01",
    title: "Ввод данных",
    subtitle: "Загрузка темы, методички вуза или черновика плана",
    description: "Укажите дисциплину, тему и требования. Система принимает методические указания в PDF или DOCX для точной подстройки параметров.",
    badge: "Входные параметры",
    icon: <UploadCloud className="w-5 h-5 text-zinc-300" />,
    details: ["Распознавание тем и планов", "Анализ методички ВУЗа", "Выбор объема страниц"]
  },
  {
    number: "02",
    title: "Утверждение структуры",
    subtitle: "Быстрая корректировка содержания и глав в редакторе",
    description: "ИИ формирует сбалансированное оглавление по разделам. Добавляйте свои пункты, меняйте структуру или утверждайте план в один клик.",
    badge: "Интерактивный AST",
    icon: <GitBranch className="w-5 h-5 text-zinc-300" />,
    details: ["Дерево глав и параграфов", "Редактирование тезисов", "Точечная регенерация"]
  },
  {
    number: "03",
    title: "Скачивание .docx",
    subtitle: "Мгновенная компиляция документа с выверенной версткой",
    description: "Python-компилятор детерминированно собирает файл по правилам ГОСТ: точные поля, шрифт, формулы, таблицы и список литературы.",
    badge: "Готовый результат",
    icon: <FileDown className="w-5 h-5 text-zinc-300" />,
    details: ["Формат Microsoft Word (.docx)", "Сохраненные стили оформления", "Проход нормоконтроля"]
  }
];

export const PipelineSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden border-t border-zinc-900">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-zinc-800/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span>[ ПАЙПЛАЙН РАБОТЫ ]</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            3 шага от идеи до готового документа
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Процесс автоматизирован от анализа требований до компиляции чистового файла Microsoft Word.
          </p>
        </div>

        {/* 3-Step Horizontal Cards Grid with subtle connection lines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className="dark-surface dark-surface-hover rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative group"
            >
              {/* Top Row: Monospace Step Number & Badge */}
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-zinc-500 group-hover:text-zinc-200 transition-colors">
                    {step.number}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
                      {step.badge}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 group-hover:border-zinc-700 transition-all">
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* Step Title & Subtitle */}
                <div className="space-y-2 mb-4">
                  <h3 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors">
                    {step.number} / {step.title}
                  </h3>
                  <p className="text-xs font-medium text-zinc-400 leading-snug">
                    {step.subtitle}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-normal">
                  {step.description}
                </p>
              </div>

              {/* Step Details Bullet List */}
              <div className="pt-4 border-t border-zinc-800/80 space-y-2">
                {step.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-[11px] font-mono text-zinc-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-zinc-300 transition-colors shrink-0" />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              {/* Connecting line badge between steps (for desktop) */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 items-center justify-center text-zinc-400 shadow-md pointer-events-none">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default PipelineSection;
