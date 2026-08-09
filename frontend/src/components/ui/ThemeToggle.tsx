import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeStore } from "../../store/useThemeStore";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-900/60 dark:bg-slate-900/60 light:bg-slate-200/70 border border-slate-700/50 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-indigo-400 dark:hover:text-indigo-400 transition-colors shadow-sm cursor-pointer flex items-center justify-center"
      title={theme === "dark" ? "Переключить на Светлую тему" : "Переключить на Тёмную тему"}
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400 animate-pulse" />
      ) : (
        <Moon className="w-4 h-4 text-indigo-600" />
      )}
    </motion.button>
  );
};
