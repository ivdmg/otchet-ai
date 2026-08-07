import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, FileText, Sliders, PlayCircle, Eye } from "lucide-react";
import { Step1InitialData } from "./Step1InitialData";
import { AstTreeEditor } from "../ast/AstTreeEditor";
import { GenerationProgressScreen } from "../generation/GenerationProgressScreen";
import { WebDocxViewerA4 } from "../viewer/WebDocxViewerA4";
import { WizardFormData, initialWizardData } from "./types";
import { OutlineAST } from "../../schemas/docAstSchema";

const wizardSteps = [
  { id: 1, name: "Исходные данные", desc: "Тема и тип работы", icon: FileText },
  { id: 2, name: "План документа", desc: "AST Tree Editor", icon: Sliders },
  { id: 3, name: "Генерация", desc: "WebSocket Стриминг", icon: PlayCircle },
  { id: 4, name: "Просмотр & ГОСТ", desc: "Web DOCX Viewer A4", icon: Eye },
];

export const WizardContainer: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(initialWizardData);
  const [astOutline, setAstOutline] = useState<OutlineAST | undefined>(undefined);

  const handleDataChange = (patch: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleSaveOutline = (outline: OutlineAST) => {
    setAstOutline(outline);
    setCurrentStep(3);
  };

  const handleGenerationComplete = () => {
    setCurrentStep(4);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Step Stepper Navigation */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          {/* Progress bar background line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (wizardSteps.length - 1)) * 100}%` }}
          />

          {wizardSteps.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  disabled={step.id > currentStep}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    isCompleted
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 cursor-pointer"
                      : isCurrent
                      ? "bg-gradient-to-tr from-blue-600 to-indigo-500 text-white ring-4 ring-blue-500/20 shadow-xl shadow-blue-500/30"
                      : "bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </button>
                <div className="mt-3 text-center">
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent ? "text-blue-400" : isCompleted ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-[10px] text-slate-500 hidden sm:block">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
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
