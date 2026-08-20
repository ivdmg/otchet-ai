import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  FileCheck,
  Cpu,
  BookOpen,
  Layers,
  FileText,
  Copy,
  Check
} from "lucide-react";
import { A4SkeletonPreview } from "./A4SkeletonPreview";
import { triggerSuccessConfetti } from "../../lib/confetti";

interface LogMessage {
  id: string;
  timestamp: string;
  step: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface GenerationProgressScreenProps {
  docId?: string;
  docTitle: string;
  onComplete: () => void;
}

const pipelineSteps = [
  { id: "OUTLINE", title: "Структура & AST", icon: Layers, desc: "JSON AST контракт" },
  { id: "INTRODUCTION", title: "Введение ГОСТ", icon: BookOpen, desc: "6 обязательных блоков" },
  { id: "CHAPTERS", title: "Главы исследования", icon: Cpu, desc: "Текст + Таблицы" },
  { id: "CONCLUSION", title: "Заключение", icon: FileText, desc: "Выводы по задачам" },
  { id: "BIBLIOGRAPHY", title: "Список источников", icon: Sparkles, desc: "ГОСТ Р 7.0.100" },
  { id: "DOCX_BUILD", title: "DOCX Engine", icon: FileCheck, desc: "Компиляция верстки A4" },
];

export const GenerationProgressScreen: React.FC<GenerationProgressScreenProps> = ({
  docId = "doc_demo_123",
  docTitle,
  onComplete,
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [status, setStatus] = useState<"processing" | "completed" | "failed">("processing");
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  useEffect(() => {
    if (status === "completed") {
      triggerSuccessConfetti();
    }
  }, [status]);

  const addLog = (message: string, step: string = "SYSTEM", type: LogMessage["type"] = "info") => {
    const timeStr = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setLogs((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), timestamp: timeStr, step, message, type },
    ]);
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.step}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: any = null;

    const startDemoSimulation = () => {
      let currentP = 0;
      let stepIdx = 0;

      fallbackInterval = setInterval(() => {
        currentP += Math.floor(Math.random() * 8) + 4;
        if (currentP >= 100) {
          currentP = 100;
          setProgressPercent(100);
          setCurrentStepIndex(5);
          setStatus("completed");
          addLog("Все главы сгенерированы! Верстка DOCX по ГОСТ 7.32 собрана.", "COMPILER", "success");
          clearInterval(fallbackInterval);
          return;
        }

        setProgressPercent(currentP);

        const newStepIdx = Math.min(Math.floor((currentP / 100) * pipelineSteps.length), 5);
        if (newStepIdx !== stepIdx) {
          stepIdx = newStepIdx;
          setCurrentStepIndex(stepIdx);
          const stepObj = pipelineSteps[stepIdx];
          addLog(`Переход к фазе: ${stepObj.title} - ${stepObj.desc}`, stepObj.id, "info");
        } else {
          if (Math.random() > 0.4) {
            const msgs = [
              "LLM оркестратор формирует академические формулировки по ГОСТ 7.32...",
              "Валидация JSON AST схемы через Zod...",
              "Проверка уникальности терминологии и логических связок...",
              "Генерация таблиц и форматирование сносок...",
              "Рендеринг MathML формул в бескаркасные таблицы...",
            ];
            addLog(msgs[Math.floor(Math.random() * msgs.length)], pipelineSteps[stepIdx].id, "info");
          }
        }
      }, 1100);
    };

    const wsUrl = `ws://${window.location.host}/ws/generation/${docId}`;
    addLog(`Подключение к серверам ИИ: ${wsUrl}`, "WS");

    try {
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        addLog("Соединение с WebSocket бэкендом установлено", "WS", "success");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.progress_percent !== undefined) {
            setProgressPercent(data.progress_percent);
          }
          if (data.message) {
            addLog(data.message, data.step || "LLM", "info");
          }
          if (data.status === "completed") {
            setStatus("completed");
            addLog("Генерация документа успешно завершена!", "DOCX", "success");
          } else if (data.status === "failed") {
            setStatus("failed");
            addLog(`Ошибка генерации: ${data.message}`, "ERROR", "error");
          }
        } catch (e) {
          console.error("WS Parse error", e);
        }
      };

      ws.onerror = () => {
        addLog("WebSocket не доступен. Переход в режим симуляции Celery воркера...", "WS", "warning");
        startDemoSimulation();
      };
    } catch (e) {
      startDemoSimulation();
    }

    return () => {
      if (ws) ws.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [docId]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Header Info */}
      <div className="dark-surface p-6 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-200 shadow-sm">
            <Sparkles className="w-5 h-5 text-zinc-200 animate-spin" style={{ animationDuration: "8s" }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                {status === "completed" ? "ГОТОВО" : "ГЕНЕРАЦИЯ ИИ"}
              </span>
              <span className="text-[11px] font-mono text-zinc-500">ID: {docId}</span>
            </div>
            <h2 className="text-base font-bold text-zinc-100 mt-1 max-w-xl line-clamp-1">{docTitle}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {status === "completed" ? (
            <button
              onClick={onComplete}
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition-all shadow-sm hover:shadow-glow-cold cursor-pointer active:scale-95"
            >
              <span>Открыть Web DOCX Viewer A4</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-xs font-mono text-zinc-400 bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-800">
              <Clock className="w-3.5 h-3.5 text-zinc-400 animate-pulse" />
              <span>Осталось ~ 20 сек</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar & Visual Pipeline */}
      <div className="dark-surface p-6 rounded-2xl border border-zinc-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Общий прогресс компиляции
          </span>
          <span className="text-2xl font-extrabold text-zinc-100 font-mono">{progressPercent}%</span>
        </div>

        {/* Minimalist Progress Bar */}
        <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800/80 relative shadow-inner">
          <motion.div
            className="h-full bg-zinc-100 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Pipeline Step Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex || status === "completed";
            const isCurrent = idx === currentStepIndex && status !== "completed";

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center space-y-2 ${
                  isDone
                    ? "bg-zinc-900/90 border-zinc-700 text-zinc-200"
                    : isCurrent
                    ? "bg-zinc-900 border-zinc-500 text-white shadow-glow-silver ring-1 ring-white/10"
                    : "bg-zinc-950/40 border-zinc-900 text-zinc-600"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                      : isCurrent
                      ? "bg-zinc-100 text-zinc-950"
                      : "bg-zinc-900 text-zinc-600 border border-zinc-800"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold truncate max-w-[100px]">{step.title}</p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[100px]">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live A4 Skeleton Shimmer Loader */}
      <A4SkeletonPreview progress={progressPercent} />

      {/* Terminal Log Console */}
      <div className="dark-surface rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
        {/* Terminal Header */}
        <div className="px-5 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-mono font-semibold text-zinc-300">
              LOG CONSOLE — Redis Pub/Sub & WebSocket Streaming
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyLogs}
              className="text-[11px] font-mono text-zinc-400 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Скопировано" : "Копировать"}</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
            </div>
          </div>
        </div>

        {/* Logs Output */}
        <div className="p-4 bg-[#09090b] font-mono text-xs text-zinc-300 h-64 overflow-y-auto space-y-1.5">
          <AnimatePresence>
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 hover:bg-zinc-900/60 p-1 rounded-lg transition-colors"
              >
                <span className="text-zinc-600 text-[11px] shrink-0 font-mono">{log.timestamp}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0 ${
                    log.type === "success"
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/80"
                      : log.type === "warning"
                      ? "bg-amber-950/60 text-amber-400 border border-amber-800/80"
                      : log.type === "error"
                      ? "bg-rose-950/60 text-rose-400 border border-rose-800/80"
                      : "bg-zinc-900 text-zinc-400 border border-zinc-800"
                  }`}
                >
                  [{log.step}]
                </span>
                <span className="flex-1 text-zinc-300 font-sans text-xs">{log.message}</span>
              </div>
            ))}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>
      </div>

    </div>
  );
};

export default GenerationProgressScreen;
