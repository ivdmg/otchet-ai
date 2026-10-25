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
    <div className="min-h-screen kast-bg text-zinc-100 flex flex-col relative selection:bg-zinc-700 selection:text-white font-sans antialiased">
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
          <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#060608]/90 border-b border-white/[0.08] px-3 sm:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <button
                onClick={() => setActiveTab("landing")}
                className="h-9 px-3 rounded-xl bg-transparent border border-white/[0.08] hover:border-white/20 text-xs font-mono text-zinc-300 hover:text-white transition-colors flex items-center space-x-1.5 cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">На главную</span>
                <span className="xs:hidden sm:hidden">Назад</span>
              </button>

              <div 
                onClick={() => setActiveTab("landing")}
                className="flex items-center space-x-1.5 cursor-pointer pl-1 sm:pl-2"
              >
                <span className="font-mono text-xs font-bold tracking-tight text-zinc-100">◆ ГОСТ <span className="text-zinc-500">docx</span></span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 p-1 bg-zinc-950/80 rounded-xl border border-white/[0.08] shrink-0">
              <button
                onClick={() => setActiveTab("wizard")}
                className={`h-8 px-2.5 sm:px-3 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center justify-center ${
                  activeTab === "wizard"
                    ? "bg-white text-zinc-950 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Генератор
              </button>

              <button
                onClick={() => setActiveTab("dashboard")}
                className={`h-8 flex items-center space-x-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-white text-zinc-950 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Личный кабинет</span>
                <span className="sm:hidden">Кабинет</span>
              </button>
            </div>
          </header>

          {/* Main App Body */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
            {activeTab === "dashboard" ? (
              <UserDashboard
                onNewDocument={() => setActiveTab("wizard")}
                onViewDocument={() => setActiveTab("wizard")}
              />
            ) : (
              <div className="space-y-6">
                <div className="text-center max-w-3xl mx-auto space-y-2 mb-8 sm:mb-10">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold kast-gradient-title tracking-tight">
                    Генерация работы
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
                    Заполните параметры, настройте структуру и скачайте чистовой .docx документ
                  </p>
                </div>
                <WizardContainer initialPlanId={selectedPlanId} />
              </div>
            )}
          </main>

          {/* App Footer */}
          <footer className="border-t border-white/[0.06] px-6 py-6 text-center text-xs font-mono text-zinc-500">
            © 2026 ГОСТ docx • Все права защищены.
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;
