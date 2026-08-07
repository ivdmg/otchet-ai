import React, { useState } from "react";
import { FileText, ArrowRight, Sparkles, Layers, Zap, ShieldCheck, User } from "lucide-react";
import { WizardContainer } from "./components/wizard/WizardContainer";
import { UserDashboard } from "./components/dashboard/UserDashboard";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"landing" | "wizard" | "dashboard">("dashboard");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-600/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Header / Navbar */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div 
          onClick={() => setActiveTab("landing")}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight text-white font-outfit">
              AI <span className="gradient-heading">GostDoc</span>
            </span>
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              v1.0 AST Engine
            </span>
          </div>
        </div>

        <nav className="flex items-center space-x-6 text-sm font-medium text-slate-300">
          <button 
            onClick={() => setActiveTab("landing")} 
            className={`hover:text-blue-400 transition-colors ${activeTab === "landing" ? "text-blue-400 font-semibold" : ""}`}
          >
            Возможности
          </button>
          <button 
            onClick={() => setActiveTab("wizard")} 
            className={`hover:text-blue-400 transition-colors ${activeTab === "wizard" ? "text-blue-400 font-semibold" : ""}`}
          >
            Генератор (Wizard)
          </button>
          <button 
            onClick={() => setActiveTab("dashboard")} 
            className={`hover:text-blue-400 transition-colors flex items-center space-x-1.5 ${activeTab === "dashboard" ? "text-blue-400 font-semibold" : ""}`}
          >
            <User className="w-4 h-4" />
            <span>Личный кабинет</span>
          </button>
          <button 
            onClick={() => setActiveTab("wizard")}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-blue-600/20 flex items-center space-x-2 cursor-pointer"
          >
            <span>Создать документ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
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
              <h1 className="text-3xl font-extrabold text-white">Мастер генерации документа</h1>
              <p className="text-sm text-slate-400">
                Заполните вводные данные, загрузите методические указания и сгенерируйте работу по ГОСТ 7.32-2017
              </p>
            </div>
            <WizardContainer />
          </div>
        ) : (
          <div className="py-12 flex flex-col justify-center items-center text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Генерация научных работ по ГОСТу с AST архитектурой</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-4xl leading-tight">
              ИИ-Генератор документов с точным соблюдением <span className="gradient-heading">ГОСТ 7.32-2017</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
              Создавайте курсовые работы, ВКР и рефераты с идеально сверстанными полями, списком литературы, таблицами и формулами в формате DOCX.
            </p>

            <button
              onClick={() => setActiveTab("wizard")}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base transition-all shadow-xl shadow-blue-600/30 flex items-center space-x-3 cursor-pointer mb-16"
            >
              <span>Запустить генератор документов</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
              <div className="glass-card p-6 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AST Редактор Плана</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Визуальное управление структурой документа через интерактивное дерево разделов и подразделов.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 text-indigo-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Spot Regeneration</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Точечная перегенерация отдельных глав и параграфов без изменения остального текста.
                </p>
              </div>

              <div className="glass-card p-6 rounded-2xl">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Web DOCX Viewer A4</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Предпросмотр страниц с точной эмуляцией полей 30/10/20/20 мм прямо в вашем браузере.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-500">
        © 2026 AI GostDoc Engine. Все права защищены.
      </footer>
    </div>
  );
};

export default App;
