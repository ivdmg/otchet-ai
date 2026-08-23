import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, FileText, Sliders, PlayCircle, Eye } from "lucide-react";
import { Step1InitialData } from "./Step1InitialData";
import { AstTreeEditor } from "../ast/AstTreeEditor";
import { GenerationProgressScreen } from "../generation/GenerationProgressScreen";
import { WebDocxViewerA4 } from "../viewer/WebDocxViewerA4";
import { WizardFormData, initialWizardData } from "./types";
import { OutlineAST } from "../../schemas/docAstSchema";

const wizardSteps = [
  { id: 1, number: "01", name: "Параметры", desc: "Тема и объем", icon: FileText },
  { id: 2, number: "02", name: "Структура", desc: "План документа", icon: Sliders },
  { id: 3, number: "03", name: "Генерация", desc: "Сборка разделов", icon: PlayCircle },
  { id: 4, number: "04", name: "Результат", desc: "Просмотр и экспорт", icon: Eye },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
    scale: 0.99,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
    scale: 0.99,
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
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Top Stepper Navigation (Minimalist Rail) */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden bg-transparent">
        <div className="flex items-center justify-between relative max-w-4xl mx-auto">
          
          {/* Progress bar background line */}
          <div className="absolute top-5 left-8 right-8 h-[1px] bg-white/[0.08] -translate-y-1/2 z-0" />
          
          {/* Active progress track */}
          <motion.div
            className="absolute top-5 left-8 h-[1px] bg-gradient-to-r from-emerald-400 via-emerald-400 to-white -translate-y-1/2 z-0"
            initial={false}
            animate={{
              width: `calc(${((currentStep - 1) / (wizardSteps.length - 1)) * 100}% - 4rem)`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {wizardSteps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => step.id < currentStep && goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-mono font-semibold text-xs transition-all duration-200 ${
                    isCurrent
                      ? "bg-white text-zinc-950 shadow-[0_0_25px_rgba(255,255,255,0.25)] ring-2 ring-white/20"
                      : isCompleted
                      ? "bg-emerald-500 text-zinc-950 font-bold border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer hover:bg-emerald-400 active:scale-95"
                      : "bg-transparent border border-white/[0.06] text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-zinc-950 stroke-[3]" />
                  ) : (
                    <span className="font-mono">{step.number}</span>
                  )}
                </button>

                <div className="mt-2.5 text-center">
                  <p
                    className={`text-xs font-medium ${
                      isCurrent
                        ? "text-white font-semibold"
                        : isCompleted
                        ? "text-emerald-400 font-semibold"
                        : "text-zinc-500"
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 hidden sm:block font-mono mt-0.5 tracking-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Container with Slide Transitions */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.2,
            ease: "easeInOut",
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
              docSubject={formData.subject}
              docType={formData.docType}
              chapterCount={formData.chapterCount}
              targetPages={formData.pageCount}
              customPrompt={formData.customPrompt}
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

export default WizardContainer;
