import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, FileText, Sliders, PlayCircle } from "lucide-react";
import { Step1InitialData } from "./Step1InitialData";
import { AstTreeEditor } from "../ast/AstTreeEditor";
import { GenerationProgressScreen } from "../generation/GenerationProgressScreen";
import { WizardFormData, initialWizardData } from "./types";
import { OutlineAST } from "../../schemas/docAstSchema";

const wizardSteps = [
  { id: 1, number: "01", name: "Параметры", desc: "Тема и объем", icon: FileText },
  { id: 2, number: "02", name: "Структура", desc: "План документа", icon: Sliders },
  { id: 3, number: "03", name: "Генерация", desc: "Сборка разделов", icon: PlayCircle },
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

interface WizardContainerProps {
  initialPlanId?: string | null;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({ initialPlanId }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(() => {
    if (initialPlanId === "abstract" || initialPlanId === "referat") {
      return { ...initialWizardData, docType: "abstract", pageCount: 18, chapterCount: 2 };
    }
    if (initialPlanId === "vkr") {
      return { ...initialWizardData, docType: "vkr", pageCount: 65, chapterCount: 3 };
    }
    return initialWizardData;
  });
  const [astOutline, setAstOutline] = useState<OutlineAST | undefined>(undefined);

  useEffect(() => {
    if (initialPlanId === "abstract" || initialPlanId === "referat") {
      setFormData((prev) => ({ ...prev, docType: "abstract", pageCount: 18, chapterCount: 2 }));
    } else if (initialPlanId === "vkr") {
      setFormData((prev) => ({ ...prev, docType: "vkr", pageCount: 65, chapterCount: 3 }));
    } else if (initialPlanId === "coursework") {
      setFormData((prev) => ({ ...prev, docType: "coursework", pageCount: 35, chapterCount: 3 }));
    }
  }, [initialPlanId]);

  const handleDataChange = (patch: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const goToStep = (step: number) => {
    setDirection(step > currentStep ? 1 : -1);
    setCurrentStep(step);
    setMaxUnlockedStep((prev) => Math.max(prev, step));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
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

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Top Stepper Navigation (3 Steps) */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden bg-transparent">
        <div className="flex items-center justify-between relative max-w-2xl mx-auto">
          
          {/* Progress bar background line */}
          <div className="absolute top-5 left-12 right-12 h-[1px] bg-white/[0.08] -translate-y-1/2 z-0" />
          
          {/* Active progress track */}
          <motion.div
            className="absolute top-5 left-12 h-[2px] bg-emerald-500 -translate-y-1/2 z-0"
            initial={false}
            animate={{
              width: `calc(${((currentStep - 1) / (wizardSteps.length - 1)) * 100}% - 3rem)`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          {wizardSteps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isUnlocked = step.id <= maxUnlockedStep;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isUnlocked && goToStep(step.id)}
                  disabled={!isUnlocked}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono text-xs transition-all duration-300 relative ${
                    isCurrent
                      ? "bg-white text-zinc-950 font-bold shadow-lg ring-4 ring-white/10 scale-105"
                      : isCompleted || isUnlocked
                      ? "bg-emerald-600 text-white font-bold border border-emerald-500 shadow-md cursor-pointer hover:bg-emerald-500"
                      : "bg-[#18181b] text-zinc-600 border border-white/[0.06] cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </button>

                <div className="text-center mt-2">
                  <p
                    className={`text-xs font-mono tracking-tight transition-colors ${
                      isCurrent
                        ? "text-white font-semibold"
                        : isCompleted || isUnlocked
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
              onComplete={() => {}}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WizardContainer;
