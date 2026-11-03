import React, { useEffect, useRef } from "react";

/** Libraries.dev Thinking Orbs engine at hero resolution, capped at 30 painted frames/sec. */
function ThinkingCanvas({
  theme,
  state,
}: {
  theme: "dark" | "light";
  state: "composing" | "solving" | "searching";
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let disposed = false;
    let frameId = 0;
    let visible = false;
    let lastPaint = 0;
    let paint: ((time: number) => void) | null = null;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = matchMedia("(pointer: coarse)");
    let size = 300;
    let dpr = 1;
    const resize = () => {
      size = Math.min(
        480,
        Math.round(canvas.getBoundingClientRect().width || 300),
      );
      dpr = Math.min(coarse.matches ? 1.5 : 2, devicePixelRatio || 1);
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      paint?.(motion.matches ? 1200 : performance.now());
    };
    const tick = (time: number) => {
      if (time - lastPaint >= 1000 / 30) {
        paint?.(time);
        lastPaint = time;
      }
      frameId = requestAnimationFrame(tick);
    };
    const reconcile = () => {
      cancelAnimationFrame(frameId);
      frameId = 0;
      if (
        !disposed &&
        paint &&
        visible &&
        !document.hidden &&
        !motion.matches
      )
        frameId = requestAnimationFrame(tick);
      else if (paint && visible && !document.hidden)
        paint(motion.matches ? 1200 : performance.now());
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      reconcile();
    });
    observer.observe(canvas);
    const resizer = new ResizeObserver(resize);
    resizer.observe(canvas);
    document.addEventListener("visibilitychange", reconcile);
    motion.addEventListener("change", reconcile);
    resize();
    void import("thinking-orbs/engine")
      .then(({ MODE_FRAMES, resolvePreset, paintFrame }) => {
        if (disposed) return;
        const { mode, opts, speed } = resolvePreset(state, 64);
        paint = (time: number) => {
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
          context.clearRect(0, 0, size, size);
          paintFrame(
            context,
            MODE_FRAMES[mode](size, (time / 1000) * speed * 0.75, opts),
            theme === "dark",
            theme === "dark"
              ? { r: 242, g: 222, b: 207 }
              : { r: 139, g: 64, b: 40 },
          );
        };
        paint(motion.matches ? 1200 : performance.now());
        reconcile();
      })
      .catch(() => {
        /* Text and the rest of the page remain usable if the optional animation fails. */
      });
    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      resizer.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
      motion.removeEventListener("change", reconcile);
    };
  }, [theme, state]);
  return (
    <canvas
      ref={canvasRef}
      className="thinking-orb-canvas"
      role="img"
      aria-label={`Thinking Orb — ${state}`}
    />
  );
}

export function AiOrb({ theme, state = "composing" }: { theme: "dark" | "light"; state?: "composing" | "solving" | "searching" }) {
  return <div className={`orb-scene thinking-scene composing-scene ${state === "solving" ? "solving-scene" : ""}`}><div className="thinking-orb-field"><ThinkingCanvas theme={theme} state={state} /></div></div>;
}
