import React from "react";
import { 
  Files, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { openPdfInBrowser } from "../../lib/pdfExport";

interface SampleWork {
  id: string;
  docType: "coursework" | "vkr" | "abstract";
  title: string;
  subject: string;
  originality: string;
  university: string;
}

const SAMPLE_WORKS: SampleWork[] = [
  {
    id: "sample_1",
    docType: "coursework",
    title: "Применение искусственного интеллекта в автоматизации банковских процессов",
    subject: "Информационные технологии и банковское дело",
    originality: "96.4% Антиплагиат",
    university: "НИУ ВШЭ (Факультет компьютерных наук)",
  },
  {
    id: "sample_2",
    docType: "vkr",
    title: "Правовое регулирование цифровых финансовых активов и криптовалют в РФ",
    subject: "Юриспруденция и финансовое право",
    originality: "94.8% Антиплагиат",
    university: "МГУ им. М.В. Ломоносова (Юридический факультет)",
  },
  {
    id: "sample_3",
    docType: "coursework",
    title: "Разработка микросервисной архитектуры высоконагруженных систем",
    subject: "Программная инженерия",
    originality: "97.2% Антиплагиат",
    university: "МГТУ им. Н.Э. Баумана (ИУ-7)",
  },
  {
    id: "sample_4",
    docType: "abstract",
    title: "Анализ современных методов оптимизации запросов в реляционных СУБД",
    subject: "Базы данных и аналитика данных",
    originality: "92.5% Антиплагиат",
    university: "ИТМО (Информационные технологии)",
  },
  {
    id: "sample_5",
    docType: "vkr",
    title: "Стратегическое управление конкурентоспособностью промышленного предприятия",
    subject: "Менеджмент и экономика предприятия",
    originality: "95.1% Антиплагиат",
    university: "СПбГУ (Высшая школа менеджмента)",
  },
  {
    id: "sample_6",
    docType: "coursework",
    title: "Методы машинного обучения в задачах кредитного скоринга и оценки рисков",
    subject: "Финансы и кредит / Data Science",
    originality: "93.9% Антиплагиат",
    university: "Финансовый университет при Правительстве РФ",
  },
];

interface SamplesSectionProps {
  onStartGenerator?: () => void;
}

export const SamplesSection: React.FC<SamplesSectionProps> = () => {
  const [showAllMobile, setShowAllMobile] = React.useState(false);

  const handleOpenPdf = (work: SampleWork) => {
    openPdfInBrowser({
      title: work.title,
      docType: work.docType,
      university: work.university,
      authorName: "Студент-исследователь",
      city: "Москва",
      year: 2026,
    });
  };

  return (
    <section id="examples" className="py-20 sm:py-28 border-t border-white/[0.08] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Section Header: strictly title only */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Примеры работ
          </h2>
        </div>

        {/* Lightweight Visual Document List / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE_WORKS.map((work, idx) => (
            <div
              key={work.id}
              onClick={() => handleOpenPdf(work)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenPdf(work);
                }
              }}
              className={`group relative rounded-2xl border border-white/[0.08] bg-[#0c0c10]/70 p-5 items-start space-x-4 cursor-pointer hover:border-white/25 hover:bg-[#121217] transition-all duration-200 active:scale-[0.99] select-none ${
                !showAllMobile && idx >= 3 ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Document Stack SVG Icon */}
              <div className="w-11 h-11 rounded-xl bg-zinc-900/90 border border-white/[0.1] flex items-center justify-center shrink-0 text-zinc-300 group-hover:text-white group-hover:border-white/30 transition-colors shadow-inner">
                <Files className="w-5 h-5" />
              </div>

              {/* Work Info */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3 
                  className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors leading-snug line-clamp-2"
                  title={work.title}
                >
                  {work.title}
                </h3>

                <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-emerald-400 font-medium">{work.originality}</span>
                </div>
              </div>

              {/* Subtle External View Arrow Indicator */}
              <div className="shrink-0 text-zinc-600 group-hover:text-zinc-300 transition-colors pt-1">
                <ExternalLink className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile toggle button */}
        <div className="md:hidden pt-1 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllMobile(!showAllMobile)}
            className="px-5 py-2 rounded-xl border border-white/[0.1] bg-zinc-900/80 hover:bg-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <span>{showAllMobile ? "Свернуть" : "Показать ещё"}</span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default SamplesSection;
