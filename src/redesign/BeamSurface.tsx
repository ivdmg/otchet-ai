import React, { useEffect, useRef, useState } from "react";
import { BorderBeam } from "border-beam";

export default function BeamSurface({
  children,
  theme,
  hoverOnly = false,
  effect = "rotate",
  emphasis = false,
}: {
  children: React.ReactNode;
  theme: "dark" | "light";
  hoverOnly?: boolean;
  emphasis?: boolean;
  effect?: "rotate" | "outside" | "inner" | "line";
}) {
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    let visible = false;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setActive(visible && !document.hidden && !motion.matches);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    if (host.current) observer.observe(host.current);
    document.addEventListener("visibilitychange", update);
    motion.addEventListener("change", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      motion.removeEventListener("change", update);
    };
  }, []);
  return (
    <div ref={host} className="beam-surface" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setHovered(true)} onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(false); }}>
      <BorderBeam
        size={effect === "outside" ? "pulse-outside" : effect === "inner" ? "pulse-inner" : effect === "line" ? "line" : "md"}
        colorVariant="mono"
        staticColors
        strength={1}
        style={{ "--beam-stroke-opacity": theme === "light" ? (emphasis ? 10 : 7) : (emphasis ? 2 : 1.4), "--beam-inner-opacity": theme === "light" ? (emphasis ? 3.8 : 2.4) : (emphasis ? 2 : 1.2), "--beam-bloom-opacity": theme === "light" ? (emphasis ? 3.2 : 2.2) : (emphasis ? 1.8 : 1.2) } as React.CSSProperties}
        brightness={theme === "dark" ? (emphasis ? 3 : 2.5) : (emphasis ? 2 : 1.6)}
        saturation={theme === "light" ? 1.2 : 0}
        glowSize={emphasis ? 1.3 : 1}
        duration={effect === "line" ? 3.2 : 4.8}
        borderRadius={hoverOnly ? 12 : 7}
        theme={theme}
        active={active && (!hoverOnly || hovered)}
        css={theme === "light" ? `
          [data-beam="{id}"]::after { filter: brightness(0) saturate(100%) invert(35%) sepia(76%) saturate(1322%) hue-rotate(344deg) brightness(93%) contrast(91%) !important; }
          [data-beam="{id}"]::before { filter: blur(${emphasis ? 12 : 8}px) brightness(0) saturate(100%) invert(35%) sepia(76%) saturate(1322%) hue-rotate(344deg) brightness(93%) contrast(91%) !important; }
          [data-beam="{id}"] [data-beam-bloom] { filter: blur(${emphasis ? 16 : 10}px) brightness(0) saturate(100%) invert(35%) sepia(76%) saturate(1322%) hue-rotate(344deg) brightness(93%) contrast(91%) !important; }
        ` : ''}
      >
        {children}
      </BorderBeam>
    </div>
  );
}
