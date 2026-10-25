import React from "react";
import { ArrowRight, User } from "lucide-react";

interface LandingHeaderProps {
  onStartClick: () => void;
  onOpenDashboard?: () => void;
  activeTab?: "landing" | "wizard" | "dashboard";
  onTabChange?: (tab: "landing" | "wizard" | "dashboard") => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onStartClick,
  onOpenDashboard,
  activeTab = "landing",
  onTabChange
}) => {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (activeTab !== "landing" && onTabChange) {
      onTabChange("landing");
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full backdrop-blur-md bg-black/40 border-b border-white/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo (Monospace / Minimalist Serif Mark) */}
        <a 
          href="#top" 
          onClick={(e) => scrollToSection(e, "top")}
          className="flex items-center space-x-2.5 group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/80 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
            <span className="font-mono text-xs font-bold text-zinc-100">◆</span>
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-mono text-sm font-bold tracking-tight text-zinc-100 group-hover:text-white transition-colors">
              ГОСТ <span className="text-zinc-500">docx</span>
            </span>
          </div>
        </a>

        {/* Anchor Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-zinc-400">
          <a
            href="#how-it-works"
            onClick={(e) => scrollToSection(e, "how-it-works")}
            className="hover:text-zinc-100 transition-colors"
          >
            Как это работает
          </a>
          <a
            href="#examples"
            onClick={(e) => scrollToSection(e, "examples")}
            className="hover:text-zinc-100 transition-colors text-zinc-300 font-semibold flex items-center space-x-1"
          >
            <span>Примеры работ</span>
          </a>
          <a
            href="#gost-features"
            onClick={(e) => scrollToSection(e, "gost-features")}
            className="hover:text-zinc-100 transition-colors flex items-center space-x-1"
          >
            <span>ГОСТ-стандарт</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 inline-block" />
          </a>
          <a
            href="#pricing"
            onClick={(e) => scrollToSection(e, "pricing")}
            className="hover:text-zinc-100 transition-colors"
          >
            Тарифы
          </a>
          <a
            href="#faq"
            onClick={(e) => scrollToSection(e, "faq")}
            className="hover:text-zinc-100 transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Action Controls & CTA */}
        <div className="flex items-center space-x-3">
          {onTabChange && (
            <button
              onClick={() => onTabChange("dashboard")}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                activeTab === "dashboard"
                  ? "bg-zinc-800 text-white border-zinc-600"
                  : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Кабинет</span>
            </button>
          )}

          <button
            onClick={onStartClick}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-sm hover:shadow-glow-cold cursor-pointer active:scale-95"
          >
            <span>Попробовать</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};

export default LandingHeader;
