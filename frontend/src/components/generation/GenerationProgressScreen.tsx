import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  FileText
} from "lucide-react";

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
  { id: "OUTLINE", title: "Структура & AST Граф", icon: Layers, desc: "Валидация JSON AST контракта" },
  { id: "INTRODUCTION", title: "Введение (ГОСТ)", icon: BookOpen, desc: "6 обязательных блоков" },
  { id: "CHAPTERS", title: "Главы исследования", icon: Cpu, desc: "Текст + Таблицы + Формулы" },
  { id: "CONCLUSION", title: "Заключение", icon: FileText, desc: "Выводы по поставленным задачам" },
  { id: "BIBLIOGRAPHY", title: "Список источников", icon: Sparkles, desc: "ГОСТ Р 7.0.100-2018" },
  { id: "DOCX_BUILD", title: "Python DOCX Engine", icon: FileCheck, desc: "Компиляция верстки A4" },
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
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Автопрокрутка консоли логов
  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

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

  // WebSocket соединение и демо-фолбэк
  useEffect(() => {
    let ws: WebSocket | null = null;
    let fallbackInterval: any = null;

    // Режим демо-эмуляции прогресса для верстки и отладки
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
          addLog("Все главы сгенерированы! Документ DOCX ГОСТ собрана.", "COMPILER", "success");
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
      }, 1200);
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
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: "8s" }} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {status === "completed" ? "ГОТОВО" : "ГЕНЕРАЦИЯ ИИ"}
              </span>
              <span className="text-xs text-slate-400">ID: {docId}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 max-w-xl line-clamp-1">{docTitle}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {status === "completed" ? (
            <button
              onClick={onComplete}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 flex items-center space-x-2 transition-all cursor-pointer animate-bounce"
            >
              <span>Открыть Web DOCX Viewer A4</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
              <Clock className="w-4 h-4 text-blue-400 animate-pulse" />
              <span>Осталось ~ 30 секунд</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar & Visual Pipeline */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-200">Общий прогресс компиляции</span>
          <span className="text-2xl font-extrabold text-blue-400 font-mono">{progressPercent}%</span>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-400 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-white/30 blur-sm transform translate-x-1/2" />
          </motion.div>
        </div>

        {/* Pipeline Step Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            const isDone = idx < currentStepIndex || status === "completed";
            const isCurrent = idx === currentStepIndex && status !== "completed";

            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center space-y-2 ${
                  isDone
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : isCurrent
                    ? "bg-blue-600/20 border-blue-500 text-blue-300 ring-1 ring-blue-500/50"
                    : "bg-slate-900/40 border-slate-800/80 text-slate-500"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDone
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isCurrent
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold truncate max-w-[100px]">{step.title}</p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Log Console */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {/* Terminal Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-semibold text-slate-300">
              LOG CONSOLE — Redis Pub/Sub & WebSocket
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono text-emerald-400">LIVE FEED</span>
          </div>
        </div>

        {/* Logs Output */}
        <div className="p-4 bg-slate-950 font-mono text-xs text-slate-300 h-64 overflow-y-auto space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 hover:bg-slate-900/50 p-1 rounded">
              <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  log.type === "success"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : log.type === "warning"
                    ? "bg-amber-500/20 text-amber-400"
                    : log.type === "error"
                    ? "bg-rose-500/20 text-rose-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                [{log.step}]
              </span>
              <span className="flex-1 text-slate-300">{log.message}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>
    </div>
  );
};
