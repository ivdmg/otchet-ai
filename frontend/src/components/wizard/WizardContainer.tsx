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
  { id: 1, number: "01", name: "Исходные данные", desc: "Тема и ГОСТ параметры", icon: FileText },
  { id: 2, number: "02", name: "План документа", desc: "AST Tree структура", icon: Sliders },
  { id: 3, number: "03", name: "Генерация", desc: "Сборка документа", icon: PlayCircle },
  { id: 4, number: "04", name: "Готовый DOCX", desc: "Просмотр и экспорт", icon: Eye },
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
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Top Stepper Navigation (Minimalist Dark Rail) */}
      <div className="mb-8 p-4 sm:p-6 dark-surface rounded-2xl border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between relative max-w-4xl mx-auto">
          
          {/* Progress bar background line */}
          <div className="absolute top-5 left-8 right-8 h-[2px] bg-zinc-800 -translate-y-1/2 z-0 rounded-full" />
          
          {/* Active progress track */}
          <motion.div
            className="absolute top-5 left-8 h-[2px] bg-zinc-300 -translate-y-1/2 z-0 rounded-full shadow-sm"
            initial={false}
            animate={{
              width: `calc(${((currentStep - 1) / (wizardSteps.length - 1)) * 100}% - 4rem)`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {wizardSteps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => step.id < currentStep && goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-all duration-200 ${
                    isCompleted
                      ? "bg-zinc-800 text-zinc-100 border border-zinc-600 hover:border-zinc-400 cursor-pointer shadow-sm"
                      : isCurrent
                      ? "bg-zinc-100 text-zinc-950 ring-4 ring-zinc-700/40 shadow-lg shadow-black/50"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </button>

                <div className="mt-2.5 text-center">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? "text-zinc-100 font-bold"
                        : isCompleted
                        ? "text-zinc-300"
                        : "text-zinc-500"
                    }`}
                  >
                    <span className="font-mono text-[11px] mr-1 hidden sm:inline">{step.number}.</span>
                    {step.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 hidden sm:block font-mono mt-0.5">
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
