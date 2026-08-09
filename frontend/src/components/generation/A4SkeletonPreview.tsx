import React from "react";
import { motion } from "framer-motion";

export const A4SkeletonPreview: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="glass-card p-6 rounded-3xl border border-indigo-500/20 shadow-glass space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="text-xs text-slate-400 font-mono ml-2">A4 Paper Layout Emulator (ГОСТ 7.32)</span>
        </div>
        <div className="text-[11px] font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
          Сборка: {progress}%
        </div>
      </div>

      {/* Simulated A4 Paper Sheet with Shimmer Lines */}
      <div className="bg-slate-900/90 dark:bg-slate-900/90 light:bg-white rounded-2xl p-6 border border-slate-800/80 shadow-2xl relative space-y-4 max-w-xl mx-auto min-h-[220px]">
        {/* Title Skeleton */}
        <div className="h-6 w-3/4 mx-auto rounded-lg skeleton-shimmer" />
        <div className="h-3 w-1/2 mx-auto rounded skeleton-shimmer" />

        {/* Paragraph Skeletons */}
        <div className="space-y-2 pt-4">
          <div className="h-3 w-full rounded skeleton-shimmer" />
          <div className="h-3 w-11/12 rounded skeleton-shimmer" />
          <div className="h-3 w-4/5 rounded skeleton-shimmer" />
        </div>

        {/* Table Skeleton Preview */}
        {progress > 35 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-slate-700/60 rounded-xl p-3 space-y-2 bg-slate-950/40"
          >
            <div className="h-3 w-1/3 rounded skeleton-shimmer" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-4 bg-indigo-500/20 rounded skeleton-shimmer" />
              <div className="h-4 bg-indigo-500/20 rounded skeleton-shimmer" />
              <div className="h-4 bg-indigo-500/20 rounded skeleton-shimmer" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-3 bg-slate-800 rounded skeleton-shimmer" />
              <div className="h-3 bg-slate-800 rounded skeleton-shimmer" />
              <div className="h-3 bg-slate-800 rounded skeleton-shimmer" />
            </div>
          </motion.div>
        )}

        {/* Footer Page Number */}
        <div className="absolute bottom-3 right-6 h-3 w-6 rounded skeleton-shimmer" />
      </div>
    </div>
  );
};
