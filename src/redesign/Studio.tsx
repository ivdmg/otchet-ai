import { PrototypeApi, errorText, money, statuses } from "./prototypeApi";
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
  UserRound,
  LogIn,
  LogOut,
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
  status: "ready" | "draft" | "failed" | "processing";
  chapters?: Chapter[];
  actualPages?: number;
  serverState?: string;
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
    pages: 10,
    icon: FileText,
    caption: "Коротко и по делу",
    features: [
      "До 10 страниц",
      "Титульный лист и источники",
      "Оформление по ГОСТу",
    ],
  },
  {
    id: "coursework" as WorkType,
    label: "Курсовая",
    price: 490,
    pages: 25,
    icon: BookOpen,
    caption: "От теории к практике",
    features: [
      "До 25 страниц",
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
  pages: 25,
  chapters: 2,
  notes: "",
  file: null,
};
const demoTitle = "Искусственный интеллект в банковской сфере";
const FAQ = [
  [
    "Что я получу в итоге?",
    "Редактируемый файл Word с титульным листом, содержанием, основным текстом и списком источников. Word и PDF доступны 24 часа после завершения. Сохраните оба файла.",
  ],
  [
    "Можно использовать требования моего вуза?",
    "Да. Добавьте требования текстом. Загрузка методички пока недоступна. Данные для титульного листа можно заполнить в профиле.",
  ],
  [
    "Можно изменить план?",
    "Да. Переименовывайте главы и параграфы, добавляйте разделы и меняйте их порядок. Один AI-план на черновик бесплатно; ручные правки бесплатны.",
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
  actualPages?: number;
  serverState?: string;
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
              : [{title:"Теоретические основы",sections:["Основные понятия","Подходы к исследованию"]},{title:"Практический анализ",sections:["Анализ и рекомендации"]}]
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
  const [works, setWorks] = useState<Work[]>([]);
  const [api] = useState(() => new PrototypeApi(() => {}));
  const adoptedOutline = useRef<string | null>(null);
  const adoptedSettings = useRef<string | null>(null);
  const [account, setAccount] = useState<any>(null);
  const [catalog, setCatalog] = useState<any>(null);
  const [activeDoc, setActiveDoc] = useState<any>(null);
  const [docId, setDocId] = useState<string | null>(() => sessionStorage.getItem('studio-delivery-document'));
  const [signedIn, setSignedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [authName, setAuthName] = useState('');
  const [planPending, setPlanPending] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login'|'register'|'verify'>('login');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [registeredId, setRegisteredId] = useState(() => sessionStorage.getItem('studio-pending-verification') || '');
  const [paymentMethod, setPaymentMethod] = useState<'cash'|'bonus'>('cash');
  const [approval, setApproval] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [documentPage, setDocumentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [guides, setGuides] = useState(false);
  const [modal, setModal] = useState<
    "login" | "logout" | "payment" | "download" | "topup" | "preview" | "regenerate" | "reset-password" | null
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
  const selectedType = TYPES.find((item) => item.id === form.type)!;
  const tier = {...selectedType,price:catalog?.types?.[form.type]?.price / 100 || selectedType.price};
  const title = form.title || demoTitle;
  const generationJob = activeDoc?.jobs?.find((j:any)=>j.kind==='document');
  const generationFailed = generationJob?.status==='failed';
  const generationThresholds = [5,75,85,100];
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
  const clearSession = () => {
    api.csrf='';setSignedIn(false);setWorks([]);setAccount(null);setActiveDoc(null);setDocId(null);
    setChapters([]);setApproval(null);setProgress(0);setPlanPending(false);
    sessionStorage.removeItem('studio-delivery-document');
    useUserStore.setState({user:{...user,id:'',name:'',email:'',credits:0,referralCode:'',referrals:[],referralSignups:0,referralEarnedCredits:0,titleDefaults:{university:'',faculty:'',department:'',specialty:'',city:'',course:'',group:'',studentName:'',supervisor:''}}});
  };
  api.expired = () => {clearSession();setModal('login');};
  const applyUser = (u:any) => {
    const defaults = {university:'',faculty:'',department:'',specialty:'',city:'',course:'',group:'',studentName:'',supervisor:'',...u.title_defaults};
    const name = u.name || u.email.split('@')[0];
    updateProfile({id:u.id,email:u.email,name,credits:0,referrals:[],titleDefaults:defaults});
    setProfile({name,email:u.email,...defaults});setSignedIn(true);
  };
  const logout = async () => {
    setBusy(true);setError('');try {await api.request('/auth/logout','POST');clearSession();setModal(null);setNotice('Вы вышли из аккаунта');}
    catch(e){setError(errorText(e));}finally{setBusy(false);}
  };
  const saveProfile = async (e:React.FormEvent) => {
    e.preventDefault();setBusy(true);setError('');
    try {const {name,email,...title_defaults}=profile;
      const r=await api.request<any>('/auth/profile','PUT',{name,title_defaults});applyUser(r.user);await refreshLibrary();setNotice('Изменения сохранены');
    }catch(e){setError(errorText(e));}finally{setBusy(false);}
  };
  const refreshLibrary = async () => {
    const result = await api.request<any>('/documents');
    setWorks(result.items.filter((d:any) => d.state !== 'archived').map((d:any) => ({
      id:d.id,title:d.topic,type:d.doc_type,pages:d.requested_pages || d.settings?.pages || 0,
      actualPages:d.actual_pages,date:new Date(d.created*1000).toLocaleDateString('ru-RU'),
      status:['draft','planning','plan_ready','approved'].includes(d.state) ? 'draft':d.state==='completed'?'ready':d.state==='failed'?'failed':'processing',
      serverState:d.state,chapters:d.plan?.chapters,subject:d.settings?.subject,notes:d.settings?.notes,
    })));
    const balance = await api.request<any>('/referrals');
    setAccount(balance);
    updateProfile({credits:balance.available/100,referralSignups:balance.registered,
      referralCode:balance.code,referralEarnedCredits:balance.history.filter((e:any)=>e.kind==='mature').reduce((n:number,e:any)=>n+e.amount,0)/100,referrals:[]});
  };
  const adopt = (d:any) => {
    setActiveDoc(d);
    setPlanPending(d.state==='planning');
    if(d.state==='planning') setStep(2);
    if (d.settings?.pages && adoptedSettings.current !== d.id) {setForm({...initialForm,...d.settings,title:d.topic,type:d.doc_type,file:null});adoptedSettings.current=d.id;}
    if (d.plan?.chapters && adoptedOutline.current !== d.id) {setChapters(d.plan.chapters);adoptedOutline.current=d.id;setStep(2);}
    const job = d.jobs.find((j:any) => j.kind==='document') || d.jobs.find((j:any)=>j.kind==='plan');
    if (job?.kind==='document') {setStep(3);setProgress(job.percent);}

    if(d.state==='expired') setError('Срок выдачи истёк. Файлы и текст удалены; сохранена только запись о работе.');
    if (job?.status==='failed') setError((statuses[d.order?.state] || 'Генерация не завершена')+': '+(job.error==='ai_access_denied' ? 'Groq отклонил запрос генерации (HTTP 403). Попробуйте позже; деньги не списаны.' : job.error));
  };
  useEffect(() => {
    const requestedAuth = new URLSearchParams(location.search).get('auth');
    if(requestedAuth==='login' || requestedAuth==='register') {setAuthMode(requestedAuth);setModal('login');}
    api.request<any>('/catalog').then(setCatalog).catch(e=>setError(errorText(e)));
    api.request<any>('/auth/me').then(async r=>{
      api.csrf=r.csrf_token;applyUser(r.user);await refreshLibrary();
      if(docId) {adopt(await api.request('/documents/'+docId));setPage('create');}
    }).catch(()=>clearSession()).finally(()=>setAuthChecked(true));
    const ref = new URLSearchParams(location.search).get('ref');
    if(ref) api.request('/referrals/capture/'+encodeURIComponent(ref)).catch(()=>{});
  },[]);
  useEffect(() => {
    if(!docId || !api.csrf) return;
    let disposed=false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {try {
      const d = await api.request<any>('/documents/'+docId);
      if(disposed) return;
      adopt(d);
      if(['completed','failed','expired'].includes(d.state)) await refreshLibrary();
      if(!disposed && ['planning','generating','ordered'].includes(d.state)) timer=setTimeout(poll,2500);
    } catch(e) {if(!disposed) {setError(errorText(e));timer=setTimeout(poll,5000);}}};
    poll();
    return ()=>{disposed=true;clearTimeout(timer);};
  },[docId,signedIn,activeDoc?.order?.id]);
  const input = () => ({topic:form.title,doc_type:form.type,pages:form.pages,chapters:form.chapters,
    subject:form.subject,notes:form.notes,anonymized:true,input_version:catalog?.version});
  const requireLogin = () => {if(!api.csrf){setModal('login');return false;}return true;};
  const switchAuth = (mode:'login'|'register'|'verify') => {setAuthMode(mode);setError('');setConfirmPassword('');};
  const signIn = async () => {
    const r=await api.request<any>('/auth/login','POST',{email:authEmail.trim(),password:authPassword});
    api.csrf=r.csrf_token;setAuthPassword('');setConfirmPassword('');applyUser(r.user);
    setDocId(null);setActiveDoc(null);setChapters([]);setStep(1);setProgress(0);adoptedOutline.current=null;
    sessionStorage.removeItem('studio-delivery-document');
    const cleanAuthUrl = new URL(location.href);cleanAuthUrl.searchParams.delete('auth');
    history.replaceState(null,'',cleanAuthUrl);
    await refreshLibrary();setModal(null);setAuthMode('login');
  };
  const authenticate = async (e:React.FormEvent) => {
    e.preventDefault();setError('');
    if(authMode==='register' && authPassword!==confirmPassword){setError('Пароли не совпадают.');return;}
    setBusy(true);
    try {
      if(authMode==='register') {
        const r=await api.request<any>('/auth/register','POST',{email:authEmail.trim(),password:authPassword,name:authName.trim()});
        if(r.verified){await signIn();return;}
        setRegisteredId(r.id);sessionStorage.setItem('studio-pending-verification',r.id);
        setAuthMode('verify');setConfirmPassword('');setVerificationToken('');
      } else if(authMode==='verify') {
        await api.request('/auth/verify','POST',{token:verificationToken.trim()});
        sessionStorage.removeItem('studio-pending-verification');setRegisteredId('');setVerificationToken('');
        setAuthMode('login');
        if(authPassword) await signIn();
        else {setAuthMode('login');setNotice('Почта подтверждена. Войдите с вашим паролем.');}
      } else await signIn();
    } catch(e) {
      setError(errorText(e));
      if(e instanceof Error && e.message==='email_verification_required') setAuthMode('verify');
    } finally {setBusy(false);}
  };
  const start = (type: WorkType = "coursework", topic = "") => {
    if (page === "home") setSidebarOpen(matchMedia("(min-width: 901px)").matches);
    else if (matchMedia("(max-width: 700px)").matches) setSidebarOpen(false);
    setDocId(null);setActiveDoc(null);sessionStorage.removeItem("studio-delivery-document");
    savedGeneration.current = false;
    setForm({
      ...initialForm,
      type,
      title: topic,
      pages: catalog?.types?.[type]?.default_pages || TYPES.find((t) => t.id === type)!.pages,
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
    if(docId){setDocId(null);setActiveDoc(null);sessionStorage.removeItem("studio-delivery-document");}
    setForm((old) => ({ ...old, ...patch }));
    if (patch.title !== undefined && patch.title.trim().length >= 5)
      setError("");
  };
  const openWork = async (work:Work) => {
    if(work.status!=='draft') return;
    try {const d=await api.request<any>('/documents/'+work.id);setDocId(work.id);adopt(d);setStep(d.plan?2:1);setPage('create');}
    catch(e){setError(errorText(e));}
  };
  const saveDraft = async () => {
    if(!requireLogin()) return;
    setBusy(true);try {
      if(docId && ['plan_ready','approved'].includes(activeDoc?.state)) await api.request('/documents/'+docId+'/plan','PUT',{chapters});
      else if(!docId){const d=await api.request<any>('/drafts','POST',input());setDocId(d.document_id);}
      await refreshLibrary();setNotice('Черновик сохранён');
    }catch(e){setError(errorText(e));}finally{setBusy(false);}
  };
  const makePlan = async (event:React.FormEvent) => {
    event.preventDefault();if(!requireLogin()) return;setBusy(true);setError('');setPlanPending(true);setStep(2);
    try {
      if(docId && activeDoc?.plan){setStep(2);return;}
      const d=docId ? await api.request<any>('/documents/'+docId+'/generate-plan','POST') : await api.request<any>('/documents','POST',input());
      setDocId(d.document_id);sessionStorage.setItem('studio-delivery-document',d.document_id);
      setActiveDoc(await api.request('/documents/'+d.document_id));
    }catch(e){setPlanPending(false);setError(errorText(e));}finally{setBusy(false);}
  };
  const checkout = async () => {
    setBusy(true);try {
      await api.request('/documents/'+docId+'/plan','PUT',{chapters});
      const q=await api.request<any>('/documents/'+docId+'/approve','POST');
      setApproval(q);setPaymentMethod('cash');setError('');setForm(old=>({...old,chapters:chapters.length}));await refreshLibrary();setModal('payment');
    }catch(e){setError(errorText(e));}finally{setBusy(false);}
  };
  const pay = async () => {
    setBusy(true);try {
      await api.request('/documents/'+docId+'/orders','POST',{method:paymentMethod,approval_hash:approval.approval_hash});
      sessionStorage.setItem('studio-delivery-document',docId!);
      setModal(null);setStep(3);adopt(await api.request('/documents/'+docId));
    }catch(e){setError(errorText(e));}finally{setBusy(false);}
  };
  const editChapter = (i: number, patch: Partial<Chapter>) =>
    setChapters((items) =>
      items.map((item, j) => (j === i ? { ...item, ...patch } : item)),
    );
  const deliveryUrl = (kind:string,inline=false) => `/api/v1/deliveries/${activeDoc?.delivery_id}/${kind}${inline?'?inline=true':''}`;
  const download = async () => {
    if(!activeDoc?.delivery_id) {setError('Срок выдачи истёк или файлы ещё не готовы');return;}
    const a=document.createElement('a');a.href=deliveryUrl(format);a.download=`gostdoc.${format}`;a.click();setModal(null);
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
              <div className={`sidebar-identity sidebar-account ${signedIn ? 'is-signed-in' : 'is-guest'}`}>{!signedIn && <div className="sidebar-guest"><UserRound size={18} aria-hidden="true"/><span><b>Гостевой режим</b><small>Войдите, чтобы сохранять черновики</small></span></div>}<ChromeButton
                  className="sidebar-user"
                  disabled={!authChecked}
                  onClick={() => signedIn ? navigate("profile") : setModal("login")}
                >
                  {signedIn ? <span className="avatar" aria-hidden="true">
                    {user.name.trim()
                      .split(" ")
                      .map((v) => v[0])
                      .slice(0, 2)
                      .join("")}
                  </span> : <LogIn size={18} aria-hidden="true"/>}
                  <span>
                    <b>{signedIn ? user.name : authChecked ? "Войти или создать аккаунт" : "Проверяем вход…"}</b>
                    {signedIn && <small title={user.email}>{user.email}</small>}
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
                      onClick={() => setModal(api.csrf ? "topup" : "login")}
                      aria-label="О кредитах и балансе"
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
                onClick={() => signedIn ? navigate("profile") : setModal("login")}
              >
                <Settings2 size={17} /> Профиль
              </ChromeButton>
            </nav>
            <main
              className="workspace-main"
            >
              {['library','profile','referrals'].includes(page) && !signedIn && <section className="access-gate form-panel">
                <span className="aside-mark"><FileText size={28}/></span>
                <div className="eyebrow">ВАШЕ ПРОСТРАНСТВО</div>
                <h1>{authChecked ? 'Войдите, чтобы продолжить' : 'Проверяем вход…'}</h1>
                <p>{page==='referrals' ? 'Ваша ссылка, приглашения и бонусы появятся после входа.' : 'Работы и личные данные доступны только в вашем аккаунте. Создайте его, чтобы сохранять планы и возвращаться к ним.'}</p>
                <div className="gate-actions"><ChromeButton disabled={!authChecked} className="button button-accent" onClick={()=>{switchAuth('login');setModal('login');}}>Войти</ChromeButton><ChromeButton disabled={!authChecked} className="button button-outline" onClick={()=>{switchAuth('register');setModal('login');}}>Создать аккаунт</ChromeButton></div>
              </section>}
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
                    {["Задача", "План", "Генерация"].map(
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
                            disabled={planPending || i + 1 >= step || step === 3 || !!activeDoc?.order}
                            onClick={() => setStep(i + 1)}
                            aria-current={step === i + 1 ? "step" : undefined}
                          >
                            <span>
                              {step > i + 1 ? <Check size={14} /> : `0${i + 1}`}
                            </span>
                            {label}
                          </ChromeButton>
                          {i < 2 && <div />}
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
                                    pages: catalog?.types?.[item.id]?.default_pages || item.pages,
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
                            maxLength={400}
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? "topic-error" : undefined}
                          />
                          </FeaturedCard></div>
                          <div className="field-help">
                            <span>
                              Чем точнее тема, тем полезнее результат.
                            </span>
                            <span>{form.title.length}/400</span>
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
                            maxLength={200}
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
                                disabled={form.pages <= 1}
                                onClick={() =>
                                  updateForm({
                                    pages: Math.max(1, form.pages - 1),
                                  })
                                }
                              >
                                <Minus size={15} />
                              </ChromeButton>
                              <input
                                id="work-pages"
                                type="number"
                                min={1}
                                max={catalog?.types?.[form.type]?.max_pages || 10}
                                value={form.pages}
                                onChange={(e) =>
                                  updateForm({
                                    pages: Math.min(
                                      catalog?.types?.[form.type]?.max_pages || 10,
                                      Math.max(1, Math.trunc(Number(e.target.value))),
                                    ),
                                  })
                                }
                              />
                              <ChromeButton
                                type="button"
                                aria-label="Увеличить объём"
                                disabled={form.pages >= (catalog?.types?.[form.type]?.max_pages || 10)}
                                onClick={() =>
                                  updateForm({
                                    pages: Math.min(catalog?.types?.[form.type]?.max_pages || 10, form.pages + 1),
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
                            <SlidersHorizontal size={17} /> Требования <ChevronDown size={16} />
                          </summary>
                          <div className="field-group">
                            <label htmlFor="work-notes">Ваши пожелания</label>
                            <div className="generator-input-effect"><FeaturedCard theme={theme}>
                            <textarea
                              id="work-notes"
                              maxLength={4000}
                              rows={3}
                              value={form.notes}
                              onChange={(e) =>
                                updateForm({ notes: e.target.value })
                              }
                              placeholder="Что важно учесть в работе?"
                            />                            </FeaturedCard></div>
                          </div>
                        </details>
                        <div className="form-action">
                          <ChromeButton type="button" className="button button-outline draft-action" onClick={saveDraft}>Сохранить черновик <Download size={17}/></ChromeButton>
                          <ChromeButton
                            className="button button-accent"
                            disabled={busy || activeDoc?.state === "planning"}
                            type="submit"
                          >
                            {busy || activeDoc?.state === "planning" ? "Составляем AI-план…" : "Составить план бесплатно"} <ArrowRight size={17} />
                          </ChromeButton>
                        </div>
                      </div>
                    </form>
                  )}
                  {step === 2 && (planPending || !chapters.length) && <section className="plan-wait form-panel" aria-busy={planPending}>
                    <div role="status" aria-live="polite"><AiOrb theme={theme}/><h2>{planPending ? 'Составляем ваш план' : 'План пока не готов'}</h2>
                    <p>{planPending ? 'Подбираем главы и параграфы по вашей теме. План появится здесь автоматически.' : 'Не удалось получить план. Вернитесь к параметрам или откройте черновик позже.'}</p></div>
                    {planPending && <div className="plan-skeleton" aria-hidden="true">{[1,2,3].map(i=><div key={i}><span/><span/><span/></div>)}</div>}
                    {!planPending && <ChromeButton className="button button-outline" onClick={()=>setStep(1)}>К параметрам</ChromeButton>}
                  </section>}
                  {step === 2 && !planPending && chapters.length > 0 && (
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
                                  disabled={chapters.length <= 2}
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
                          disabled={chapters.length >= 3}
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
                            disabled={busy || !chapters.length}
                            onClick={checkout}
                          >
                            Оплатить и начать генерацию <ArrowRight size={17} />
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
                        <small>Один AI-план на черновик. Ручные правки бесплатны.</small>
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
                          {generationFailed ? "ГЕНЕРАЦИЯ ОСТАНОВЛЕНА" : progress === 100
                            ? "МОЖНО ОТКРЫВАТЬ"
                            : "СОБИРАЕМ ВАШ ДОКУМЕНТ"}
                        </div>
                        <h2>
                          {generationFailed ? "Не удалось завершить работу." : progress === 100
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
                                progress >= generationThresholds[i]
                                  ? "done"
                                  : !generationFailed && progress >= (i ? generationThresholds[i-1] : 0)
                                    ? "working"
                                    : ""
                              }
                            >
                              <span>
                                {progress >= generationThresholds[i] ? (
                                  <Check size={14} />
                                ) : !generationFailed && progress >= (i ? generationThresholds[i-1] : 0) ? (
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
                            onClick={() => window.open(deliveryUrl("pdf",true),"_blank","noopener")}
                          >
                            Посмотреть PDF <ArrowRight size={17} />
                          </ChromeButton><ChromeButton className="button button-outline" onClick={() => setModal("download")}><Download size={17}/> Скачать работу</ChromeButton></div>
                        ) : (
                          <p className="muted small">
                            {generationJob?.status==='retry' && generationJob?.error==='local_token_rate_limit' ? 'Пауза для соблюдения лимитов API. Продолжим автоматически' : statuses[generationJob?.status] || "В очереди"} · {activeDoc?.jobs?.find((j:any)=>j.kind === "document")?.current_section} · {activeDoc?.jobs?.find((j:any)=>j.kind === "document")?.completed_units || 0}/{activeDoc?.jobs?.find((j:any)=>j.kind === "document")?.total_units || 0}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
              {page === "library" && signedIn && (
                <>
                  <div className="page-heading">
                    <div>
                      <div className="eyebrow">ЛИЧНАЯ БИБЛИОТЕКА</div>
                      <h1>Ваши работы.</h1>
                      <p>Черновики и журнал завершённых работ.</p>
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
                      <span>Завершены</span>
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
                        onClick={() => setModal(api.csrf ? "topup" : "login")}
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
                              disabled={work.status !== "draft"}
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
                            <span className="work-meta">{work.pages ? `${work.pages} стр. заказано` : "Объём не указан"}{work.actualPages ? ` / ${work.actualPages} в PDF` : ""}</span>
                            <span className="work-meta">{work.date}</span>
                            <span className={`work-status ${work.status}`}>
                              <span />
                              {statuses[work.serverState || ""] || "Черновик"}
                            </span>
                            {work.status === "draft" && <div className="work-actions">
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
                                onClick={async () => {
                                  try {await api.request("/documents/"+work.id,"DELETE");}catch(e){setError(errorText(e));return;}
                                  setDeletedWork(work);
                                  setWorks((items) =>
                                    items.filter((item) => item.id !== work.id),
                                  );
                                  setNotice("Черновик архивирован");
                                }}
                              >
                                <Trash2 size={15} />
                              </ChromeButton>
                            </div>}
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
              {page === "profile" && signedIn && (
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
                      <ChromeButton type="button" className="profile-logout" disabled={busy} onClick={()=>{setError('');setModal('logout');}}><LogOut size={17} aria-hidden="true"/>Выйти из аккаунта</ChromeButton>
                      <ChromeButton onClick={() => setPage("referrals")}>
                        Пригласить друзей <ArrowUpRight size={15} />
                      </ChromeButton>
                    </div>
                    <form
                      className="profile-form form-panel"
                      onSubmit={saveProfile}
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
                        <details className="account-detail"><summary>Изменить пароль <ChevronDown size={17}/></summary><div className="field-group"><label htmlFor="current-password">Текущий пароль</label><input id="current-password" type="password" autoComplete="current-password"/></div><div className="field-group"><label htmlFor="new-password">Новый пароль</label><input id="new-password" type="password" autoComplete="new-password" minLength={8}/></div><div className="field-group"><label htmlFor="confirm-password">Повторите новый пароль</label><FeaturedCard theme={theme}><input id="confirm-password" type="password" autoComplete="new-password"/></FeaturedCard></div><p className="quiet-note">Не менее 8 символов. Изменение пароля подключим позже.</p><ChromeButton type="button" className="button button-outline" onClick={()=>setNotice("Демо: изменение пароля пока не подключено")}>Обновить пароль</ChromeButton><ChromeButton type="button" className="text-button recovery-link" onClick={()=>setModal("reset-password")}>Не помню текущий пароль</ChromeButton></details>
                        <ChromeButton type="button" className="text-button recovery-link" onClick={()=>setModal("reset-password")}>Забыли пароль?</ChromeButton>
                      </div>}
                      <ChromeButton disabled={busy} className="button button-ink" type="submit">
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
              {page === "referrals" && signedIn && (
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
                        <code>{location.origin}/?ref={user.referralCode}</code>
                        <ChromeButton
                          className="button button-ink"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(
                                `${location.origin}/?ref=${user.referralCode}`,
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
                        Первая успешная рублёвая покупка друга: до {money((account?.standard_price_hundredths || 19900)/5)} кредитов, максимум 20% цены. Ожидание 14 дней. Старые приглашения сохраняют условия кампании.
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
                      <span className="eyebrow">ЖУРНАЛ</span>
                    </div>
                    {(account?.history || []).map((entry:any) => ({id:entry.operation_id,friendName:entry.kind,docTitle:"",date:new Date(entry.created*1000).toLocaleDateString("ru-RU"),rewardCredits:entry.amount/100})).map((ref:any) => (
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
            {error && step !== 1 && <p className="form-error" role="alert">{error}</p>}
            {activeDoc?.delivery_id && step === 3 && <p className="quiet-note">Сохраните оба файла до {new Date(activeDoc.expires*1000).toLocaleString("ru-RU")}. Заказано {form.pages}, фактически {activeDoc.actual_pages} стр. в PDF.</p>}
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
            ["pdf", "PDF", "Готовый серверный PDF"],
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
          Сохраните Word и PDF. Выдача действует 24 часа после завершения.
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
              ? "Скачать .pdf"
              : "Скачать .docx"}
        </ChromeButton>
      </Modal>
      <Modal open={modal === 'topup'} onClose={()=>setModal(null)} title="Ваши кредиты">
        <p>Доступно {money(account?.available || 0)}. В резерве {money(account?.reserved || 0)}. Долг {money(account?.debt || 0)}.</p>
        <p>Кредиты начисляются за успешные рублёвые заказы и приглашения. Покупка, вывод и передача недоступны.</p>
      </Modal>
      <Modal open={modal === 'logout'} onClose={()=>{if(!busy)setModal(null);}} title="Выйти из аккаунта?">
        <p className="modal-description">Вы действительно хотите выйти? Сохранённые черновики останутся в аккаунте.</p>
        {error && <p role="alert" className="form-error">{error}</p>}
        <div className="logout-actions">
          <ChromeButton type="button" className="button button-outline" disabled={busy} autoFocus onClick={()=>setModal(null)}>Остаться</ChromeButton>
          <ChromeButton type="button" className="button button-ink" disabled={busy} onClick={logout}><LogOut size={17} aria-hidden="true"/>{busy?'Выходим…':'Выйти'}</ChromeButton>
        </div>
      </Modal>
      <Modal open={modal === 'login'} onClose={()=>setModal(null)} title={authMode==='register'?'Создать аккаунт':authMode==='verify'?'Подтвердить почту':'Войти в аккаунт'}>
        <form onSubmit={authenticate} className="auth-form">
          <p className="modal-description">{authMode==='register' ? ('Сохраняйте планы, следите за работами и приглашайте друзей.' + (catalog?.mock_email ? ' В тестовом режиме почта подтверждается автоматически.' : ' После регистрации подтвердите почту.')) : 'Ваши работы, настройки и бонусы в одном месте.'}</p>
          {authMode!=='verify' ? <>
            {authMode==='register' && <div className="field-group"><label htmlFor="register-name">Логин / имя</label><FeaturedCard theme={theme}><input id="register-name" autoComplete="nickname" required maxLength={80} value={authName} onChange={e=>setAuthName(e.target.value)} placeholder="Как к вам обращаться"/></FeaturedCard></div>}
            <div className="field-group"><label htmlFor="login-email">Email</label><FeaturedCard theme={theme}><input id="login-email" type="email" autoComplete="username" required maxLength={254} value={authEmail} onChange={e=>setAuthEmail(e.target.value)}/></FeaturedCard></div>
            <div className="field-group"><label htmlFor="login-password">Пароль</label><FeaturedCard theme={theme}><input id="login-password" type="password" autoComplete={authMode==='register'?'new-password':'current-password'} required minLength={12} maxLength={128} value={authPassword} onChange={e=>setAuthPassword(e.target.value)}/></FeaturedCard>{authMode==='register' && <small>От 12 символов.</small>}</div>
            {authMode==='register' && <div className="field-group"><label htmlFor="confirm-password">Повторите пароль</label><FeaturedCard theme={theme}><input id="confirm-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></FeaturedCard></div>}
          </> : <>
            <p className="modal-description">Аккаунт создан. Подтвердите почту, чтобы войти.</p>
            <p className="quiet-note">В локальном тесте письма не отправляются. Код подтверждения сохранён в папке проекта{registeredId ? <>: <code style={{overflowWrap:'anywhere'}}>.local/private/mail/{registeredId}-verify.txt</code></> : ' в .local/private/mail/'}.</p>
            <div className="field-group"><label htmlFor="verification-token">Код подтверждения</label><FeaturedCard theme={theme}><input id="verification-token" type="text" autoComplete="one-time-code" required minLength={20} maxLength={128} value={verificationToken} onChange={e=>setVerificationToken(e.target.value)}/></FeaturedCard></div>
          </>}
          {error && <p role="alert" className="form-error">{error}</p>}
          <ChromeButton type="submit" disabled={busy} className="button button-accent full-width">{busy?'Подождите…':authMode==='register'?'Зарегистрироваться':authMode==='verify'?'Подтвердить и войти':'Войти'}</ChromeButton>
          <p className="modal-description">{authMode==='login' ? <>Нет аккаунта? <ChromeButton type="button" className="text-button" disabled={busy} onClick={()=>switchAuth('register')}>Зарегистрироваться</ChromeButton></> : <>Уже есть аккаунт? <ChromeButton type="button" className="text-button" disabled={busy} onClick={()=>switchAuth('login')}>Войти</ChromeButton></>}</p>
          {authMode==='login' && registeredId && <ChromeButton type="button" className="text-button" disabled={busy} onClick={()=>switchAuth('verify')}>Ввести код подтверждения</ChromeButton>}
        </form>
      </Modal>
      <Modal open={modal === 'payment'} onClose={()=>setModal(null)} title="Оплатить и начать генерацию">
        <div className="payment-summary"><span className="aside-mark"><FileText size={24}/></span><div><strong>{tier.label}</strong><p>{form.pages} страниц · Word и PDF</p></div><b>{money(approval?.price_kopecks || 0)} ₽</b></div>
        <p className="payment-test"><Check size={17}/> Тестовая оплата: деньги не списываются</p>
        <fieldset className="payment-methods"><legend>Способ оплаты</legend>
          <ChromeButton type="button" aria-pressed={paymentMethod==='cash'} className={paymentMethod==='cash'?'selected':''} disabled={busy} onClick={()=>setPaymentMethod('cash')}><CreditCard size={23}/><strong>Рубли</strong><b>{money(approval?.price_kopecks || 0)} ₽</b><small>Без ввода банковской карты</small></ChromeButton>
          <ChromeButton type="button" aria-pressed={paymentMethod==='bonus'} className={paymentMethod==='bonus'?'selected':''} disabled={busy || !!account?.debt || (account?.available || 0)<(approval?.price_kopecks || 0)} onClick={()=>setPaymentMethod('bonus')}><Gift size={23}/><strong>Кредиты</strong><b>{money(approval?.price_kopecks || 0)}</b><small>Доступно: {money(account?.available || 0)}</small></ChromeButton>
        </fieldset>
        {!!account?.debt ? <p className="quiet-note">Оплата кредитами недоступна: есть бонусный долг.</p> : (account?.available || 0)<(approval?.price_kopecks || 0) && <p className="quiet-note">Для оплаты кредитами не хватает {money((approval?.price_kopecks || 0)-(account?.available || 0))}. Можно выбрать рубли.</p>}
        <div className="payment-total"><span>Итого</span><strong>{money(approval?.price_kopecks || 0)} {paymentMethod==='cash'?'₽':'кредитов'}</strong></div>
        <p className="quiet-note">После подтверждения начнётся генерация по вашему плану. Готовые файлы доступны для скачивания 24 часа.</p>
        {error && <p role="alert" className="form-error">{error}</p>}
        <ChromeButton className="button button-accent full-width" disabled={busy} onClick={pay}>{busy?'Запускаем…':paymentMethod==='cash'?'Оплатить тестово и начать':'Списать кредиты и начать'}<ArrowRight size={17}/></ChromeButton>
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
