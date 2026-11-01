import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function useSmallScreen() {
  const [small, setSmall] = useState(() => matchMedia("(max-width: 700px)").matches);
  useEffect(() => {
    const media = matchMedia("(max-width: 700px)");
    const update = () => setSmall(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return small;
}

export function PricingCarousel({children}: {children: React.ReactNode}) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(1);
  const activeRef = useRef(1);
  const small = useSmallScreen();
  const move = (index: number, smooth = true) => {
    const el = track.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    const left = card.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft - (el.clientWidth - card.offsetWidth) / 2;
    el.scrollTo({left, behavior: smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto"});
    activeRef.current = index; setActive(index);
  };
  useEffect(() => {
    const el = track.current;
    if (!el || !small) return;
    let initialized = false;
    const layout = () => { move(initialized ? activeRef.current : 1, false); initialized = true; };
    let frame = requestAnimationFrame(layout);
    const observer = new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(layout); });
    observer.observe(el);
    let scrollFrame = 0;
    const sync = () => {
      if (!initialized || scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const box = el.getBoundingClientRect(), center = box.left + box.width / 2;
        let distance = Infinity, nearest = 1;
        Array.from(el.children).forEach((child, index) => { const r = child.getBoundingClientRect(), d = Math.abs(r.left + r.width/2 - center); if (d < distance) {distance = d; nearest = index;} });
        activeRef.current = nearest; setActive(nearest);
      });
    };
    el.addEventListener("scroll", sync, {passive: true});
    return () => { observer.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(scrollFrame); el.removeEventListener("scroll", sync); };
  }, [small]);
  return <div className="pricing-carousel"><div className="pricing-grid" data-active={active} ref={track} onClickCapture={e => { if (!small) return; const card = (e.target as Element).closest(".pricing-slide"); const index = card && track.current ? Array.from(track.current.children).indexOf(card) : -1; if (index >= 0 && index !== active) { e.preventDefault(); e.stopPropagation(); move(index); } }} role="region" aria-label="Тарифы" tabIndex={small ? 0 : undefined} onKeyDown={e => { if (!small || e.target !== e.currentTarget) return; if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); move(Math.max(0, Math.min(2, active + (e.key === "ArrowRight" ? 1 : -1)))); } }}>{children}</div><div className="pricing-carousel-controls"><button className="icon-button" aria-label="Предыдущий тариф" disabled={active === 0} onClick={()=>move(active-1)}><ChevronLeft size={19}/></button><div className="price-dots">{["Реферат", "Курсовая", "Дипломная"].map((name,index)=><button key={name} aria-label={`Показать тариф: ${name}`} aria-pressed={active===index} className={active===index ? "active" : ""} onClick={()=>move(index)}><span/></button>)}</div><button className="icon-button" aria-label="Следующий тариф" disabled={active===2} onClick={()=>move(active+1)}><ChevronRight size={19}/></button></div></div>;
}
