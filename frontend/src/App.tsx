import React, { useState } from "react";
import { LandingPage } from "./components/landing/LandingPage";
import { WizardContainer } from "./components/wizard/WizardContainer";
import { UserDashboard } from "./components/dashboard/UserDashboard";
import { SeoHead } from "./components/landing/SeoHead";
import { ArrowLeft, User, FileText, Sparkles } from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"landing" | "wizard" | "dashboard">("landing");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setActiveTab("wizard");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative selection:bg-zinc-700 selection:text-white font-sans">
      <SeoHead activeTab={activeTab} />

      {activeTab === "landing" ? (
        <LandingPage
          onStartGenerator={() => setActiveTab("wizard")}
          onOpenDashboard={() => setActiveTab("dashboard")}
          onSelectPlan={handleSelectPlan}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      ) : (
        <div className="min-h-screen flex flex-col">
          {/* App Header for Wizard and Dashboard */}
          <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-black/50 border-b border-zinc-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab("landing")}
                className="flex items-center space-x-2 text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-colors px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>На главную</span>
              </button>

              <div 
                onClick={() => setActiveTab("landing")}
                className="hidden sm:flex items-center space-x-2 cursor-pointer pl-2"
              >
                <span className="font-mono text-xs font-bold text-zinc-200">◆ GOST.DOCX</span>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                  v2.4
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab("wizard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                  activeTab === "wizard"
                    ? "bg-zinc-800 text-white border-zinc-600 shadow-sm"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                Генератор (Wizard)
              </button>

              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                  activeTab === "dashboard"
                    ? "bg-zinc-800 text-white border-zinc-600 shadow-sm"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Личный кабинет</span>
              </button>
            </div>
          </header>

          {/* Main App Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
            {activeTab === "dashboard" ? (
              <UserDashboard
                onNewDocument={() => setActiveTab("wizard")}
                onViewDocument={() => setActiveTab("wizard")}
              />
            ) : (
              <div className="space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                    Генерация работы по ГОСТ 7.32-2017
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400">
                    Заполните вводные данные, скорректируйте структуру и соберите чистовой .docx файл
                  </p>
                </div>
                <WizardContainer />
              </div>
            )}
          </main>

          {/* App Footer */}
          <footer className="border-t border-zinc-900 px-6 py-6 text-center text-xs font-mono text-zinc-600">
            © 2026 GOST.DOCX Engine • Все права защищены.
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;
