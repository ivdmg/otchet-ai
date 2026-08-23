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
          <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#060608]/80 border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab("landing")}
                className="flex items-center space-x-2 text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-colors px-3 py-1.5 rounded-xl bg-transparent border border-white/[0.08] hover:border-white/20 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>На главную</span>
              </button>

              <div 
                onClick={() => setActiveTab("landing")}
                className="hidden sm:flex items-center space-x-2 cursor-pointer pl-3"
              >
                <span className="font-mono text-xs font-semibold tracking-wider text-zinc-200">◆ DOCX.AI</span>
                <span className="text-[10px] font-mono text-zinc-500 bg-transparent px-1.5 py-0.5 rounded border border-white/[0.08]">
                  v2.4
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1.5 p-1 bg-transparent rounded-xl border border-white/[0.08]">
              <button
                onClick={() => setActiveTab("wizard")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeTab === "wizard"
                    ? "bg-white text-zinc-950 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Генератор
              </button>

              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-white text-zinc-950 font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Личный кабинет</span>
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
                <WizardContainer />
              </div>
            )}
          </main>

          {/* App Footer */}
          <footer className="border-t border-white/[0.06] px-6 py-6 text-center text-xs font-mono text-zinc-600">
            © 2026 DOCX AI Engine • Все права защищены.
          </footer>
        </div>
      )}
    </div>
  );
};

export default App;
