import React from "react";

export const MinimalFooter: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-900 bg-[#09090b] py-8 text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Brand Logo & Short Disclaimer */}
        <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-zinc-300 font-semibold">◆ GOST.DOCX</span>
            <span className="text-zinc-600">/</span>
            <span>Автогенератор работ по ГОСТ 7.32-2017</span>
          </div>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <span className="text-zinc-600">© 2026</span>
        </div>

        {/* Center/Right: System Operational Status Indicator */}
        <div className="flex items-center space-x-2 bg-zinc-950 px-3 py-1 rounded-full border border-zinc-800 text-[11px] font-mono text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>System Status: All Models Operational</span>
        </div>

        {/* Right: Legal & Security Links */}
        <div className="flex items-center space-x-5 text-[11px]">
          <a href="#top" className="hover:text-zinc-300 transition-colors">
            Политика конфиденциальности
          </a>
          <a href="#top" className="hover:text-zinc-300 transition-colors">
            Публичная оферта
          </a>
          <a href="#top" className="hover:text-zinc-300 transition-colors">
            Безопасность
          </a>
        </div>

      </div>
    </footer>
  );
};

export default MinimalFooter;
