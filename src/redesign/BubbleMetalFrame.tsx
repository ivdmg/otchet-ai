import React, { useEffect, useId, useRef, useState } from "react";
import { MetalFx, useMetalBend } from "metal-fx";

/** The hit area and icon stay still; only a small part of the circular rim yields. */
export function BubbleMetalFrame({children, theme, paused}: {children: React.ReactNode; theme: "dark" | "light"; paused: boolean}) {
  const metal = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const host = useRef<HTMLSpanElement>(null);
  const id = `bubble-${useId().replace(/:/g, "")}`;
  const [painted, setPainted] = useState(false);
  const simulation = useRef({ frame: 0, amplitude: 0, velocity: 0, target: 0, angle: 0, targetAngle: 0, last: 0 });
  useMetalBend(metal);

  const draw = () => {
    const s = simulation.current;
    const points: string[] = [];
    for (let i = 0; i <= 96; i++) {
      const theta = i / 96 * Math.PI * 2;
      const delta = Math.atan2(Math.sin(theta - s.angle), Math.cos(theta - s.angle));
      const radius = 19.5 + s.amplitude * Math.exp(-delta * delta / .25);
      points.push(`${(21 + radius * Math.cos(theta)).toFixed(2)},${(21 + radius * Math.sin(theta)).toFixed(2)}`);
    }
    path.current?.setAttribute("d", `M${points.join(" L")}Z`);
  };
  const animate = (time: number) => {
    const s = simulation.current;
    const dt = Math.min(.035, Math.max(.008, (time - (s.last || time - 16)) / 1000));
    s.last = time;
    s.velocity += ((s.target - s.amplitude) * 150 - s.velocity * 18) * dt;
    s.amplitude += s.velocity * dt;
    const delta = Math.atan2(Math.sin(s.targetAngle - s.angle), Math.cos(s.targetAngle - s.angle));
    s.angle += delta * .24;
    draw();
    if (Math.abs(s.target - s.amplitude) > .006 || Math.abs(s.velocity) > .02 || Math.abs(delta) > .008)
      s.frame = requestAnimationFrame(animate);
    else { s.frame = 0; s.last = 0; }
  };
  const start = () => { const s = simulation.current; if (!s.frame) s.frame = requestAnimationFrame(animate); };
  const release = () => { simulation.current.target = 0; start(); };
  useEffect(() => {
    draw();
    const root = metal.current;
    if (!root) return;
    // Until the library has actually copied its shader, keep the SVG rim visible.
    const update = () => setPainted(root.style.opacity === "1");
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["style"] });
    update();
    return () => { observer.disconnect(); cancelAnimationFrame(simulation.current.frame); };
  }, []);
  useEffect(() => {
    if (paused) {
      const s = simulation.current;
      cancelAnimationFrame(s.frame); s.frame = 0; s.last = 0; s.target = 0; s.amplitude = 0; s.velocity = 0; draw();
    }
  }, [paused]);
  return <span ref={host} className="bubble-button-frame" onPointerMove={e => {
    if (paused || e.pointerType === "touch" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
    const distance = Math.hypot(x, y), s = simulation.current;
    if (distance > 2) s.targetAngle = Math.atan2(y, x);
    s.target = distance < 19.5 ? -Math.min(3.8, .7 + (19.5 - distance) * .18) : Math.min(3.1, .8 + (distance - 19.5) * .6);
    start();
  }} onPointerLeave={release} onPointerCancel={release}>
    <MetalFx ref={metal} preset="silver" variant="circle" strength={1} theme={theme} innerShadow disableGlow paused={paused} ringCssPx={3.4} normalizeHostStyles={false} className="chrome-button-effect chrome-circle-effect bubble-library-ring">{children}</MetalFx>
    {(!painted || theme === "light") && <svg className="bubble-rim" viewBox="-7 -7 56 56" aria-hidden="true"><defs><linearGradient id={id} x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse"><stop stopColor={theme === "dark" ? "#f9fbff" : "#515d6e"}/><stop offset=".22" stopColor="#929dab"/><stop offset=".43" stopColor={theme === "dark" ? "#e4eaf3" : "#c3ccd8"}/><stop offset=".6" stopColor="#525f73"/><stop offset=".78" stopColor={theme === "dark" ? "#f3f7ff" : "#566476"}/><stop offset="1" stopColor="#9aa6b7"/></linearGradient></defs><path ref={path} d="M40.5,21A19.5,19.5 0 1 1 1.5,21A19.5,19.5 0 1 1 40.5,21Z" fill="none" stroke={`url(#${id})`} strokeWidth="3.4"/></svg>}
  </span>;
}
