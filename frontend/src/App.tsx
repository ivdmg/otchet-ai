import React, { useState } from "react";
import { FileText, ArrowRight, Sparkles, Layers, Zap, ShieldCheck, User } from "lucide-react";
import { motion } from "framer-motion";
import { WizardContainer } from "./components/wizard/WizardContainer";
import { UserDashboard } from "./components/dashboard/UserDashboard";
import { ThemeToggle } from "./components/ui/ThemeToggle";
import { GlassCard } from "./components/ui/GlassCard";
import { CreditBalanceAnimator } from "./components/ui/CreditBalanceAnimator";
import { HeroSection } from "./components/landing/HeroSection";
import { ComparisonSection } from "./components/landing/ComparisonSection";
import { PricingCalculatorSection } from "./components/landing/PricingCalculatorSection";
import { SocialProofSection } from "./components/landing/SocialProofSection";
import { FaqSection } from "./components/landing/FaqSection";
import { LivePurchaseToast } from "./components/landing/LivePurchaseToast";
import { ConversionFooterBanner } from "./components/landing/ConversionFooterBanner";
import { SeoHead } from "./components/landing/SeoHead";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"landing" | "wizard" | "dashboard">("dashboard");

  return (
    <div className="min-h-screen bg-[#070a12] dark:bg-[#070a12] light:bg-slate-100 text-slate-100 dark:text-slate-100 light:text-slate-900 flex flex-col relative overflow-hidden transition-colors duration-300">
      <SeoHead activeTab={activeTab} />
      {/* Background Deep Indigo glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-indigo-600/20 dark:bg-indigo-600/20 light:bg-indigo-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-violet-600/15 dark:bg-violet-600/15 light:bg-violet-500/10 blur-[110px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-600/10 dark:bg-blue-600/10 light:bg-blue-400/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Header / Navbar */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200">
        <div 
          onClick={() => setActiveTab("landing")}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white dark:text-white light:text-slate-900 font-outfit">
              AI <span className="gradient-heading">GostDoc</span>
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 dark:text-indigo-400 light:text-indigo-600 border border-indigo-500/20">
              v1.0 Pro Max
            </span>
          </div>
        </div>

        <nav className="flex items-center space-x-4 md:space-x-6 text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">
          <button 
            onClick={() => setActiveTab("landing")} 
            className={`hover:text-indigo-400 transition-colors ${activeTab === "landing" ? "text-indigo-400 font-semibold" : ""}`}
          >
            Возможности
          </button>
          <button 
            onClick={() => setActiveTab("wizard")} 
            className={`hover:text-indigo-400 transition-colors ${activeTab === "wizard" ? "text-indigo-400 font-semibold" : ""}`}
          >
            Генератор (Wizard)
          </button>
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`hover:text-indigo-400 transition-colors flex items-center space-x-1.5 ${activeTab === "dashboard" ? "text-indigo-400 font-semibold" : ""}`}
          >
            <User className="w-4 h-4" />
            <span>Личный кабинет</span>
          </button>

          <CreditBalanceAnimator onTopUpClick={() => setActiveTab("dashboard")} />

          <ThemeToggle />

          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab("wizard")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-500/25 flex items-center space-x-2 cursor-pointer"
          >
            <span>Создать документ</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 relative z-10">
        {activeTab === "dashboard" ? (
          <UserDashboard
            onNewDocument={() => setActiveTab("wizard")}
            onViewDocument={() => setActiveTab("wizard")}
          />
        ) : activeTab === "wizard" ? (
          <div className="space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
              <h1 className="text-3xl font-extrabold text-white dark:text-white light:text-slate-900">
                Мастер генерации документа
              </h1>
              <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">
                Заполните вводные данные, загрузите методические указания и сгенерируйте работу по ГОСТ 7.32-2017
              </p>
            </div>
            <WizardContainer />
          </div>
        ) : (
          <div className="space-y-12">
            <HeroSection onStartClick={() => setActiveTab("wizard")} />
            <ComparisonSection />
            <PricingCalculatorSection 
              onStartGenerator={() => setActiveTab("wizard")}
              onSelectPlan={() => setActiveTab("dashboard")}
            />
            <SocialProofSection />
            <FaqSection />
            <ConversionFooterBanner onStartClick={() => setActiveTab("wizard")} />
          </div>
        )}
      </main>

      {/* Live Sales & Generation Toast Notifications */}
      <LivePurchaseToast />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-6 py-6 text-center text-xs text-slate-500 dark:text-slate-500 light:text-slate-600">
        © 2026 AI GostDoc Engine. Все права защищены.
      </footer>
    </div>
  );
};

export default App;
