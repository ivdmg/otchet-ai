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
import { GlassCard } from "../ui/GlassCard";
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

  // Автопрокрутка консоли логов
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

  // WebSocket соединение и демо-эмуляция
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: any = null;

    // Режим симуляции генерации для фронтенд отладки
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

        // Обновление стадии
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
    <div className="w-full max-w-5xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="glass-panel p-6 rounded-3xl border border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-glass">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-glow-indigo">
            <Sparkles className="w-6 h-6 animate-spin text-indigo-400" style={{ animationDuration: "8s" }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {status === "completed" ? "ГОТОВО" : "ГЕНЕРАЦИЯ ИИ"}
              </span>
              <span className="text-xs text-slate-400">ID: {docId}</span>
            </div>
            <h2 className="text-xl font-bold text-white dark:text-white light:text-slate-900 mt-1 max-w-xl line-clamp-1">{docTitle}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {status === "completed" ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-600/30 flex items-center space-x-2 transition-all cursor-pointer glow-effect-gold"
            >
              <span>Открыть Web DOCX Viewer A4</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 bg-slate-900/80 dark:bg-slate-900/80 light:bg-slate-200 px-4 py-2 rounded-2xl border border-slate-800">
              <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>Осталось ~ 25 секунд</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar & Visual Pipeline */}
      <GlassCard variant="indigo" glow interactive={false} className="p-6 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-slate-800">
            Общий прогресс компиляции
          </span>
          <span className="text-3xl font-extrabold gradient-heading font-mono">{progressPercent}%</span>
        </div>

        {/* Animated Neon Glow Progress Bar */}
        <div className="w-full h-4 bg-slate-950 dark:bg-slate-950 light:bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-800/80 relative shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-400 rounded-full relative shadow-glow-indigo"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Pulsing tip glowing light */}
            <div className="absolute top-0 bottom-0 right-0 w-6 bg-white/50 blur-xs rounded-full animate-pulse" />
          </motion.div>
        </div>

        {/* Pipeline Step Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex || status === "completed";
            const isCurrent = idx === currentStepIndex && status !== "completed";

            return (
              <motion.div
                key={step.id}
                whileHover={{ scale: 1.02 }}
                className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-center space-y-2 ${
                  isDone
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-glow-emerald"
                    : isCurrent
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/50 shadow-glow-indigo"
                    : "bg-slate-900/40 dark:bg-slate-900/40 light:bg-slate-200/50 border-slate-800/80 text-slate-500"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isDone
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isCurrent
                      ? "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold truncate max-w-[100px]">{step.title}</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{step.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      {/* Live A4 Skeleton Shimmer Loader */}
      <A4SkeletonPreview progress={progressPercent} />

      {/* Terminal Log Console */}
      <div className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden shadow-glass">
        {/* Terminal Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-semibold text-slate-300">
              LOG CONSOLE — Redis Pub/Sub & WebSocket Streaming
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleCopyLogs}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Скопировано" : "Копировать"}</span>
            </button>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-mono text-emerald-400">LIVE FEED</span>
            </div>
          </div>
        </div>

        {/* Logs Output with Framer Motion entry animations */}
        <div className="p-4 bg-[#090d16] font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-2">
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start space-x-3 hover:bg-slate-900/60 p-1 rounded-lg transition-colors"
              >
                <span className="text-slate-500 text-[11px] shrink-0">{log.timestamp}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase shrink-0 ${
                    log.type === "success"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : log.type === "warning"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : log.type === "error"
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                  }`}
                >
                  [{log.step}]
                </span>
                <span className="flex-1 text-slate-300">{log.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
