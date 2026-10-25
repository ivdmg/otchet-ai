import React from "react";
import { motion } from "framer-motion";

export const A4SkeletonPreview: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="dark-surface p-6 rounded-2xl border border-zinc-800 shadow-xl space-y-4 relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
          <span className="text-xs text-zinc-400 font-mono ml-2">A4 Layout Emulator (ГОСТ 7.32)</span>
        </div>
        <div className="text-[11px] font-mono text-zinc-300 bg-zinc-900 px-2.5 py-0.5 rounded-md border border-zinc-800">
          Сборка: {progress}%
        </div>
      </div>

      {/* Simulated A4 Paper Sheet with Shimmer Lines */}
      <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800/80 shadow-2xl relative space-y-4 max-w-xl mx-auto min-h-[220px]">
        {/* Title Skeleton */}
        <div className="h-5 w-3/4 mx-auto rounded-lg skeleton-shimmer" />
        <div className="h-2.5 w-1/2 mx-auto rounded skeleton-shimmer" />

        {/* Paragraph Skeletons */}
        <div className="space-y-2.5 pt-3">
          <div className="h-2.5 w-full rounded skeleton-shimmer" />
          <div className="h-2.5 w-11/12 rounded skeleton-shimmer" />
          <div className="h-2.5 w-4/5 rounded skeleton-shimmer" />
        </div>

        {/* Table Skeleton Preview */}
        {progress > 35 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-zinc-800 rounded-lg p-3 space-y-2 bg-zinc-900/60"
          >
            <div className="h-2.5 w-1/3 rounded skeleton-shimmer" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-3 bg-zinc-800 rounded skeleton-shimmer" />
              <div className="h-3 bg-zinc-800 rounded skeleton-shimmer" />
              <div className="h-3 bg-zinc-800 rounded skeleton-shimmer" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="h-2.5 bg-zinc-800/80 rounded skeleton-shimmer" />
              <div className="h-2.5 bg-zinc-800/80 rounded skeleton-shimmer" />
              <div className="h-2.5 bg-zinc-800/80 rounded skeleton-shimmer" />
            </div>
          </motion.div>
        )}

        {/* Footer Page Number */}
        <div className="absolute bottom-3 right-6 h-2.5 w-6 rounded skeleton-shimmer" />
      </div>
    </div>
  );
};

export default A4SkeletonPreview;
