import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "indigo" | "gold" | "cyan" | "bordered";
  glow?: boolean;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = "default",
  glow = false,
  interactive = true,
  className,
  children,
  ...props
}) => {
  const variantStyles = {
    default: "glass-card",
    indigo: "glass-card border-indigo-500/30 dark:border-indigo-500/30",
    gold: "glass-card border-amber-500/30 dark:border-amber-500/30",
    cyan: "glass-card border-cyan-500/30 dark:border-cyan-500/30",
    bordered: "glass-card border-gradient-indigo",
  };

  const glowStyles = glow ? "glow-effect-indigo" : "";
  const hoverAnimation = interactive ? { whileHover: { y: -3, scale: 1.01 }, whileTap: { scale: 0.99 } } : {};

  return (
    <motion.div
      {...hoverAnimation}
      className={cn(
        "rounded-2xl p-6 relative overflow-hidden transition-all duration-300",
        variantStyles[variant],
        glowStyles,
        className
      )}
      {...props}
    >
      {/* Background radial highlight for glass depth */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
      {children}
    </motion.div>
  );
};
