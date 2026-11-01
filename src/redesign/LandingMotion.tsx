import { UniversityMark } from "./UniversityMark";
import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Download,
  FileText,
  GraduationCap,
  List,
  Plane,
} from "lucide-react";

const BeamSurface = lazy(() => import("./BeamSurface"));

class DecorationFallback extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function FeaturedCard({
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
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" },
    );
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={host} className="featured-card-frame">
      {seen ? (
        <DecorationFallback fallback={children}>
          <Suspense fallback={children}>
            <BeamSurface theme={theme} hoverOnly={hoverOnly} effect={effect} emphasis={emphasis}>{children}</BeamSurface>
          </Suspense>
        </DecorationFallback>
      ) : (
        children
      )}
    </div>
  );
}

export function ProcessSteps() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    element.dataset.revealReady = "true";
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.revealed = "true";
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.35, rootMargin: "0px 0px -14% 0px" },
    );
    element
      .querySelectorAll(".process-item")
      .forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      delete element.dataset.revealReady;
    };
  }, []);
  return (
    <div className="process-list" ref={host}>
      {[
        {
          number: "01",
          title: "Расскажите о задаче",
          text: "Обезличенная тема и тип работы.",
          Icon: FileText,
        },
        {
          number: "02",
          title: "Утвердите план",
          text: "Отредактируйте главы перед генерацией.",
          Icon: List,
        },
        {
          number: "03",
          title: "Заберите документ",
          text: "Посмотрите результат и скачайте Word.",
          Icon: Download,
        },
      ].map(({ number, title, text, Icon }) => (
        <div className="process-item" key={number}>
          <span className="process-number">{number}</span>
          <div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
          <Icon size={23} strokeWidth={1.4} />
        </div>
      ))}
    </div>
  );
}

const universityRows = [
  ["МГУ", "ВШЭ", "УИГА", "СПбГУ", "ИТМО", "КФУ", "УрФУ", "РУДН"],
  [
    "МФТИ",
    "МГТУ им. Баумана",
    "РАНХиГС",
    "Финансовый университет",
    "ТГУ",
    "НИЯУ МИФИ",
    "СФУ",
    "НГУ",
  ],
];

export function UniversityBands() {
  const host = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;
    const update = () => {
      frame = 0;
      if (motion.matches) {
        element.style.setProperty("--university-shift", "0px");
        return;
      }
      const bounds = element.getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(1, (innerHeight - bounds.top) / (innerHeight + bounds.height)),
      );
      element.style.setProperty(
        "--university-shift",
        `${Math.round(progress * 240)}px`,
      );
    };
    const onScroll = () => {
      if (visible && !frame && !motion.matches)
        frame = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) update();
    });
    observer.observe(element);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    motion.addEventListener("change", update);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      motion.removeEventListener("change", update);
    };
  }, []);
  return (
    <section
      className="university-section"
      ref={host}
      aria-label="Для студентов российских вузов"
    >
      <div className="wrap university-heading"><h2>Для вашего университета.</h2></div>
      <div className="university-bands">
        {universityRows.map((row, index) => (
          <div
            className={`university-track university-track-${index}`}
            key={index}
          >
            {[0, 1].map((copy) => (
              <div
                className="university-group"
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
              >
                {row.map((name) => (
                  <div
                    className="university-chip"
                    key={name}
                  >
                    <UniversityMark name={name} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

