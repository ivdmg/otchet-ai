import React, { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";

import { useSmallScreen } from "./LandingCarousels";
import { ChromeButton } from "./Chrome";

const examples = [
  { id: "coursework", kind: "Курсовая работа", topic: "Искусственный интеллект в банковской сфере", discipline: "Экономика", year: "2026", pages: 10 },
  { id: "abstract", kind: "Реферат", topic: "Цифровая культура современного общества", discipline: "Культурология", year: "2026", pages: 12 },
  { id: "thesis", kind: "Дипломная работа", topic: "Развитие электронной коммерции", discipline: "Менеджмент", year: "2026", pages: 20 },
  { id: "marketing", kind: "Курсовая работа", topic: "Маркетинг в социальных сетях", discipline: "Маркетинг", year: "2026", pages: 15 },
  { id: "ecology", kind: "Реферат", topic: "Экология современного города", discipline: "Экология", year: "2026", pages: 8 },
  { id: "aviation", kind: "Курсовая работа", topic: "Цифровые технологии в гражданской авиации", discipline: "Авиатранспорт", year: "2026", pages: 18 },
];

export function WorkSamples({theme: _theme}: {theme: "dark" | "light"}) {
  const [expanded, setExpanded] = useState(false);
  const small = useSmallScreen();
  const track = useRef<HTMLDivElement>(null);
  const scroll = (direction: number) => {
    const width = track.current?.querySelector(".work-sample-card")?.getBoundingClientRect().width || 280;
    const el = track.current;
    const next = (el?.scrollLeft || 0) + direction * (width + 18);
    const end = (el?.scrollWidth || 0) - (el?.clientWidth || 0);
    el?.scrollTo({ left: next > end + 4 ? 0 : next < -4 ? end : next, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return <section className="work-samples wrap" id="examples" aria-label="Примеры работ">
    <div className="samples-heading"><h2>Посмотрите результат.</h2><div className="sample-arrows"><button className="icon-button" aria-label="Предыдущий пример" onClick={() => scroll(-1)}><ChevronLeft size={20}/></button><button className="icon-button" aria-label="Следующий пример" onClick={() => scroll(1)}><ChevronRight size={20}/></button></div></div>
    <div className={`samples-track ${expanded && !small ? "samples-expanded" : ""}`} ref={track} id="work-samples-list">{examples.slice(0, small || expanded ? 6 : 3).map(example => <div className="sample-document" key={example.id}><a className="work-sample-card" href={`/samples/${example.id}-example.pdf`} target="_blank" rel="noopener noreferrer" aria-label={`Открыть PDF: ${example.topic}`}>
      <div className="sample-preview"><div className="sample-cover" aria-hidden="true"><div className="sample-cover-top">ОБРАЗЕЦ УЧЕБНОЙ РАБОТЫ<br/><span>Дисциплина: {example.discipline}</span></div><div className="sample-cover-center"><b>{example.kind.toUpperCase()}</b><span>на тему:</span><strong>«{example.topic}»</strong></div><div className="sample-cover-author">Пример оформления<br/>Титульный лист</div><div className="sample-cover-year">Москва — {example.year}</div></div></div>
      <div className="sample-info"><span className="sample-kind">{example.kind}</span><h3>{example.topic}</h3><div className="sample-card-bottom"><span>{example.pages} страниц</span></div></div>
    </a></div>)}</div>
    {!small && <div className="samples-more"><ChromeButton className="button button-outline" aria-expanded={expanded} aria-controls="work-samples-list" onClick={() => { setExpanded(!expanded); if (track.current) { track.current.scrollLeft = 0; if (expanded) requestAnimationFrame(() => track.current?.scrollIntoView({ block: "start", behavior: "auto" })); } }}>{expanded ? "Свернуть" : "Показать больше"}{expanded ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</ChromeButton></div>}
  </section>;
}
