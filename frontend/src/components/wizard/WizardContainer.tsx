import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, FileText, Sliders, PlayCircle, Eye, ChevronRight } from "lucide-react";
import { Step1InitialData } from "./Step1InitialData";
import { AstTreeEditor } from "../ast/AstTreeEditor";
import { GenerationProgressScreen } from "../generation/GenerationProgressScreen";
import { WebDocxViewerA4 } from "../viewer/WebDocxViewerA4";
import { WizardFormData, initialWizardData } from "./types";
import { OutlineAST } from "../../schemas/docAstSchema";

const wizardSteps = [
  { id: 1, name: "Исходные данные", desc: "Тема и ГОСТ настройки", icon: FileText },
  { id: 2, name: "План документа", desc: "AST Tree Editor", icon: Sliders },
  { id: 3, name: "Генерация", desc: "WebSocket Стриминг", icon: PlayCircle },
  { id: 4, name: "Просмотр & ГОСТ", desc: "Web DOCX Viewer A4", icon: Eye },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.98,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 120 : -120,
    opacity: 0,
    scale: 0.98,
    filter: "blur(4px)",
  }),
};

export const WizardContainer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(initialWizardData);
  const [astOutline, setAstOutline] = useState<OutlineAST | undefined>(undefined);

  const handleDataChange = (patch: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      goToStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      goToStep(currentStep - 1);
    }
  };

  const handleSaveOutline = (outline: OutlineAST) => {
    setAstOutline(outline);
    goToStep(3);
  };

  const handleGenerationComplete = () => {
    goToStep(4);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Header Info Pill */}
      <div className="flex items-center justify-between mb-8 px-4 py-3 glass-panel rounded-2xl border border-indigo-500/20 shadow-glass-sm">
        <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-400 dark:text-indigo-400 light:text-indigo-600">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
            Шаг {currentStep} из {wizardSteps.length}
          </span>
          <span className="text-slate-400 dark:text-slate-400 light:text-slate-600 font-normal hidden sm:inline">
            — {wizardSteps[currentStep - 1].name}
          </span>
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 flex items-center space-x-1">
          <span>ГОСТ 7.32-2017 Compliance</span>
          <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
        </div>
      </div>

      {/* Step Stepper Navigation */}
      <div className="mb-10 p-6 glass-panel rounded-3xl border border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 relative overflow-hidden">
        <div className="flex items-center justify-between relative">
          {/* Progress bar background line */}
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-800 dark:bg-slate-800 light:bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
          <motion.div
            className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 -translate-y-1/2 z-0 rounded-full shadow-glow-indigo"
            initial={false}
            animate={{
              width: `calc(${((currentStep - 1) / (wizardSteps.length - 1)) * 100}% - 2rem)`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {wizardSteps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <motion.button
                  whileHover={step.id <= currentStep ? { scale: 1.08 } : {}}
                  whileTap={step.id <= currentStep ? { scale: 0.95 } : {}}
                  type="button"
                  onClick={() => step.id < currentStep && goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
                      : isCurrent
                      ? "bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 text-white ring-4 ring-indigo-500/25 shadow-xl shadow-indigo-500/40 glow-effect-indigo"
                      : "bg-slate-900 dark:bg-slate-900 light:bg-slate-200 border border-slate-800 dark:border-slate-800 light:border-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </motion.button>
                <div className="mt-3 text-center">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? "text-indigo-400 dark:text-indigo-400 light:text-indigo-600"
                        : isCompleted
                        ? "text-slate-300 dark:text-slate-300 light:text-slate-700"
                        : "text-slate-500"
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 light:text-slate-500 hidden sm:block">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Container with Framer Motion Slide Transitions */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.25 },
            scale: { duration: 0.25 },
          }}
          className="w-full"
        >
          {currentStep === 1 && (
            <Step1InitialData
              data={formData}
              onChange={handleDataChange}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <AstTreeEditor
              initialOutline={astOutline}
              docTitle={formData.title}
              docType={formData.docType}
              onSave={handleSaveOutline}
              onBack={handlePrevStep}
            />
          )}

          {currentStep === 3 && (
            <GenerationProgressScreen
              docTitle={formData.title || "Документ ГОСТ"}
              onComplete={handleGenerationComplete}
            />
          )}

          {currentStep === 4 && (
            <WebDocxViewerA4
              docTitle={formData.title || "Сгенерированный документ ГОСТ"}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
