import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  FileCheck,
  Cpu,
  BookOpen,
  Layers,
  FileText,
  Sparkles,
  Download,
  Eye
} from "lucide-react";
import { openPdfInBrowser } from "../../lib/pdfExport";
import { DownloadFormatModal } from "../modals/DownloadFormatModal";
import { useUserStore } from "../../store/useUserStore";

interface GenerationProgressScreenProps {
  docId?: string;
  docTitle: string;
  onComplete: () => void;
}

const pipelineSteps = [
  { id: "OUTLINE", number: "01", title: "Структура", desc: "План разделов", icon: Layers },
  { id: "INTRODUCTION", number: "02", title: "Введение", desc: "Цели и задачи", icon: BookOpen },
  { id: "CHAPTERS", number: "03", title: "Главы работы", desc: "Текст, формулы и таблицы", icon: Cpu },
  { id: "CONCLUSION", number: "04", title: "Заключение", desc: "Итоги исследования", icon: FileText },
  { id: "BIBLIOGRAPHY", number: "05", title: "Источники", desc: "Список литературы", icon: Sparkles },
  { id: "DOCX_BUILD", number: "06", title: "Нормоконтроль", desc: "Верстка по ГОСТ 7.32", icon: FileCheck },
];

export const GenerationProgressScreen: React.FC<GenerationProgressScreenProps> = ({
  docTitle,
  onComplete,
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [status, setStatus] = useState<"processing" | "completed">("processing");
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const { user } = useUserStore();

  useEffect(() => {
    let currentP = 0;
    const interval = setInterval(() => {
      currentP += Math.floor(Math.random() * 4) + 2;

      if (currentP >= 100) {
        currentP = 100;
        setProgressPercent(100);
        setCurrentStepIndex(pipelineSteps.length - 1);
        setStatus("completed");
        onComplete();
        clearInterval(interval);
        return;
      }

      setProgressPercent(currentP);
      const stepIdx = Math.min(
        Math.floor((currentP / 100) * pipelineSteps.length),
        pipelineSteps.length - 1
      );
      setCurrentStepIndex(stepIdx);
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const handleOpenPdf = () => {
    openPdfInBrowser({
      title: docTitle || "Научно-исследовательская работа",
      docType: "coursework",
      authorName: user.titleDefaults.studentName || user.name,
      university: user.titleDefaults.university,
      department: user.titleDefaults.department,
      city: user.titleDefaults.city,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* 1. Header Status Bar */}
      <div className="bg-[#0c0c10]/80 p-5 sm:p-6 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          {status === "completed" && (
            <div className="flex items-center space-x-2 pb-1">
              <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-600 text-white border border-emerald-500 shadow-sm inline-flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>ДОКУМЕНТ ГОТОВ</span>
              </span>
            </div>
          )}
          <h2 className="text-base sm:text-lg font-semibold text-white break-words max-w-xl">
            {docTitle || "Без названия"}
          </h2>
        </div>

        {status === "completed" ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleOpenPdf}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-all shadow-md cursor-pointer active:scale-95"
            >
              <Eye className="w-4 h-4" />
              <span>Открыть PDF в браузере</span>
            </button>

            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.1] font-semibold text-xs transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Скачать (.docx / .pdf)</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 bg-zinc-900/60 px-4 py-2.5 rounded-xl border border-white/[0.08] shrink-0">
            <Clock className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
            <span>Осталось ~ {Math.max(1, Math.round((100 - progressPercent) * 0.15))} сек</span>
          </div>
        )}
      </div>

      {/* 2. Main Progress Console */}
      <div className="bg-[#0c0c10]/70 p-6 rounded-2xl border border-white/[0.08] space-y-6">
        
        {/* Progress percent & current label */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-zinc-200">
              {status === "completed"
                ? "Генерация завершена со 100% соблюдением ГОСТ 7.32-2017"
                : `Этап ${pipelineSteps[currentStepIndex]?.number}: ${pipelineSteps[currentStepIndex]?.title} — ${pipelineSteps[currentStepIndex]?.desc}`}
            </p>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {progressPercent}%
          </div>
        </div>

        {/* Linear progress track */}
        <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.06]">
          <motion.div
            className="h-full bg-gradient-to-r from-zinc-300 to-white"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Pipeline 6-Step Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
          {pipelineSteps.map((step, idx) => {
            const isDone = idx < currentStepIndex || status === "completed";
            const isCurrent = idx === currentStepIndex && status !== "completed";

            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border text-center flex flex-col items-center justify-center space-y-2 transition-all ${
                  isDone
                    ? "bg-transparent border-emerald-500/40 text-zinc-200"
                    : isCurrent
                    ? "bg-transparent border-white/60 text-white shadow-[0_0_20px_rgba(255,255,255,0.08)]"
                    : "bg-transparent border-white/[0.04] text-zinc-600"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs transition-colors ${
                    isDone
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold"
                      : isCurrent
                      ? "bg-white text-zinc-950 font-bold"
                      : "bg-transparent text-zinc-600 border border-white/[0.06]"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span>{step.number}</span>}
                </div>
                <div className="w-full space-y-0.5">
                  <p className="text-[11px] font-semibold truncate">{step.title}</p>
                  <p className="text-[9px] font-mono text-zinc-500 truncate">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unified Download Modal */}
      <DownloadFormatModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        docTitle={docTitle}
        docType="coursework"
        authorName={user.titleDefaults.studentName || user.name}
        institution={user.titleDefaults.university}
      />

    </div>
  );
};

export default GenerationProgressScreen;
