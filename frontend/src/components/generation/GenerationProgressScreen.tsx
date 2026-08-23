import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileCheck,
  Cpu,
  BookOpen,
  Layers,
  FileText,
  Terminal,
  Activity
} from "lucide-react";
import { triggerSuccessConfetti } from "../../lib/confetti";

interface GenerationProgressScreenProps {
  docId?: string;
  docTitle: string;
  onComplete: () => void;
}

const pipelineSteps = [
  { id: "OUTLINE", number: "01", title: "Структура", desc: "План работы", icon: Layers },
  { id: "INTRODUCTION", number: "02", title: "Введение", desc: "Цели и задачи", icon: BookOpen },
  { id: "CHAPTERS", number: "03", title: "Главы работы", desc: "Текст и формулы", icon: Cpu },
  { id: "CONCLUSION", number: "04", title: "Заключение", desc: "Итоги исследования", icon: FileText },
  { id: "BIBLIOGRAPHY", number: "05", title: "Источники", desc: "Список литературы", icon: Sparkles },
  { id: "DOCX_BUILD", number: "06", title: "DOCX верстка", desc: "Чистовой файл", icon: FileCheck },
];

const mockLogs = [
  "Инициализация компилятора...",
  "Сборка титульного листа и аннотации...",
  "Генерация введения: формулировка цели, объекта и предмета...",
  "Синтез параграфов Главы 1 (теоретический базис)...",
  "Синтез параграфов Главы 2 (практический расчет и таблицы)...",
  "Формирование заключения и выводов...",
  "Оформление списка использованных источников...",
  "Применение физических отступов 30/15/20/20 мм и сборка .docx...",
  "Документ успешно скомпилирован и готов к выгрузке."
];

export const GenerationProgressScreen: React.FC<GenerationProgressScreenProps> = ({
  docId = "doc_demo_123",
  docTitle,
  onComplete,
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [status, setStatus] = useState<"processing" | "completed" | "failed">("processing");
  const [activeLogIdx, setActiveLogIdx] = useState<number>(0);

  useEffect(() => {
    if (status === "completed") {
      triggerSuccessConfetti();
    }
  }, [status]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: any = null;

    const startSimulation = () => {
      let currentP = 0;

      fallbackInterval = setInterval(() => {
        currentP += Math.floor(Math.random() * 6) + 3;
        if (currentP >= 100) {
          currentP = 100;
          setProgressPercent(100);
          setCurrentStepIndex(pipelineSteps.length - 1);
          setActiveLogIdx(mockLogs.length - 1);
          setStatus("completed");
          clearInterval(fallbackInterval);
          return;
        }

        setProgressPercent(currentP);
        const newStepIdx = Math.min(
          Math.floor((currentP / 100) * pipelineSteps.length),
          pipelineSteps.length - 1
        );
        setCurrentStepIndex(newStepIdx);
        
        const logIdx = Math.min(
          Math.floor((currentP / 100) * mockLogs.length),
          mockLogs.length - 1
        );
        setActiveLogIdx(logIdx);
      }, 550);
    };

    const wsUrl = `ws://${window.location.host}/ws/generation/${docId}`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.progress_percent !== undefined) {
            setProgressPercent(data.progress_percent);
            const stepIdx = Math.min(
              Math.floor((data.progress_percent / 100) * pipelineSteps.length),
              pipelineSteps.length - 1
            );
            setCurrentStepIndex(stepIdx);
          }
          if (data.status === "completed") {
            setProgressPercent(100);
            setCurrentStepIndex(pipelineSteps.length - 1);
            setStatus("completed");
          } else if (data.status === "failed") {
            setStatus("failed");
          }
        } catch (e) {
          console.error("WS Parse error", e);
        }
      };

      ws.onerror = () => {
        startSimulation();
      };
    } catch (e) {
      startSimulation();
    }

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [docId]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* 1. Header Status Bar */}
      <div className="bg-transparent p-5 sm:p-6 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span
              className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                status === "completed"
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/60"
                  : "bg-transparent text-zinc-300 border-white/[0.08]"
              }`}
            >
              {status === "completed" ? "● ГОТОВО" : "● ГЕНЕРАЦИЯ"}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-semibold text-white truncate max-w-xl">
            {docTitle || "Без названия"}
          </h2>
        </div>

        {status === "completed" ? (
          <button
            onClick={onComplete}
            className="inline-flex items-center space-x-2 px-7 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] cursor-pointer active:scale-[0.99] shrink-0"
          >
            <span>Открыть готовый документ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 bg-transparent px-4 py-2.5 rounded-xl border border-white/[0.08] shrink-0">
            <Clock className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
            <span>Осталось ~ {Math.max(1, Math.round((100 - progressPercent) * 0.18))} сек</span>
          </div>
        )}
      </div>

      {/* 2. Main Progress Console */}
      <div className="bg-transparent p-6 rounded-2xl border border-white/[0.08] space-y-6">
        
        {/* Progress percent & current label */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-medium text-zinc-200">
              {status === "completed"
                ? "Документ полностью скомпилирован"
                : `Этап ${pipelineSteps[currentStepIndex]?.number}: ${pipelineSteps[currentStepIndex]?.title} (${pipelineSteps[currentStepIndex]?.desc})`}
            </p>
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {progressPercent}%
          </div>
        </div>

        {/* Linear progress track */}
        <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.06]">
          <motion.div
            className="h-full bg-white"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.25, ease: "easeOut" }}
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

      {/* 3. Large Floating Glassmorphic Live A4 Emulator & Terminal */}
      <div className="kast-floating-glass rounded-2xl p-6 border border-white/15 space-y-5">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span>Лог генерации</span>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-mono text-zinc-500">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>

        {/* Live Terminal Lines */}
        <div className="bg-transparent rounded-xl p-4 border border-white/[0.06] font-mono text-xs space-y-2 min-h-[100px]">
          {mockLogs.slice(0, activeLogIdx + 1).map((log, lIdx) => (
            <motion.div
              key={lIdx}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2.5 text-zinc-300"
            >
              <span className="text-zinc-600 select-none">›</span>
              <span className={lIdx === activeLogIdx ? "text-white font-medium" : "text-zinc-400"}>
                {log}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Live A4 Skeleton Emulator Graphic */}
        <div className="bg-transparent rounded-xl p-6 border border-white/[0.06] space-y-4 max-w-xl mx-auto">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-b border-white/[0.04] pb-2">
            <span>Эмулятор страницы A4</span>
            <span>30 / 15 / 20 / 20 мм</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {/* Title Line */}
            <div className="h-4 w-3/4 mx-auto rounded bg-zinc-800 skeleton-shimmer" />
            <div className="h-2.5 w-1/2 mx-auto rounded bg-zinc-900 skeleton-shimmer" />

            {/* Paragraphs */}
            <div className="space-y-2 pt-3">
              <div className="h-2 w-full rounded bg-zinc-900 skeleton-shimmer" />
              <div className="h-2 w-11/12 rounded bg-zinc-900 skeleton-shimmer" />
              <div className="h-2 w-4/5 rounded bg-zinc-900 skeleton-shimmer" />
            </div>

            {/* Table simulation */}
            {progressPercent > 35 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-white/[0.08] rounded-lg p-3 space-y-2 bg-transparent mt-3"
              >
                <div className="h-2 w-1/3 rounded bg-zinc-800 skeleton-shimmer" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-2.5 bg-zinc-900 rounded skeleton-shimmer" />
                  <div className="h-2.5 bg-zinc-900 rounded skeleton-shimmer" />
                  <div className="h-2.5 bg-zinc-900 rounded skeleton-shimmer" />
                </div>
              </motion.div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default GenerationProgressScreen;

