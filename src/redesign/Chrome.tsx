import React, { createContext, lazy, Suspense, useContext, useEffect, useRef, useState } from "react";

export const ChromeTheme = createContext<"dark" | "light">("dark");
const MetalFrame = lazy(() => import("./MetalSurfaces").then(m => ({ default: m.MetalFrame })));

class ChromeFallback extends React.Component<{ children: React.ReactNode; fallback: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function useMotion() {
  const host = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => { setActive(visible && !document.hidden && !motion.matches); if (visible && !motion.matches) setSeen(true); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    if (host.current) observer.observe(host.current);
    motion.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); motion.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); };
  }, []);
  return { host, active, seen };
}

function ChromeOutline({buttonRef, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement> & {buttonRef: React.ForwardedRef<HTMLButtonElement>}) {
  const theme = useContext(ChromeTheme);
  const { host, active, seen } = useMotion();
  const button = <button ref={buttonRef} {...props} />;
  return <span className={`chrome-button-shell ${props.className?.includes("full-width") ? "full-width" : ""}`} ref={host}>
    {seen ? <ChromeFallback fallback={button}><Suspense fallback={button}><MetalFrame theme={theme} paused={!active} round={props.className?.includes("chrome-round")}>{button}</MetalFrame></Suspense></ChromeFallback> : button}
  </span>;
}

/** Keep ordinary buttons native; give the existing outline variant one consistent chrome. */
export const ChromeButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>((props, ref) => {
  return props.className?.includes("button-outline") ? <ChromeOutline buttonRef={ref} {...props} /> : <button ref={ref} {...props} />;
});
ChromeButton.displayName = "ChromeButton";

export function ChromeTitle() {
  return <span className="chrome-title" aria-label="Большая работа."><span className="chrome-word">Большая</span>{" "}<span className="chrome-word">работа.</span></span>;
}
