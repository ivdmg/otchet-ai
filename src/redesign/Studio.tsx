import React, { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  FileText,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  Settings2,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Upload,
  RefreshCw,
  Trash2,
  Search,
  CreditCard,
  Copy,
  Gift,
  List,
  AlignLeft,
  SlidersHorizontal,
  Minus,
  CheckCheck,
  Loader2,
  HelpCircle,
  Sun,
  Moon,
  Home as HomeIcon,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { ChromeButton, ChromeTitle, ChromeTheme } from "./Chrome";
import { AiOrb } from "./AiOrb";
import { PricingCarousel } from "./LandingCarousels";
import { WorkSamples } from "./WorkSamples";
import {
  FeaturedCard,
  ProcessSteps,
  UniversityBands,
} from "./LandingMotion";

type Theme = "dark" | "light";
function ThemeToggle({ theme, toggle }: { theme: Theme; toggle: () => void }) {
  return (
    <ChromeButton
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
      }
      title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
    >
      <span className={theme === "light" ? "theme-icon active" : "theme-icon"}>
        <Sun size={16} />
      </span>
      <span className={theme === "dark" ? "theme-icon active" : "theme-icon"}>
        <Moon size={15} />
      </span>
    </ChromeButton>
  );
}

type WorkType = "abstract" | "coursework" | "vkr";
type Page = "home" | "create" | "library" | "profile" | "referrals";
type Chapter = { title: string; sections: string[] };
type Work = {
  id: string;
  title: string;
  type: WorkType;
  pages: number;
  date: string;
  status: "ready" | "draft";
  chapters?: Chapter[];
  subject?: string;
  notes?: string;
};
type FormData = {
  title: string;
  subject: string;
  type: WorkType;
  pages: number;
  chapters: number;
  notes: string;
  file: File | null;
};
const TYPES = [
  {
    id: "abstract" as WorkType,
    label: "Реферат",
    price: 199,
    pages: 15,
    icon: FileText,
    caption: "Коротко и по делу",
    features: [
      "До 15 страниц",
      "Титульный лист и источники",
      "Оформление по ГОСТу",
    ],
  },
  {
    id: "coursework" as WorkType,
    label: "Курсовая",
    price: 490,
    pages: 30,
    icon: BookOpen,
    caption: "От теории к практике",
    features: [
      "До 40 страниц",
      "Таблицы, формулы и расчёты",
      "Редактирование структуры",
    ],
  },
  {
    id: "vkr" as WorkType,
    label: "Дипломная",
    price: 1390,
    pages: 60,
    icon: GraduationCap,
    caption: "Большое исследование",
    features: [
      "До 80 страниц",
      "Три главы и приложения",
      "Расширенная библиография",
    ],
  },
];
const initialForm: FormData = {
  title: "",
  subject: "",
  type: "coursework",
  pages: 30,
  chapters: 2,
  notes: "",
  file: null,
};
const demoTitle = "Искусственный интеллект в банковской сфере";
const initialWorks: Work[] = [
  {
    id: "example-1",
    title: demoTitle,
    type: "coursework",
    pages: 30,
    date: "25 окт 2026",
    status: "ready",
  },
  {
    id: "example-2",
    title: "Цифровая трансформация современного бизнеса",
    type: "vkr",
    pages: 60,
    date: "23 окт 2026",
    status: "ready",
  },
  {
    id: "example-3",
    title: "Психология принятия решений",
    type: "abstract",
    pages: 15,
    date: "20 окт 2026",
    status: "draft",
  },
];
const FAQ = [
  [
    "Что я получу в итоге?",
    "Редактируемый файл Word с титульным листом, содержанием, основным текстом и списком источников. Перед скачиванием можно посмотреть документ и изменить отдельные разделы.",
  ],
  [
    "Можно использовать требования моего вуза?",
    "Да. Прикрепите методичку в PDF или DOCX и добавьте пожелания в поле требований. Данные для титульного листа можно заполнить в профиле.",
  ],
  [
    "Можно изменить план?",
    "Да. Переименовывайте главы и параграфы, добавляйте разделы и меняйте их порядок. Одна полная перегенерация плана — бесплатно.",
  ],
  [
    "Что с оригинальностью?",
    "Текст создаётся под вашу тему. Результат зависит от системы проверки и требований вуза. Фиксированный процент оригинальности и прохождение ИИ-детектора не гарантируются.",
  ],
  [
    "Нужна подписка?",
    "Нет. Вы выбираете тип работы и оплачиваете её один раз. Перед запуском генерации видны объём и стоимость.",
  ],
];
function buildChapters(form: FormData, alternate = false): Chapter[] {
  return Array.from({ length: form.chapters }, (_, i) => ({
    title:
      i === 0
        ? `${alternate ? "Теоретические подходы к исследованию" : "Теоретические основы"} темы «${form.title.trim() || demoTitle}»`
        : i === 1
          ? alternate
            ? "Оценка и направления развития"
            : "Практический анализ и перспективы развития"
          : "Рекомендации и оценка эффективности",
    sections:
      i === 0
        ? [
            "Основные понятия и подходы к исследованию",
            "Современное состояние и тенденции развития",
          ]
        : i === 1
          ? [
              "Анализ практики и существующих решений",
              "Проблемы и направления совершенствования",
            ]
          : [
              "Разработка практических рекомендаций",
              "Оценка предложенных решений",
            ],
  }));
}
function Brand({
  onClick,
  inverse = false,
}: {
  onClick: () => void;
  inverse?: boolean;
}) {
  return (
    <ChromeButton
      className={`brand ${inverse ? "brand-inverse" : ""}`}
      onClick={onClick}
      aria-label="ГОСТ docx — на главную"
    >
      <span className="brand-symbol" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        гост<span className="brand-dot">.</span>
        <small>docx</small>
      </span>
    </ChromeButton>
  );
}
function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className={`dialog-content ${wide ? "dialog-wide" : ""}`}
          aria-describedby={undefined}
        >
          <div className="dialog-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Закрыть">
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function Paper({
  title = demoTitle,
  page = 1,
  chapters = [],
  compact = false,
  author,
  university,
  margins = false,
  type = "coursework",
}: {
  title?: string;
  page?: number;
  chapters?: Chapter[];
  compact?: boolean;
  author?: string;
  university?: string;
  margins?: boolean;
  type?: WorkType;
}) {
  return (
    <div
      className={`paper ${compact ? "paper-mini" : ""} ${margins ? "paper-guides" : ""}`}
    >
      {page === 1 ? (
        <div className="paper-title-page">
          <div className="paper-university">
            МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ
            <br />
            РОССИЙСКОЙ ФЕДЕРАЦИИ
            <br />
            <br />
            {university ||
              "Федеральное государственное образовательное учреждение высшего образования"}
          </div>
          <div className="paper-subject">Кафедра экономики и управления</div>
          <div className="paper-work-type">
            {type === "abstract"
              ? "РЕФЕРАТ"
              : type === "vkr"
                ? "ВЫПУСКНАЯ КВАЛИФИКАЦИОННАЯ РАБОТА"
                : "КУРСОВАЯ РАБОТА"}
          </div>
          <div className="paper-topic">
            на тему:
            <br />
            <strong>«{title}»</strong>
          </div>
          <div className="paper-author">
            Выполнил(а):
            <br />
            {author || "Иванов Иван Иванович"}
            <br />
            <br />
            Научный руководитель:
            <br />
            доцент, к.э.н. Смирнов А. В.
          </div>
          <div className="paper-city">Москва — 2026</div>
        </div>
      ) : page === 2 ? (
        <>
          <h3>СОДЕРЖАНИЕ</h3>
          <div className="paper-toc">
            <p>
              Введение <span>3</span>
            </p>
            {(chapters.length
              ? chapters
              : buildChapters({ ...initialForm, title })
            ).map((chapter, i) => (
              <React.Fragment key={i}>
                <p>
                  <b>
                    {i + 1}. {chapter.title}
                  </b>
                  <span>{4 + i * 9}</span>
                </p>
                {chapter.sections.map((section, j) => (
                  <p key={j} className="toc-section">
                    {i + 1}.{j + 1}. {section}
                    <span>{5 + i * 9 + j * 3}</span>
                  </p>
                ))}
              </React.Fragment>
            ))}
            <p>
              Заключение <span>27</span>
            </p>
            <p>
              Список использованных источников <span>29</span>
            </p>
          </div>
        </>
      ) : (
        <>
          <h3>
            {page === 3 ? "ВВЕДЕНИЕ" : "1. ТЕОРЕТИЧЕСКИЕ ОСНОВЫ ИССЛЕДОВАНИЯ"}
          </h3>
          <p>
            Актуальность темы «{title}» обусловлена изменениями в современной
            экономике и возрастающей ролью цифровых технологий. Изучение данного
            вопроса позволяет определить ключевые направления развития и
            сформулировать практические рекомендации.
          </p>
          <p>
            Цель исследования — изучить теоретические основы и практические
            аспекты выбранной темы, выявить существующие проблемы и предложить
            пути их решения.
          </p>
          <p>
            Для достижения поставленной цели необходимо решить следующие задачи:
            рассмотреть основные понятия, проанализировать современное состояние
            исследуемой области и обосновать направления её совершенствования.
          </p>
          <p>
            Объектом исследования выступают процессы и отношения, возникающие в
            рассматриваемой сфере. Предмет исследования — подходы, методы и
            инструменты, определяющие их развитие.
          </p>
          {page > 3 && (
            <>
              <h4>Таблица 1 — Методы исследования</h4>
              <table>
                <thead>
                  <tr>
                    <th>Метод</th>
                    <th>Назначение</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Сравнительный анализ</td>
                    <td>Оценка подходов</td>
                  </tr>
                  <tr>
                    <td>Системный подход</td>
                    <td>Изучение взаимосвязей</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
          <p>
            Методологическую основу работы составляют общенаучные методы
            анализа, синтеза и сравнения. Структура исследования включает
            введение, теоретическую и практическую части, заключение и список
            использованных источников.
          </p>
        </>
      )}
      {page > 1 && <span className="paper-number">{page}</span>}
    </div>
  );
}
function Home({
  start,
  library,
  preview,
  theme,
  toggleTheme,
}: {
  start: (type?: WorkType, title?: string) => void;
  library: () => void;
  preview: () => void;
  theme: Theme;
  toggleTheme: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<WorkType>("coursework");
  const [detail, setDetail] = useState(0);
  return (
    <div className="home-page">
      <header className="site-header wrap">
        <Brand
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        />
        <nav aria-label="Главное меню">
          <a href="#how">Как это работает</a>
          <a href="#examples">Примеры работ</a>
          <a href="#pricing">Стоимость</a>
        </nav>
        <div className="site-header-actions">
          <ThemeToggle theme={theme} toggle={toggleTheme} />
          <ChromeButton
            className="button button-outline header-login"
            onClick={library}
          >
            Мои работы <ArrowUpRight size={16} />
          </ChromeButton>
        </div>
      </header>
      <main>
        <section className="hero wrap">
          <div className="hero-copy">
            <h1>
              <ChromeTitle />
              <br />
              <em>
                Без лишней
                <br className="desktop-break" /> работы.
              </em>
            </h1>
            <form
              className="hero-start"
              onSubmit={(e) => {
                e.preventDefault();
                start(type, topic);
              }}
            >
              <div className="type-switch" role="group" aria-label="Тип работы">
                {TYPES.map((item) => (
                  <ChromeButton
                    type="button"
                    key={item.id}
                    aria-pressed={type === item.id}
                    className={type === item.id ? "selected" : ""}
                    onClick={() => setType(item.id)}
                  >
                    {item.label}
                  </ChromeButton>
                ))}
              </div>
              <div className="hero-input-effect"><FeaturedCard theme={theme}>
              <div className="topic-entry">
                <input
                  aria-label="Тема работы"
                  placeholder="О чём ваша работа?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <ChromeButton className="button button-accent" type="submit">
                  Начать <ArrowUpRight size={19} />
                </ChromeButton>
              </div>
              </FeaturedCard></div>
            </form>
            <div className="hero-note">
              <span>От 199 ₽ за работу</span>
              <span className="dot-separator" />
              <span>Без подписки</span>
            </div>
          </div>
          <AiOrb theme={theme} />
        </section>
        <section id="how" className="process-section">
          <div className="wrap process-grid">
            <div>
              <div className="eyebrow light">01 — ПРОЦЕСС</div>
              <h2>
                Вы задаёте тему.
                <br />
                <em>Мы берём рутину.</em>
              </h2>
              <p className="section-lead">
                От первой мысли до последней сноски.
                <br />
                Три шага, всё под контролем.
              </p>
              <ChromeButton
                className="text-button light-text"
                onClick={() => start()}
              >
                Создать работу <ArrowUpRight size={20} />
              </ChromeButton>
            </div>
            <ProcessSteps />
          </div>
        </section>
        <UniversityBands />
        <section id="format" className="format-section wrap">
          <div className="section-topline">
            <div className="eyebrow">02 — ВНИМАНИЕ К ДЕТАЛЯМ</div>
            <span className="small-index">A4 · 210 × 297 ММ</span>
          </div>
          <div className="format-grid">
            <div
              className="format-schema"
              data-active={detail}
              role="img"
              aria-label="Схема оформления: поля, типографика и таблицы по ГОСТу"
            >
              <div className="schema-sheet">
                <div className="schema-ruler">
                  <span>30 мм</span>
                  <i />
                  <span>10 мм</span>
                </div>
                <div className="schema-text-area">
                  <div className="schema-title">СТРУКТУРА РАБОТЫ</div>
                  <div className="schema-lines">
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="schema-lines">
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="schema-table">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <div className="schema-page">01</div>
                </div>
                <span className="schema-mark">1,25 см ↗</span>
              </div>
            </div>
            <div className="format-copy">
              <h2>
                Не просто текст.
                <br />
                <em>Работа в форме.</em>
              </h2>
              <p className="section-lead">
                Больше никаких вечеров с линейкой Word.
              </p>
              <div className="format-details">
                {[
                  [
                    "Поля и отступы",
                    "Поля 30 / 10 / 20 / 20 мм. Красная строка 1,25 см.",
                  ],
                  [
                    "Шрифт и интервалы",
                    "Times New Roman, 14 пт. Межстрочный интервал 1,5.",
                  ],
                  [
                    "Таблицы и источники",
                    "Нумерация, подписи и единый стиль библиографии.",
                  ],
                ].map(([label, text], i) => (
                  <ChromeButton
                    className={`format-detail ${detail === i ? "active" : ""}`}
                    onClick={() => setDetail(i)}
                    aria-expanded={detail === i}
                    key={label}
                  >
                    <span className="detail-number">0{i + 1}</span>
                    <span>
                      <b>{label}</b>
                      {detail === i && <small>{text}</small>}
                    </span>
                    {detail === i ? <Minus size={17} /> : <Plus size={17} />}
                  </ChromeButton>
                ))}
              </div>
              <ChromeButton className="text-button" onClick={preview}>
                Посмотреть пример <ArrowUpRight size={18} />
              </ChromeButton>
            </div>
          </div>
        </section>
        <WorkSamples theme={theme} />
        <section id="pricing" className="pricing-section">
          <div className="wrap">
            <div className="section-topline">
              <div>
                <div className="eyebrow">03 — СТОИМОСТЬ</div>
                <h2>
                  Одна работа.
                  <br />
                  <em>Одна понятная цена.</em>
                </h2>
              </div>
              <p className="pricing-note">
                Никаких подписок.
                <br />
                Вы платите только за свою задачу.
              </p>
            </div>
            <PricingCarousel>
              {TYPES.map((item) => {
                const card = (
                  <article
                    className={`price-card ${item.id === "coursework" ? "price-featured" : ""}`}
                  >
                    <div className="price-card-top">
                      <item.icon size={25} strokeWidth={1.4} />
                      {item.id === "coursework" && <span>ЧАЩЕ ВЫБИРАЮТ</span>}
                    </div>
                    <h3>{item.label}</h3>
                    <p>{item.caption}</p>
                    <div className="price-value">
                      {item.price.toLocaleString("ru-RU")} <span>₽</span>
                      <small>за работу</small>
                    </div>
                    <div className="price-line" />
                    <ul>
                      {item.features.map((feature) => (
                        <li key={feature}>
                          <Check size={16} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <ChromeButton
                      className={`button ${item.id === "coursework" ? "button-accent" : "button-outline"}`}
                      onClick={() => start(item.id)}
                    >
                      Выбрать <ArrowUpRight size={18} />
                    </ChromeButton>
                  </article>
                );
                return <div className="pricing-slide" key={item.id}>{item.id === "coursework" ? <FeaturedCard theme={theme} emphasis>{card}</FeaturedCard> : card}</div>;
              })}
            </PricingCarousel>
          </div>
        </section>
        <section className="faq-section wrap">
          <div>
            <div className="eyebrow">04 — ЕСТЬ ВОПРОСЫ?</div>
            <h2>
              По делу.
              <br />
              <em>Без мелкого шрифта.</em>
            </h2>
            <span className="faq-ornament" aria-hidden="true">
              ?
            </span>
          </div>
          <div className="faq-list">
            {FAQ.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <ChevronDown className="faq-chevron" size={19} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="final-cta wrap">
          <div>
            <div className="eyebrow">ОСВОБОДИТЕ ВЕЧЕР ДЛЯ СЕБЯ</div>
            <h2>Начнём с вашей темы?</h2>
          </div>
          <ChromeButton className="button button-ink" onClick={() => start()}>
            Создать работу <ArrowUpRight size={21} />
          </ChromeButton>
        </section>
      </main>
      <footer className="site-footer">
        <div className="wrap footer-main">
          <Brand
            inverse
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
          <span>Меньше рутины. Больше смысла.</span>
          <a href="#pricing">Стоимость</a>
          <a href="#how">Как это работает</a>
        </div>
        <div className="wrap footer-bottom">
          <span>© 2026 ГОСТ docx</span>
          <span>Создано для ваших больших идей.</span>
          <span>Сделано с вниманием к деталям ↗</span>
        </div>
      </footer>
    </div>
  );
}

export default function Studio() {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem("gost-studio-theme") === "light"
        ? "light"
        : "dark";
    } catch {
      return "dark";
    }
  });
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("gost-studio-theme", next);
    } catch {
      /* The current page still changes. */
    }
  };
  const [page, setPage] = useState<Page>("home");
  const currentPage = useRef(page);
  currentPage.current = page;
  const [sidebarOpen, setSidebarOpen] = useState(() => matchMedia("(min-width: 901px)").matches);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [openChapters, setOpenChapters] = useState<number[]>([]);
  useEffect(() => {if(step === 2) setOpenChapters([]);}, [step]);
  const [regenerated, setRegenerated] = useState(false);
  const [works, setWorks] = useState<Work[]>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("gost-studio-works") || "null") ||
        initialWorks
      );
    } catch {
      return initialWorks;
    }
  });
  const [progress, setProgress] = useState(0);
  const [documentPage, setDocumentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [guides, setGuides] = useState(false);
  const [modal, setModal] = useState<
    "download" | "topup" | "preview" | "regenerate" | "reset-password" | null
  >(null);
  const [format, setFormat] = useState<"docx" | "pdf">("docx");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [deletedWork, setDeletedWork] = useState<Work | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [topup, setTopup] = useState(10);
  const [accountTab, setAccountTab] = useState("personal");
  const [pendingEmail, setPendingEmail] = useState("");
  const [rewrite, setRewrite] = useState("");
  const [rewriteNote, setRewriteNote] = useState("");
  const topicRef = useRef<HTMLTextAreaElement>(null);
  const savedGeneration = useRef(false);
  const { user, updateProfile, updateTitleDefaults, toggleLinkedAccount } =
    useUserStore();
  const [profile, setProfile] = useState({
    name: user.name,
    email: user.email,
    ...user.titleDefaults,
  });
  const tier = TYPES.find((item) => item.id === form.type)!;
  const title = form.title || demoTitle;
  useEffect(() => {
    document.title = "ГОСТ docx — от темы к готовой работе";
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#08090b" : "#f7f8fb");
  }, [theme]);
  useEffect(() => {
    const syncTheme = (event: StorageEvent) => {
      if (event.key === "gost-studio-theme")
        setTheme(event.newValue === "light" ? "light" : "dark");
    };
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    setError("");
  }, [page, step]);
  useEffect(() => {
    if (page === "home") setSidebarOpen(matchMedia("(min-width: 901px)").matches);
  }, [page]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [sidebarOpen]);
  useEffect(() => {
    const media = matchMedia("(max-width: 700px)");
    let unlock: (() => void) | null = null;
    const sync = () => {
      unlock?.(); unlock = null;
      if (!sidebarOpen || page === "home" || !media.matches) return;
      const y = window.scrollY, body = document.body, root = document.documentElement;
      const previous = {position:body.style.position, top:body.style.top, width:body.style.width, overflow:body.style.overflow, rootOverflow:root.style.overflow};
      body.style.position = "fixed"; body.style.top = `-${y}px`; body.style.width = "100%"; body.style.overflow = "hidden"; root.style.overflow = "hidden";
      unlock = () => { body.style.position=previous.position; body.style.top=previous.top; body.style.width=previous.width; body.style.overflow=previous.overflow; root.style.overflow=previous.rootOverflow; window.scrollTo({left:0, top:currentPage.current === page ? y : 0, behavior:"instant"}); };
    };
    sync(); media.addEventListener("change",sync);
    return () => { media.removeEventListener("change",sync); unlock?.(); };
  }, [sidebarOpen, page]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  useEffect(() => {
    try {
      localStorage.setItem("gost-studio-works", JSON.stringify(works));
    } catch {
      /* Browser storage may be unavailable. */
    }
  }, [works]);
  useEffect(() => {
    if (step !== 3 || page !== "create" || progress >= 100) return;
    const timer = setInterval(
      () => setProgress((p) => Math.min(100, p + 4)),
      350,
    );
    return () => clearInterval(timer);
  }, [step, page, progress >= 100]);
  useEffect(() => {
    if (step === 3 && progress === 100 && !savedGeneration.current) {
      savedGeneration.current = true;
      setWorks((items) => [
        {
          id: crypto.randomUUID(),
          title,
          type: form.type,
          pages: form.pages,
          chapters,
          subject: form.subject,
          notes: form.notes,
          status: "ready",
          date: new Date().toLocaleDateString("ru-RU", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        },
        ...items,
      ]);
    }
  }, [progress === 100]);
  const start = (type: WorkType = "coursework", topic = "") => {
    if (page === "home") setSidebarOpen(matchMedia("(min-width: 901px)").matches);
    else if (matchMedia("(max-width: 700px)").matches) setSidebarOpen(false);
    savedGeneration.current = false;
    setForm({
      ...initialForm,
      type,
      title: topic,
      pages: TYPES.find((t) => t.id === type)!.pages,
    });
    setStep(1);
    setRegenerated(false);
    setRewriteNote("");
    setChapters([]);
    setProgress(0);
    setPage("create");
  };
  const navigate = (next: Page) => {
    if (page !== "home" && matchMedia("(max-width: 700px)").matches) setSidebarOpen(false);
    if (page === "home" && next !== "home") setSidebarOpen(matchMedia("(min-width: 901px)").matches);
    if (next === "create" && !form.title) start();
    else setPage(next);
  };
  const updateForm = (patch: Partial<FormData>) => {
    setForm((old) => ({ ...old, ...patch }));
    if (patch.title !== undefined && patch.title.trim().length >= 5)
      setError("");
  };
  const openWork = (work: Work) => {
    savedGeneration.current = false;
    setForm({
      ...initialForm,
      title: work.title,
      type: work.type,
      pages: work.pages,
      subject: work.subject || "",
      notes: work.notes || "",
    });
    setChapters(
      work.chapters || buildChapters({ ...initialForm, title: work.title }),
    );
    setStep(work.status === "ready" ? 4 : 1);
    setDocumentPage(1);
    setPage("create");
    setRewriteNote("");
  };
  const saveDraft = () => {
    if (!form.title.trim()) {
      setNotice("Добавьте тему, чтобы сохранить черновик");
      return;
    }
    setWorks((items) => [
      {
        id: crypto.randomUUID(),
        title: form.title,
        type: form.type,
        pages: form.pages,
        chapters,
        subject: form.subject,
        notes: form.notes,
        date: "Только что",
        status: "draft",
      },
      ...items,
    ]);
    setNotice("Черновик сохранён в моих работах");
  };
  const makePlan = (event: React.FormEvent) => {
    event.preventDefault();
    if (form.title.trim().length < 5) {
      setError("Опишите тему подробнее — хотя бы 5 символов.");
      topicRef.current?.focus();
      return;
    }
    setChapters(buildChapters(form));
    setRegenerated(false);
    setStep(2);
  };
  const editChapter = (i: number, patch: Partial<Chapter>) =>
    setChapters((items) =>
      items.map((item, j) => (j === i ? { ...item, ...patch } : item)),
    );
  const download = async () => {
    setBusy(true);
    setError("");
    try {
      const data = {
        title,
        docType: form.type,
        authorName: user.titleDefaults.studentName,
        institution: user.titleDefaults.university,
        city: user.titleDefaults.city,
        year: 2026,
      };
      if (format === "docx") {
        const { exportGostDocx } = await import("../lib/docxExport");
        await exportGostDocx(data);
        setNotice("Документ Word скачан");
      } else {
        const { openPdfInBrowser } = await import("../lib/pdfExport");
        openPdfInBrowser({ ...data, university: data.institution });
        setNotice("Открыта версия для печати и сохранения в PDF");
      }
      setModal(null);
    } catch {
      setError("Не удалось скачать документ. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <ChromeTheme.Provider value={theme}>
      {page === "home" ? (
        <Home
          theme={theme}
          toggleTheme={toggleTheme}
          start={start}
          library={() => navigate("library")}
          preview={() => {
            setDocumentPage(1);
            setModal("preview");
          }}
        />
      ) : (
        <div
          className={`workspace ${sidebarOpen ? "workspace-panel-open" : ""}`}
        >
          {sidebarOpen && (
            <aside
              className="sidebar"
              id="workspace-tools"
              aria-label="Панель рабочего пространства"
            >
              <div className="sidebar-identity"><ChromeButton
                  className="sidebar-user"
                  onClick={() => navigate("profile")}
                >
                  <span className="avatar">
                    {user.name
                      .split(" ")
                      .map((v) => v[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <span>
                    <b>{user.name}</b>
                    <small>Личный кабинет</small>
                  </span>
                  <ChevronRight size={15} />
                </ChromeButton>
              </div>
              <ChromeButton
                className="button button-ink new-work"
                onClick={() => start()}
              >
                <Plus size={18} /> Новая работа
              </ChromeButton>
              <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
              <nav aria-label="Рабочее пространство">
                {(
                  [
                    { id: "create", label: "Генератор", icon: AlignLeft },
                    { id: "library", label: "Мои работы", icon: LayoutGrid },
                    { id: "profile", label: "Мой профиль", icon: Settings2 },
                    { id: "referrals", label: "Пригласить друзей", icon: Gift },
                  ] as const
                ).map((item) => (
                  <ChromeButton
                    key={item.id}
                    className={`side-link ${page === item.id ? "active" : ""}`}
                    aria-current={page === item.id ? "page" : undefined}
                    onClick={() => navigate(item.id)}
                  >
                    <item.icon size={19} />
                    <span>{item.label}</span>
                    {item.id === "library" && <small>{works.length}</small>}
                  </ChromeButton>
                ))}
              </nav>
              <div className="sidebar-bottom">
                <div className="balance-box">
                  <span>Ваш баланс</span>
                  <div>
                    <strong>{user.credits}</strong>
                    <small>кредитов</small>
                    <ChromeButton
                      className="icon-button"
                      onClick={() => setModal("topup")}
                      aria-label="Пополнить баланс"
                    >
                      <Plus size={18} />
                    </ChromeButton>
                  </div>
                </div>

              </div>
            </aside>
          )}
          <div className="panel-toggle"><ChromeButton ref={menuButton} className="button button-outline chrome-round" aria-label={sidebarOpen ? "Скрыть панель" : "Открыть панель"} title={sidebarOpen ? "Скрыть боковую панель" : "Открыть боковую панель"} aria-expanded={sidebarOpen} aria-controls="workspace-tools" onClick={() => setSidebarOpen(open => !open)}>{sidebarOpen ? <PanelRightClose size={20}/> : <PanelRightOpen size={20}/>}</ChromeButton></div>
          {sidebarOpen && <div className="panel-backdrop" aria-hidden="true" onClick={() => setSidebarOpen(false)}/>}
          <div className="workspace-body">
            <header className="workspace-header">
              <div className="mobile-brand">
                <Brand onClick={() => setPage("home")} />
              </div>
              <nav
                className="workspace-quick-nav"
                aria-label="Основные разделы"
              >
                <ChromeButton
                  className={page === "create" ? "active" : ""}
                  onClick={() => navigate("create")}
                >
                  Генератор
                </ChromeButton>
                <ChromeButton
                  className={page === "library" ? "active" : ""}
                  onClick={() => navigate("library")}
                >
                  Мои работы
                </ChromeButton>
              </nav>
              <div className="workspace-header-right">
                <ChromeButton className="icon-button header-home" aria-label="На главную" onClick={() => setPage("home")}><HomeIcon size={19}/></ChromeButton>
                <ThemeToggle theme={theme} toggle={toggleTheme} />
                <span className="demo-indicator">Демо-версия</span>
                <ChromeButton
                  className="icon-button"
                  aria-label="Помощь"
                  onClick={() => {
                    setPage("home");
                    setTimeout(
                      () =>
                        document
                          .querySelector(".faq-section")
                          ?.scrollIntoView(),
                      50,
                    );
                  }}
                >
                  <HelpCircle size={19} />
                </ChromeButton>

              </div>
            </header>
            <nav className="mobile-nav" aria-label="Разделы">
              <ChromeButton onClick={() => setPage("home")}>
                <HomeIcon size={16} /> Главная
              </ChromeButton>
              <ChromeButton
                className={page === "create" ? "active" : ""}
                onClick={() => navigate("create")}
              >
                <Plus size={17} /> Генератор
              </ChromeButton>
              <ChromeButton
                className={page === "library" ? "active" : ""}
                onClick={() => navigate("library")}
              >
                <LayoutGrid size={17} /> Работы
              </ChromeButton>
              <ChromeButton
                className={page === "profile" ? "active" : ""}
                onClick={() => navigate("profile")}
              >
                <Settings2 size={17} /> Профиль
              </ChromeButton>
            </nav>
            <main
              className={`workspace-main ${step === 4 && page === "create" ? "viewer-main" : ""}`}
            >
              {page === "create" && (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">ОТ ИДЕИ К ДОКУМЕНТУ</div>
                      <h1>
                        {step === 1
                          ? "С чего начнём?"
                          : step === 2
                            ? "Хорошая работа начинается с плана."
                            : step === 3
                              ? progress === 100
                                ? "Работа собрана."
                                : "Ваша работа обретает форму."
                              : "Всё на своих местах."}
                      </h1>
                    </div>

                  </div>
                  <ol className="stepper">
                    {["Задача", "План", "Генерация", "Результат"].map(
                      (label, i) => (
                        <li
                          key={label}
                          className={
                            step === i + 1
                              ? "current"
                              : step > i + 1
                                ? "complete"
                                : ""
                          }
                        >
                          <ChromeButton
                            disabled={i + 1 >= step || step === 3}
                            onClick={() => setStep(i + 1)}
                            aria-current={step === i + 1 ? "step" : undefined}
                          >
                            <span>
                              {step > i + 1 ? <Check size={14} /> : `0${i + 1}`}
                            </span>
                            {label}
                          </ChromeButton>
                          {i < 3 && <div />}
                        </li>
                      ),
                    )}
                  </ol>
                  {step === 1 && (
                    <form className="create-grid" onSubmit={makePlan}>
                      <aside className="order-summary">
                        <div className="summary-content">
                          <div className="eyebrow">ВАША РАБОТА</div>
                          <h3>{tier.label}</h3>
                          <div className="summary-row">
                            <span>Объём</span>
                            <b>~ {form.pages} страниц</b>
                          </div>
                          <div className="summary-row">
                            <span>Структура</span>
                            <b>{form.chapters} главы</b>
                          </div>
                          <div className="summary-row">
                            <span>Формат</span>
                            <b>Word / PDF</b>
                          </div>
                          <div className="summary-total">
                            <span>Стоимость</span>
                            <strong>
                              {tier.price.toLocaleString("ru-RU")} ₽
                            </strong>
                          </div>
                          <p>
                            Сначала план — затем полная работа.
                            <br />В демо-версии оплата не списывается.
                          </p>
                        </div>
                      </aside>
                      <div className="form-panel">
                        <div className="field-group">
                          <label>Что пишем?</label>
                          <div className="work-type-picker">
                            {TYPES.map((item) => (
                              <ChromeButton
                                type="button"
                                key={item.id}
                                className={
                                  form.type === item.id ? "selected" : ""
                                }
                                aria-pressed={form.type === item.id}
                                onClick={() =>
                                  updateForm({
                                    type: item.id,
                                    pages: item.pages,
                                  })
                                }
                              >
                                <item.icon size={21} />
                                <span>{item.label}</span>
                                {form.type === item.id && <Check size={14} />}
                              </ChromeButton>
                            ))}
                          </div>
                        </div>
                        <div className="field-group">
                          <label htmlFor="work-topic">
                            Тема работы <span>*</span>
                          </label>
                          <div className="generator-input-effect"><FeaturedCard theme={theme}>
                          <textarea
                            id="work-topic"
                            ref={topicRef}
                            value={form.title}
                            onChange={(e) =>
                              updateForm({ title: e.target.value })
                            }
                            placeholder="Например, влияние искусственного интеллекта на банковскую сферу"
                            rows={3}
                            maxLength={500}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? "topic-error" : undefined}
                          />
                          </FeaturedCard></div>
                          <div className="field-help">
                            <span>
                              Чем точнее тема, тем полезнее результат.
                            </span>
                            <span>{form.title.length}/500</span>
                          </div>
                          {error && (
                            <p
                              role="alert"
                              className="form-error"
                              id="topic-error"
                            >
                              {error}
                            </p>
                          )}
                        </div>
                        <div className="field-group">
                          <label htmlFor="work-subject">
                            Предмет <small>необязательно</small>
                          </label>
                          <div className="generator-input-effect"><FeaturedCard theme={theme}>
                          <input
                            id="work-subject"
                            placeholder="Например, экономика"
                            value={form.subject}
                            onChange={(e) =>
                              updateForm({ subject: e.target.value })
                            }
                          />                          </FeaturedCard></div>
                        </div>
                        <div className="form-two-col">
                          <div className="field-group">
                            <label htmlFor="work-pages">
                              Объём <small>страниц</small>
                            </label>
                            <div className="number-input">
                              <ChromeButton
                                type="button"
                                aria-label="Уменьшить объём"
                                disabled={form.pages <= 5}
                                onClick={() =>
                                  updateForm({
                                    pages: Math.max(5, form.pages - 5),
                                  })
                                }
                              >
                                <Minus size={15} />
                              </ChromeButton>
                              <input
                                id="work-pages"
                                type="number"
                                min={5}
                                max={80}
                                value={form.pages}
                                onChange={(e) =>
                                  updateForm({
                                    pages: Math.min(
                                      80,
                                      Math.max(5, Number(e.target.value)),
                                    ),
                                  })
                                }
                              />
                              <ChromeButton
                                type="button"
                                aria-label="Увеличить объём"
                                disabled={form.pages >= 80}
                                onClick={() =>
                                  updateForm({
                                    pages: Math.min(80, form.pages + 5),
                                  })
                                }
                              >
                                <Plus size={15} />
                              </ChromeButton>
                            </div>
                          </div>
                          <div className="field-group">
                            <label>Количество глав</label>
                            <div className="segmented">
                              {[2, 3].map((count) => (
                                <ChromeButton
                                  key={count}
                                  type="button"
                                  className={
                                    form.chapters === count ? "selected" : ""
                                  }
                                  aria-pressed={form.chapters === count}
                                  onClick={() =>
                                    updateForm({ chapters: count })
                                  }
                                >
                                  {count} главы
                                </ChromeButton>
                              ))}
                            </div>
                          </div>
                        </div>
                        <details className="additional-settings">
                          <summary>
                            <SlidersHorizontal size={17} /> Требования и
                            методичка <ChevronDown size={16} />
                          </summary>
                          <div className="field-group">
                            <label htmlFor="work-notes">Ваши пожелания</label>
                            <div className="generator-input-effect"><FeaturedCard theme={theme}>
                            <textarea
                              id="work-notes"
                              rows={3}
                              value={form.notes}
                              onChange={(e) =>
                                updateForm({ notes: e.target.value })
                              }
                              placeholder="Что важно учесть в работе?"
                            />                            </FeaturedCard></div>
                          </div>
                          <label className="upload-area">
                            <Upload size={23} />
                            <b>
                              {form.file
                                ? form.file.name
                                : "Прикрепить методичку"}
                            </b>
                            <span>PDF или DOCX · до 10 МБ</span>
                            <input
                              type="file"
                              accept=".pdf,.docx"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file && file.size > 10 * 1024 * 1024) {
                                  setNotice(
                                    "Максимальный размер файла — 10 МБ",
                                  );
                                  e.target.value = "";
                                } else updateForm({ file: file || null });
                              }}
                            />
                          </label>
                          {form.file && (
                            <ChromeButton
                              type="button"
                              className="text-button"
                              onClick={() => updateForm({ file: null })}
                            >
                              Удалить файл <X size={14} />
                            </ChromeButton>
                          )}
                        </details>
                        <div className="form-action">
                          <ChromeButton type="button" className="button button-outline draft-action" onClick={saveDraft}>Сохранить черновик <Download size={17}/></ChromeButton>
                          <ChromeButton
                            className="button button-accent"
                            type="submit"
                          >
                            Составить план <ArrowRight size={17} />
                          </ChromeButton>
                        </div>
                      </div>
                    </form>
                  )}
                  {step === 2 && (
                    <div className="outline-grid">
                      <div className="outline-panel">
                        <div className="outline-heading">
                          <div>
                            <span className="eyebrow">СОДЕРЖАНИЕ</span>
                            <h2>{title}</h2>
                          </div>
                          <span className="outline-count">
                            {chapters.length} главы
                          </span>
                        </div>
                        <div className="outline-fixed">
                          <span>—</span> Введение{" "}
                          <small>Цель, задачи, актуальность</small>
                        </div>
                        {chapters.map((chapter, i) => (
                          <div className="chapter-block" key={i}>
                            <div className="chapter-heading">
                              <span className="chapter-number">0{i + 1}</span>
                              <input
                                aria-label={`Название главы ${i + 1}`}
                                value={chapter.title}
                                onChange={(e) =>
                                  editChapter(i, { title: e.target.value })
                                }
                              />
                              <ChromeButton className="icon-button chapter-toggle" aria-label={`Подпункты главы ${i+1}`} aria-expanded={openChapters.includes(i)} aria-controls={`chapter-sections-${i}`} onClick={() => setOpenChapters(old => old.includes(i) ? old.filter(v => v !== i) : [...old,i])}><ChevronDown size={18}/></ChromeButton>
                              <div className="chapter-actions">
                                <ChromeButton
                                  className="icon-button"
                                  aria-label={`Поднять главу ${i + 1}`}
                                  disabled={i === 0}
                                  onClick={() =>
                                    setChapters((items) => {
                                      const copy = [...items];
                                      [copy[i - 1], copy[i]] = [
                                        copy[i],
                                        copy[i - 1],
                                      ];
                                      return copy;
                                    })
                                  }
                                >
                                  <ArrowLeft className="rotate-up" size={15} />
                                </ChromeButton>
                                <ChromeButton
                                  className="icon-button"
                                  aria-label={`Удалить главу ${i + 1}`}
                                  disabled={chapters.length <= 1}
                                  onClick={() =>
                                    setChapters((items) =>
                                      items.filter((_, j) => i !== j),
                                    )
                                  }
                                >
                                  <Trash2 size={15} />
                                </ChromeButton>
                              </div>
                            </div>
                            {openChapters.includes(i) && <div className="chapter-sections" id={`chapter-sections-${i}`}>
                            {chapter.sections.map((section, j) => (
                              <div className="section-row" key={j}>
                                <span>
                                  {i + 1}.{j + 1}
                                </span>
                                <input
                                  aria-label={`Параграф ${i + 1}.${j + 1}`}
                                  value={section}
                                  onChange={(e) =>
                                    editChapter(i, {
                                      sections: chapter.sections.map((v, k) =>
                                        k === j ? e.target.value : v,
                                      ),
                                    })
                                  }
                                />
                                <ChromeButton
                                  className="icon-button"
                                  aria-label={`Удалить параграф ${i + 1}.${j + 1}`}
                                  onClick={() =>
                                    editChapter(i, {
                                      sections: chapter.sections.filter(
                                        (_, k) => k !== j,
                                      ),
                                    })
                                  }
                                >
                                  <X size={14} />
                                </ChromeButton>
                              </div>
                            ))}
                            <ChromeButton
                              className="add-section"
                              onClick={() =>
                                editChapter(i, {
                                  sections: [
                                    ...chapter.sections,
                                    "Новый параграф",
                                  ],
                                })
                              }
                            >
                              <Plus size={14} /> Добавить параграф
                            </ChromeButton>
                            </div>}
                          </div>
                        ))}
                        <ChromeButton
                          className="add-chapter"
                          onClick={() =>
                            setChapters((items) => [
                              ...items,
                              {
                                title: "Новая глава",
                                sections: ["Новый параграф"],
                              },
                            ])
                          }
                        >
                          <Plus size={17} /> Добавить главу
                        </ChromeButton>
                        <div className="outline-fixed">
                          <span>—</span> Заключение
                        </div>
                        <div className="outline-fixed">
                          <span>—</span> Список источников
                        </div>
                        <div className="outline-footer"><ChromeButton type="button" className="button button-outline draft-action" onClick={saveDraft}>Сохранить черновик <Download size={17}/></ChromeButton>
                          <ChromeButton
                            className="text-button"
                            onClick={() => setStep(1)}
                          >
                            <ArrowLeft size={16} /> К параметрам
                          </ChromeButton>
                          <ChromeButton
                            className="button button-accent"
                            onClick={() => {
                              setProgress(0);
                              setStep(3);
                            }}
                          >
                            Утвердить план <ArrowRight size={17} />
                          </ChromeButton>
                        </div>
                      </div>
                      <aside className="editor-aside">
                        <span className="aside-mark">
                          <List size={26} />
                        </span>
                        <h3>
                          Ваш план.
                          <br />
                          Ваши правила.
                        </h3>
                        <p>
                          Нажмите на название, чтобы изменить его. Добавьте
                          нужные параграфы, уберите лишнее.
                        </p>
                        <div className="aside-divider" />
                        <ChromeButton
                          className="button button-outline"
                          disabled={regenerated}
                          onClick={() => {
                            setChapters(buildChapters(form, true));
                            setRegenerated(true);
                            setNotice("Новый вариант плана готов");
                          }}
                        >
                          <RefreshCw size={16} />
                          {regenerated
                            ? "Перегенерация использована"
                            : "Другой вариант плана"}
                        </ChromeButton>
                        <small>
                          {regenerated
                            ? "Вы по-прежнему можете редактировать план."
                            : "Одна перегенерация бесплатно"}
                        </small>
                        <div className="quiet-note">
                          Предпросмотр сценария. План составляется локально.
                        </div>
                      </aside>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="generation-layout">
                      <div className="generation-visual">
                        <AiOrb theme={theme} state="solving" />
                        <span className="generation-percent">
                          {progress}
                          <small>%</small>
                        </span>
                      </div>
                      <div className="generation-info">
                        <div className="eyebrow">
                          {progress === 100
                            ? "МОЖНО ОТКРЫВАТЬ"
                            : "СОБИРАЕМ ДЕМОНСТРАЦИОННЫЙ ДОКУМЕНТ"}
                        </div>
                        <h2>
                          {progress === 100
                            ? "Последняя точка поставлена."
                            : "От главы к главе."}
                        </h2>
                        <p className="generation-topic">{title}</p>
                        <div
                          className="progress-track"
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Готовность документа"
                        >
                          <div style={{ width: `${progress}%` }} />
                        </div>
                        <div className="generation-steps">
                          {[
                            "Структура и введение",
                            "Основные главы",
                            "Заключение и источники",
                            "Оформление документа",
                          ].map((label, i) => (
                            <div
                              key={label}
                              className={
                                progress >= (i + 1) * 25
                                  ? "done"
                                  : progress >= i * 25
                                    ? "working"
                                    : ""
                              }
                            >
                              <span>
                                {progress >= (i + 1) * 25 ? (
                                  <Check size={14} />
                                ) : progress >= i * 25 ? (
                                  <Loader2 className="spin" size={14} />
                                ) : (
                                  `0${i + 1}`
                                )}
                              </span>
                              {label}
                            </div>
                          ))}
                        </div>
                        {progress === 100 ? (
                          <div className="generation-actions"><ChromeButton
                            className="button button-accent"
                            onClick={() => {
                              setDocumentPage(1);
                              setStep(4);
                            }}
                          >
                            Посмотреть работу <ArrowRight size={17} />
                          </ChromeButton><ChromeButton className="button button-outline" onClick={() => setModal("download")}><Download size={17}/> Скачать работу</ChromeButton></div>
                        ) : (
                          <p className="muted small">
                            Можно немного выдохнуть. Мы почти закончили.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {step === 4 && (
                    <div className="document-workspace">
                      <div className="document-toolbar">
                        <div>
                          <FileText size={19} />
                          <span>{title}</span>
                          <span className="ready-label">
                            <Check size={13} /> Готово
                          </span>
                        </div>
                        <ChromeButton
                          className="button button-accent"
                          onClick={() => setModal("download")}
                        >
                          <Download size={16} /> Скачать
                        </ChromeButton>
                      </div>
                      <div className="document-layout">
                        <aside className="document-outline">
                          <div className="eyebrow">СОДЕРЖАНИЕ</div>
                          {[
                            "Титульный лист",
                            "Содержание",
                            "Введение",
                            "Глава 1. Теория",
                            "Глава 2. Практика",
                          ].map((label, i) => (
                            <ChromeButton
                              key={label}
                              className={documentPage === i + 1 ? "active" : ""}
                              onClick={() => setDocumentPage(i + 1)}
                            >
                              <span>{String(i + 1).padStart(2, "0")}</span>
                              {label}
                            </ChromeButton>
                          ))}
                          <div className="document-properties">
                            <span>ПАРАМЕТРЫ</span>
                            <p>А4 · Times New Roman</p>
                            <p>14 пт · интервал 1,5</p>
                            <p>ГОСТ 7.32–2017</p>
                          </div>
                          <ChromeButton
                            className="text-button"
                            onClick={() => setModal("regenerate")}
                          >
                            <RefreshCw size={15} /> Уточнить раздел
                          </ChromeButton>
                        </aside>
                        <div className="document-canvas">
                          <div className="viewer-controls">
                            <div className="zoom-control">
                              <ChromeButton
                                aria-label="Уменьшить масштаб"
                                disabled={zoom <= 70}
                                onClick={() =>
                                  setZoom((z) => Math.max(70, z - 10))
                                }
                              >
                                <Minus size={15} />
                              </ChromeButton>
                              <span>{zoom}%</span>
                              <ChromeButton
                                aria-label="Увеличить масштаб"
                                disabled={zoom >= 130}
                                onClick={() =>
                                  setZoom((z) => Math.min(130, z + 10))
                                }
                              >
                                <Plus size={15} />
                              </ChromeButton>
                            </div>
                            <ChromeButton
                              className={`text-button ${guides ? "accent-text" : ""}`}
                              aria-pressed={guides}
                              onClick={() => setGuides(!guides)}
                            >
                              <SlidersHorizontal size={15} /> Поля
                            </ChromeButton>
                          </div>
                          <div
                            className="paper-stage"
                            style={
                              {
                                "--paper-zoom": zoom / 100,
                              } as React.CSSProperties
                            }
                          >
                            <Paper
                              title={title}
                              page={documentPage}
                              chapters={chapters}
                              author={user.titleDefaults.studentName}
                              university={user.titleDefaults.university}
                              margins={guides}
                              type={form.type}
                            />
                          </div>
                          {rewriteNote && (
                            <p className="rewrite-note">
                              <Check size={15} /> Пожелание сохранено:{" "}
                              {rewriteNote}
                            </p>
                          )}
                          <div className="page-pagination">
                            <ChromeButton
                              className="icon-button"
                              aria-label="Предыдущая страница"
                              disabled={documentPage === 1}
                              onClick={() => setDocumentPage((p) => p - 1)}
                            >
                              <ChevronLeft size={18} />
                            </ChromeButton>
                            <span>
                              Страница <b>{documentPage}</b> из 5{" "}
                              <small>· демопример</small>
                            </span>
                            <ChromeButton
                              className="icon-button"
                              aria-label="Следующая страница"
                              disabled={documentPage === 5}
                              onClick={() => setDocumentPage((p) => p + 1)}
                            >
                              <ChevronRight size={18} />
                            </ChromeButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              {page === "library" && (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">ЛИЧНАЯ БИБЛИОТЕКА</div>
                      <h1>Ваши работы.</h1>
                      <p>Всё написанное — в одном месте.</p>
                    </div>
                    <ChromeButton
                      className="button button-accent"
                      onClick={() => start()}
                    >
                      <Plus size={17} /> Новая работа
                    </ChromeButton>
                  </div>
                  <div className="library-overview">
                    <div>
                      <span>Всего работ</span>
                      <strong>
                        {works.length.toString().padStart(2, "0")}
                      </strong>
                    </div>
                    <div>
                      <span>Готовы к скачиванию</span>
                      <strong>
                        {works
                          .filter((w) => w.status === "ready")
                          .length.toString()
                          .padStart(2, "0")}
                      </strong>
                    </div>
                    <div>
                      <span>На вашем балансе</span>
                      <strong>
                        {user.credits}
                        <small>кредитов</small>
                      </strong>
                      <ChromeButton
                        className="text-button"
                        onClick={() => setModal("topup")}
                      >
                        Пополнить <ArrowUpRight size={15} />
                      </ChromeButton>
                    </div>
                  </div>
                  <div className="library-tools">
                    <div className="library-tabs">
                      {[
                        ["all", "Все работы"],
                        ["ready", "Готовые"],
                        ["draft", "Черновики"],
                      ].map(([id, label]) => (
                        <ChromeButton
                          className={filter === id ? "active" : ""}
                          key={id}
                          onClick={() => setFilter(id)}
                        >
                          {label}
                        </ChromeButton>
                      ))}
                    </div>
                    <label className="search-field">
                      <Search size={17} />
                      <input
                        placeholder="Найти работу"
                        aria-label="Найти работу"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                      />
                    </label>
                  </div>
                  <div className="works-list">
                    <div className="works-table-head">
                      <span>НАЗВАНИЕ</span>
                      <span>ОБЪЁМ</span>
                      <span>ДАТА</span>
                      <span>СТАТУС</span>
                      <span />
                    </div>
                    {works
                      .filter(
                        (w) =>
                          (filter === "all" || w.status === filter) &&
                          w.title.toLowerCase().includes(query.toLowerCase()),
                      )
                      .map((work) => {
                        const Icon = TYPES.find(
                          (t) => t.id === work.type,
                        )!.icon;
                        return (
                          <div className="work-row" key={work.id}>
                            <ChromeButton
                              className="work-title"
                              onClick={() => openWork(work)}
                            >
                              <span
                                className={`work-icon work-icon-${work.type}`}
                              >
                                <Icon size={23} strokeWidth={1.4} />
                              </span>
                              <span>
                                <b>{work.title}</b>
                                <small>
                                  {TYPES.find((t) => t.id === work.type)!.label}
                                  {work.id.startsWith("example") && " · пример"}
                                </small>
                              </span>
                            </ChromeButton>
                            <span className="work-meta">{work.pages} стр.</span>
                            <span className="work-meta">{work.date}</span>
                            <span className={`work-status ${work.status}`}>
                              <span />
                              {work.status === "ready" ? "Готово" : "Черновик"}
                            </span>
                            <div className="work-actions">
                              <ChromeButton
                                className="icon-button"
                                aria-label={`Открыть ${work.title}`}
                                onClick={() => openWork(work)}
                              >
                                <ArrowUpRight size={20} />
                              </ChromeButton>
                              <ChromeButton
                                className="icon-button"
                                aria-label={`Удалить ${work.title}`}
                                onClick={() => {
                                  setDeletedWork(work);
                                  setWorks((items) =>
                                    items.filter((item) => item.id !== work.id),
                                  );
                                  setNotice("Работа удалена");
                                }}
                              >
                                <Trash2 size={15} />
                              </ChromeButton>
                            </div>
                          </div>
                        );
                      })}
                    {works.filter(
                      (w) =>
                        (filter === "all" || w.status === filter) &&
                        w.title.toLowerCase().includes(query.toLowerCase()),
                    ).length === 0 && (
                      <div className="empty-state">
                        <Search size={30} />
                        <h3>Пока ничего.</h3>
                        <p>Попробуйте другую тему или создайте новую работу.</p>
                        <ChromeButton
                          className="button button-outline"
                          onClick={() => start()}
                        >
                          Создать работу
                        </ChromeButton>
                      </div>
                    )}
                  </div>
                  <div className="library-bottom-note">
                    <FileText size={17} />
                    <span>Первый шаг к новой работе — всего одна тема.</span>
                    <ChromeButton className="text-button" onClick={() => start()}>
                      Начать <ArrowRight size={16} />
                    </ChromeButton>
                  </div>
                </>
              )}
              {page === "profile" && (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">ЛИЧНЫЙ КАБИНЕТ</div>
                      <h1>Знакомство в деталях.</h1>
                      <p>Заполните один раз. Используйте в каждой работе.</p>
                    </div>
                  </div>
                  <div className="profile-layout">
                    <div className="profile-tabs">
                      {[
                        ["personal", "Личные данные"],
                        ["title", "Титульный лист"],
                      ].map(([id, label]) => (
                        <ChromeButton
                          className={accountTab === id ? "active" : ""}
                          key={id}
                          onClick={() => setAccountTab(id)}
                        >
                          {label}
                          <ChevronRight size={15} />
                        </ChromeButton>
                      ))}
                      <ChromeButton onClick={() => setPage("referrals")}>
                        Пригласить друзей <ArrowUpRight size={15} />
                      </ChromeButton>
                    </div>
                    <form
                      className="profile-form form-panel"
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateProfile({
                          name: profile.name,
                          email: profile.email,
                        });
                        const { name, email, ...defaults } = profile;
                        updateTitleDefaults(defaults);
                        setNotice("Изменения сохранены");
                      }}
                    >
                      <h2>
                        {accountTab === "personal"
                          ? "Личные данные"
                          : "Данные для титульного листа"}
                      </h2>
                      {(accountTab === "personal"
                        ? [
                            ["name", "Ваше имя"],

                          ]
                        : [
                            ["studentName", "ФИО студента"],
                            ["university", "Университет"],
                            ["faculty", "Факультет"],
                            ["department", "Кафедра"],
                            ["specialty", "Специальность"],
                            ["course", "Курс"],
                            ["group", "Группа"],
                            ["supervisor", "Научный руководитель"],
                            ["city", "Город"],
                          ]
                      ).map(([key, label]) => (
                        <div className="field-group" key={key}>
                          <label htmlFor={`profile-${key}`}>{label}</label>
                          <input
                            id={`profile-${key}`}
                            type={key === "email" ? "email" : "text"}
                            value={(profile as any)[key]}
                            onChange={(e) =>
                              setProfile((p) => ({
                                ...p,
                                [key]: e.target.value,
                              }))
                            }
                            required={["name", "email", "studentName"].includes(
                              key,
                            )}
                          />
                        </div>
                      ))}
                      {accountTab === "personal" && <div className="account-settings">
                        <div className="field-group"><label htmlFor="account-email">Текущая почта</label><input id="account-email" type="email" value={user.email} readOnly autoComplete="email"/></div>
                        <details className="account-detail"><summary>Изменить почту <ChevronDown size={17}/></summary><div className="field-group"><label htmlFor="new-account-email">Новая почта</label><input id="new-account-email" type="email" autoComplete="off" value={pendingEmail} onChange={e=>setPendingEmail(e.target.value)} placeholder="name@example.ru"/></div><p className="quiet-note">На новый адрес потребуется отправить письмо с подтверждением. Сейчас доступен только интерфейс.</p><ChromeButton type="button" className="button button-outline" disabled={!pendingEmail.includes("@")} onClick={()=>setNotice("Демо: отправка подтверждения почты пока не подключена")}>Подтвердить новую почту</ChromeButton></details>
                        <details className="account-detail"><summary>Изменить пароль <ChevronDown size={17}/></summary><div className="field-group"><label htmlFor="current-password">Текущий пароль</label><input id="current-password" type="password" autoComplete="current-password"/></div><div className="field-group"><label htmlFor="new-password">Новый пароль</label><input id="new-password" type="password" autoComplete="new-password" minLength={8}/></div><div className="field-group"><label htmlFor="confirm-password">Повторите новый пароль</label><input id="confirm-password" type="password" autoComplete="new-password"/></div><p className="quiet-note">Не менее 8 символов. Изменение пароля подключим позже.</p><ChromeButton type="button" className="button button-outline" onClick={()=>setNotice("Демо: изменение пароля пока не подключено")}>Обновить пароль</ChromeButton><ChromeButton type="button" className="text-button recovery-link" onClick={()=>setModal("reset-password")}>Не помню текущий пароль</ChromeButton></details>
                        <ChromeButton type="button" className="text-button recovery-link" onClick={()=>setModal("reset-password")}>Забыли пароль?</ChromeButton>
                      </div>}
                      <ChromeButton className="button button-ink" type="submit">
                        Сохранить изменения <Check size={17} />
                      </ChromeButton>
                      {accountTab === "personal" && (
                        <details className="connected-accounts">
                          <summary>
                            Подключённые аккаунты <ChevronDown size={16} />
                          </summary>
                          {(
                            [
                              ["yandex", "Яндекс"],
                              ["google", "Google"],
                              ["telegram", "Telegram"],
                            ] as const
                          ).map(([id, label]) => (
                            <div key={id}>
                              <span>{label}</span>
                              <ChromeButton
                                type="button"
                                className="text-button"
                                onClick={() => toggleLinkedAccount(id)}
                              >
                                {user.linkedAccounts[id]
                                  ? "Отключить"
                                  : "Подключить"}
                                <ArrowUpRight size={14} />
                              </ChromeButton>
                            </div>
                          ))}
                          <p className="quiet-note">
                            Демонстрация настроек. Вход через внешние сервисы
                            ещё не подключён.
                          </p>
                        </details>
                      )}
                    </form>
                  </div>
                </>
              )}
              {page === "referrals" && (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">ВМЕСТЕ ПРОЩЕ</div>
                      <h1>Хорошим делятся.</h1>
                      <p>Приглашайте друзей и получайте кредиты на работы.</p>
                    </div>
                  </div>
                  <div className="referral-hero">
                    <div>
                      <Gift size={36} strokeWidth={1.2} />
                      <h2>
                        Больше идей.
                        <br />
                        <em>Меньше расходов.</em>
                      </h2>
                      <p>Ваша персональная ссылка для друзей.</p>
                      <div className="referral-link">
                        <code>gostdoc.ai/ref/{user.referralCode}</code>
                        <ChromeButton
                          className="button button-ink"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                `https://gostdoc.ai/ref/${user.referralCode}`,
                              );
                              setNotice("Ссылка скопирована");
                            } catch {
                              setNotice(
                                "Не удалось скопировать. Выделите ссылку вручную.",
                              );
                            }
                          }}
                        >
                          <Copy size={16} /> Скопировать
                        </ChromeButton>
                      </div>
                      <small>
                        Демо-статистика. Реферальная система ещё не подключена.
                      </small>
                    </div>
                    <div className="referral-stat">
                      <span>КРЕДИТОВ ЗАРАБОТАНО</span>
                      <strong>{user.referralEarnedCredits}</strong>
                      <p>{user.referralSignups} друзей зарегистрировались</p>
                    </div>
                  </div>
                  <div className="referral-history">
                    <div className="section-topline">
                      <h2>История приглашений</h2>
                      <span className="eyebrow">ДЕМО-СТАТИСТИКА</span>
                    </div>
                    {user.referrals.map((ref) => (
                      <div className="referral-history-row" key={ref.id}>
                        <span className="avatar">{ref.friendName[0]}</span>
                        <div>
                          <b>{ref.friendName}</b>
                          <small>{ref.docTitle}</small>
                        </div>
                        <span>{ref.date}</span>
                        <strong>+{ref.rewardCredits} кредитов</strong>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </main>
            <footer className="workspace-footer">
              <span>ГОСТ docx © 2026</span>
              <span>Большая работа начинается с маленького шага.</span>
            </footer>
          </div>
        </div>
      )}
      <Modal
        open={modal === "preview"}
        onClose={() => setModal(null)}
        title="Всё дело в оформлении"
        wide
      >
        <div className="preview-modal-meta">
          <span>Пример курсовой работы</span>
          <span>ГОСТ 7.32–2017</span>
        </div>
        <div className="sample-paper-wrap">
          <Paper title={demoTitle} page={documentPage} />
        </div>
        <div className="modal-bottom">
          <div className="page-pagination">
            <ChromeButton
              className="icon-button"
              aria-label="Предыдущая страница примера"
              disabled={documentPage === 1}
              onClick={() => setDocumentPage((p) => p - 1)}
            >
              <ChevronLeft size={18} />
            </ChromeButton>
            <span>{documentPage} / 5</span>
            <ChromeButton
              className="icon-button"
              aria-label="Следующая страница примера"
              disabled={documentPage === 5}
              onClick={() => setDocumentPage((p) => p + 1)}
            >
              <ChevronRight size={18} />
            </ChromeButton>
          </div>
          <ChromeButton
            className="button button-accent"
            onClick={() => {
              setModal(null);
              start();
            }}
          >
            Хочу свою работу <ArrowUpRight size={17} />
          </ChromeButton>
        </div>
      </Modal>
      <Modal open={modal === "reset-password"} onClose={()=>setModal(null)} title="Восстановить пароль"><p className="modal-description">Укажите почту вашего аккаунта.</p><div className="field-group"><label htmlFor="recovery-email">Электронная почта</label><input id="recovery-email" type="email" defaultValue={user.email} autoComplete="email"/></div><p className="quiet-note">Это предварительный интерфейс. Отправка письма и восстановление пароля ещё не подключены.</p><ChromeButton className="button button-accent full-width" onClick={()=>setNotice("Демо: отправка ссылки для восстановления пока не подключена")}>Получить ссылку</ChromeButton></Modal>
      <Modal
        open={modal === "download"}
        onClose={() => setModal(null)}
        title="Забрать работу"
      >
        <p className="modal-description">{title}</p>
        <div className="download-options">
          {[
            ["docx", "Word", "Редактируйте и дополняйте"],
            ["pdf", "PDF / печать", "Сохраните через окно печати"],
          ].map(([id, label, description]) => (
            <ChromeButton
              key={id}
              className={format === id ? "selected" : ""}
              aria-pressed={format === id}
              onClick={() => setFormat(id as any)}
            >
              <FileText size={25} />
              <span>
                <b>{label}</b>
                <small>{description}</small>
              </span>
              <span className="radio-dot">
                {format === id && <Check size={12} />}
              </span>
            </ChromeButton>
          ))}
        </div>
        <div className="quiet-note">
          В демо-версии скачивается пример оформления с вашей темой.
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <ChromeButton
          className="button button-accent full-width"
          disabled={busy}
          onClick={download}
        >
          {busy ? (
            <Loader2 size={17} className="spin" />
          ) : (
            <Download size={17} />
          )}
          {busy
            ? "Готовим файл…"
            : format === "pdf"
              ? "Открыть для печати"
              : "Скачать .docx"}
        </ChromeButton>
      </Modal>
      <Modal
        open={modal === "topup"}
        onClose={() => setModal(null)}
        title="Больше возможностей"
      >
        <p className="modal-description">
          На балансе {user.credits} кредитов. Выберите пакет.
        </p>
        <div className="topup-options">
          {[5, 10, 25].map((count) => (
            <ChromeButton
              key={count}
              className={topup === count ? "selected" : ""}
              aria-pressed={topup === count}
              onClick={() => setTopup(count)}
            >
              <strong>{count}</strong>
              <span>кредитов</span>
              <b>{count * 10} ₽</b>
            </ChromeButton>
          ))}
        </div>
        <div className="quiet-note">
          Демонстрация интерфейса. Платёжный сервис не подключён, деньги не
          списываются.
        </div>
        <ChromeButton
          className="button button-ink full-width"
          onClick={() => {
            useUserStore.getState().addCredits(topup);
            setModal(null);
            setNotice(`Демо-баланс пополнен на ${topup} кредитов`);
          }}
        >
          Пополнить демо-баланс <ArrowRight size={17} />
        </ChromeButton>
      </Modal>
      <Modal
        open={modal === "regenerate"}
        onClose={() => setModal(null)}
        title="Немного точнее"
      >
        <p className="modal-description">Что изменить в текущем разделе?</p>
        <div className="field-group">
          <label htmlFor="rewrite-request">Ваше пожелание</label>
          <textarea
            id="rewrite-request"
            rows={4}
            placeholder="Например, добавьте практический пример"
            value={rewrite}
            onChange={(e) => setRewrite(e.target.value)}
          />
        </div>
        <div className="quiet-note">
          В демо-версии пожелание сохранится рядом с документом. Генерация
          текста ещё не подключена.
        </div>
        <ChromeButton
          className="button button-accent full-width"
          disabled={!rewrite.trim()}
          onClick={() => {
            setRewriteNote(rewrite);
            setModal(null);
            setNotice("Пожелание сохранено");
          }}
        >
          Сохранить пожелание <Check size={17} />
        </ChromeButton>
      </Modal>
      {notice && (
        <div className="toast-message" role="status">
          <CheckCheck size={18} />
          <span>{notice}</span>
          {notice === "Работа удалена" && deletedWork && (
            <ChromeButton
              className="undo-delete"
              onClick={() => {
                setWorks((items) => [deletedWork, ...items]);
                setDeletedWork(null);
                setNotice("Работа восстановлена");
              }}
            >
              Отменить
            </ChromeButton>
          )}
          <ChromeButton aria-label="Скрыть уведомление" onClick={() => setNotice("")}>
            <X size={16} />
          </ChromeButton>
        </div>
      )}
    </ChromeTheme.Provider>
  );
}
