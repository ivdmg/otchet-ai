import React from "react";
import {
  ArrowRight,
  Check,
  FileText,
  BookOpen,
  GraduationCap,
  Plus,
  Trash2,
  Download,
  List,
  RefreshCw,
} from "lucide-react";
import { ChromeButton } from "./Chrome";
import { FeaturedCard } from "./LandingMotion";
import { AiOrb } from "./AiOrb";
import {
  Catalog,
  Document,
  Referral,
  Job,
  money,
  statuses,
} from "./prototypeApi";
export type ProductDraft = {
  topic: string;
  doc_type: string;
  anonymized: boolean;
};
export type Preview = { paragraphs: { text: string; style: string }[] };
type Props = {
  theme: "dark" | "light";
  draft: ProductDraft;
  setDraft: (d: ProductDraft) => void;
  catalog: Catalog | null;
  price?: number;
  doc?: Document;
  job?: Job;
  sections: string[];
  setSections: React.Dispatch<React.SetStateAction<string[]>>;
  referral: Referral | null;
  preview: Preview | null;
  busy: boolean;
  canCreate: boolean;
  signedIn: boolean;
  create: () => void;
  save: () => void;
  approve: () => void;
  pay: (method: "cash" | "bonus") => void;
  download: () => void;
  refresh: () => void;
  archive: () => void;
};
const types = [
  { id: "abstract", label: "Реферат", icon: FileText },
  { id: "coursework", label: "Курсовая", icon: BookOpen },
  { id: "vkr", label: "Дипломная", icon: GraduationCap },
];
/** Original Studio product layouts, now driven entirely by backend snapshots. */
export function ProductFlow(p: Props) {
  const { doc, catalog, job } = p;
  const simulated = catalog?.payment_mode === "personal_mock";
  const action = (
    label: string,
    fn: () => void,
    disabled = false,
    outline = false,
  ) => (
    <ChromeButton
      type="button"
      className={`button ${outline ? "button-outline" : "button-accent"}`}
      onClick={fn}
      disabled={p.busy || disabled}
    >
      {label}
    </ChromeButton>
  );
  if (!doc)
    return (
      <form
        className="create-grid"
        onSubmit={(e) => {
          e.preventDefault();
          p.create();
        }}
      >
        <aside className="order-summary">
          <div className="summary-content">
            <div className="eyebrow">ВАША РАБОТА</div>
            <h3>{types.find((t) => t.id === p.draft.doc_type)?.label}</h3>
            <div className="summary-row">
              <span>Объём</span>
              <b>Короткая работа</b>
            </div>
            <div className="summary-row">
              <span>Структура</span>
              <b>2–{catalog?.max_sections ?? "…"} разделов</b>
            </div>
            <div className="summary-row">
              <span>Формат</span>
              <b>Word · DOCX</b>
            </div>
            <div className="summary-row">
              <span>Хранение</span>
              <b>{catalog?.retention_days ?? "…"} дней</b>
            </div>
            <div className="summary-total">
              <span>{simulated ? "Тестовый номинал" : "Стоимость"}</span>
              <strong>{p.price !== undefined ? money(p.price) : "…"} ₽</strong>
            </div>
            <p>
              Сначала план — затем полная работа.
              <br />
              {simulated
                ? "Оплата имитируется, деньги не списываются."
                : "Оплата в тестовом режиме."}
            </p>
          </div>
        </aside>
        <div className="form-panel">
          <div className="field-group">
            <label>Что пишем?</label>
            <div className="work-type-picker">
              {types.map((t) => (
                <ChromeButton
                  key={t.id}
                  type="button"
                  className={p.draft.doc_type === t.id ? "selected" : ""}
                  aria-pressed={p.draft.doc_type === t.id}
                  onClick={() => p.setDraft({ ...p.draft, doc_type: t.id })}
                >
                  <t.icon size={21} />
                  <span>{t.label}</span>
                  {p.draft.doc_type === t.id && <Check size={14} />}
                </ChromeButton>
              ))}
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="work-topic">
              Тема работы <span>*</span>
            </label>
            <div className="generator-input-effect">
              <FeaturedCard theme={p.theme}>
                <textarea
                  id="work-topic"
                  required
                  minLength={8}
                  maxLength={400}
                  rows={4}
                  placeholder="Например, сохранение данных в учебных информационных системах"
                  value={p.draft.topic}
                  onChange={(e) =>
                    p.setDraft({ ...p.draft, topic: e.target.value })
                  }
                />
              </FeaturedCard>
            </div>
            <div className="field-help">
              <span>Чем точнее тема, тем полезнее результат.</span>
              <span>{p.draft.topic.length}/400</span>
            </div>
          </div>
          <label className="product-consent">
            <input
              type="checkbox"
              required
              checked={p.draft.anonymized}
              onChange={(e) =>
                p.setDraft({ ...p.draft, anonymized: e.target.checked })
              }
            />
            <span>Тема не содержит персональных данных, контактов и URL</span>
          </label>
          <p className="muted">
            Источники и факты нужно проверить вручную. Количество страниц пока
            не фиксируем: сначала проверяем качество коротких работ.
          </p>
          <div className="form-action">
            <ChromeButton
              type="submit"
              className="button button-accent"
              disabled={p.busy || !p.canCreate}
            >
              {p.signedIn ? "Составить план" : "Войти и продолжить"}{" "}
              <ArrowRight size={17} />
            </ChromeButton>
          </div>
        </div>
      </form>
    );
  if (doc.download_url)
    return (
      <div className="document-workspace">
        <div className="document-toolbar">
          <div>
            <FileText size={19} />
            <span>{doc.topic}</span>
            <span className="ready-label">
              <Check size={13} /> Готово
            </span>
          </div>
          {action("Скачать DOCX", p.download)}
        </div>
        <div className="document-layout">
          <aside className="document-outline">
            <div className="eyebrow">СОДЕРЖАНИЕ</div>
            {[
              "Введение",
              ...(doc.approved_plan?.sections || []),
              "Заключение",
              "Источники",
            ].map((s, i) => (
              <div className="product-outline-item" key={s}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {s}
              </div>
            ))}
            <p className="quiet-note">
              Предпросмотр показывает текст сохранённого DOCX. Точную разбивку
              страниц и таблицы смотрите в Word.
            </p>
          </aside>
          <div className="product-paper-scroll">
            <article className="paper product-real-paper">
              {p.preview ? (
                p.preview.paragraphs.map((b, i) =>
                  /heading|title/i.test(b.style) ? (
                    <h3 key={i}>{b.text}</h3>
                  ) : (
                    <p key={i}>{b.text || "\u00a0"}</p>
                  ),
                )
              ) : (
                <p>Загружаем текст документа…</p>
              )}
            </article>
          </div>
        </div>
      </div>
    );
  if (doc.state === "plan_ready")
    return (
      <div className="outline-grid">
        <div className="outline-panel">
          <div className="outline-heading">
            <div>
              <span className="eyebrow">СОДЕРЖАНИЕ</span>
              <h2>{doc.topic}</h2>
            </div>
            <span className="outline-count">{p.sections.length} раздела</span>
          </div>
          <div className="outline-fixed">
            <span>—</span>Введение<small>Цель, задачи, актуальность</small>
          </div>
          {p.sections.map((s, i) => (
            <div className="chapter-block" key={i}>
              <div className="chapter-heading">
                <span className="chapter-number">0{i + 1}</span>
                <input
                  aria-label={`Название раздела ${i + 1}`}
                  minLength={3}
                  maxLength={160}
                  value={s}
                  onChange={(e) =>
                    p.setSections((a) =>
                      a.map((v, j) => (j === i ? e.target.value : v)),
                    )
                  }
                />
                <div className="chapter-actions">
                  <ChromeButton
                    type="button"
                    className="icon-button"
                    aria-label={`Удалить раздел ${i + 1}`}
                    disabled={p.busy || p.sections.length <= 2}
                    onClick={() =>
                      p.setSections((a) => a.filter((_, j) => j !== i))
                    }
                  >
                    <Trash2 size={16} />
                  </ChromeButton>
                </div>
              </div>
            </div>
          ))}
          <ChromeButton
            type="button"
            className="add-chapter"
            disabled={
              p.busy || p.sections.length >= (catalog?.max_sections || 6)
            }
            onClick={() => p.setSections((a) => [...a, "Новый раздел"])}
          >
            <Plus size={17} /> Добавить раздел
          </ChromeButton>
          <div className="outline-fixed">
            <span>—</span>Заключение
          </div>
          <div className="outline-fixed">
            <span>—</span>Список источников
          </div>
          <div className="outline-footer">
            {action("Сохранить план", p.save, false, true)}
            {action("Утвердить план", p.approve)}
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
            Нажмите на заголовок, чтобы изменить его. Нейросеть напишет текст по
            утверждённой структуре.
          </p>
          <div className="aside-divider" />
          <p className="quiet-note">
            Ручные правки не расходуют AI-токены. После утверждения план
            фиксируется.
          </p>
          {action("Архивировать черновик", p.archive, false, true)}
        </aside>
      </div>
    );
  if (doc.state === "approved" && !doc.order)
    return (
      <div className="outline-grid">
        <div className="outline-panel">
          <div className="eyebrow">ПЛАН УТВЕРЖДЁН</div>
          <h2>{doc.topic}</h2>
          <div className="outline-fixed">
            <span>—</span>Введение
          </div>
          {doc.approved_plan?.sections.map((s, i) => (
            <div className="chapter-block" key={s}>
              <div className="chapter-heading">
                <span className="chapter-number">0{i + 1}</span>
                <strong>{s}</strong>
              </div>
            </div>
          ))}
          <div className="outline-fixed">
            <span>—</span>Заключение и источники
          </div>
        </div>
        <aside className="editor-aside">
          <h3>
            Всё готово
            <br />к генерации.
          </h3>
          <p>
            {simulated
              ? "Для личного теста подтвердите имитацию оплаты. Карта и ЮKassa не нужны; AI работает по-настоящему."
              : "Выберите способ оплаты. Смешанной оплаты нет."}
          </p>
          <div className="product-checkout-actions">
            {action(
              simulated
                ? `Тестовая оплата ${money(catalog?.price_kopecks || 0)} ₽`
                : `Оплатить ${money(catalog?.price_kopecks || 0)} ₽`,
              () => p.pay("cash"),
            )}
            {!simulated &&
              action(
                `Использовать ${money(catalog?.bonus_hundredths || 0)} кредитов`,
                () => p.pay("bonus"),
                !p.referral ||
                  p.referral.debt > 0 ||
                  p.referral.available < (catalog?.bonus_hundredths || 0),
                true,
              )}
          </div>
          {simulated ? (
            <p className="quiet-note">
              Списаний нет. Имитация не начисляет реферальные бонусы.
            </p>
          ) : (
            <p className="quiet-note">
              Доступно {money(p.referral?.available || 0)} кредитов. Не хватает{" "}
              {money(
                Math.max(
                  0,
                  (catalog?.bonus_hundredths || 0) -
                    (p.referral?.available || 0),
                ),
              )}
              .
            </p>
          )}
        </aside>
      </div>
    );
  const percent = doc.download_url ? 100 : Math.min(job?.percent || 0, 95);
  const failed = ["failed", "cancelled", "archived", "expired"].includes(
    doc.state,
  );
  return (
    <div className="generation-layout">
      <div className="generation-visual">
        <AiOrb theme={p.theme} state="solving" />
        <span className="generation-percent">
          {percent}
          <small>%</small>
        </span>
      </div>
      <div className="generation-info">
        <div className="eyebrow">
          {doc.state === "planning"
            ? "СОСТАВЛЯЕМ ПЛАН"
            : failed
              ? "НУЖНО ВНИМАНИЕ"
              : "СОБИРАЕМ ВАШ ДОКУМЕНТ"}
        </div>
        <h2>
          {failed
            ? "Работа приостановлена."
            : doc.state === "planning"
              ? "Хорошая работа начинается с плана."
              : "От главы к главе."}
        </h2>
        <p className="generation-topic">{doc.topic}</p>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Готовность документа"
        >
          <div style={{ width: `${percent}%` }} />
        </div>
        <div className="generation-steps">
          <div className="working">
            <span>
              {job?.completed_units || 0}/{job?.total_units || 1}
            </span>
            {statuses[job?.stage || ""] ||
              job?.current_section ||
              statuses[job?.status || ""] ||
              statuses[doc.state]}
          </div>
        </div>
        {job?.stage?.startsWith("section_") && (
          <p>
            Раздел{" "}
            {Math.max(
              0,
              doc.approved_plan?.sections.indexOf(job.current_section) ?? -1,
            ) + 1}{" "}
            из {doc.approved_plan?.sections.length}: {job.current_section}
          </p>
        )}
        {job?.status === "retry" && (
          <p>
            Соблюдаем лимит запросов. Генерация продолжится автоматически;
            сохранённые разделы остаются.
          </p>
        )}
        {job?.error && job.status === "failed" && (
          <p role="alert">Не удалось завершить генерацию: {job.error}</p>
        )}
        <p className="muted small">
          Показаны сохранённые этапы. Можно закрыть вкладку и вернуться из «Моих
          работ».
        </p>
        {doc.order && (
          <>
            <p className="quiet-note">
              {doc.order.payment_mode === "personal_mock"
                ? "Оплата имитирована, деньги не списывались."
                : statuses[doc.order.state] || doc.order.state}
            </p>
            <details>
              <summary>Информация о заказе</summary>
              <p>№ {doc.order.id}</p>
              <p>{statuses[doc.order.state] || doc.order.state}</p>
              {doc.order.checkout_url &&
                doc.order.state === "checking_payment" && (
                  <a
                    href={doc.order.checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Открыть тестовую ЮKassa
                  </a>
                )}
              {doc.order.refunds?.map((r) => (
                <p key={r.id}>Возврат: {statuses[r.state] || r.state}</p>
              ))}
              <p>
                При ошибке передайте номер заказа владельцу сервиса. Повторно
                платить при неизвестном статусе не нужно.
              </p>
            </details>
          </>
        )}
        {action("Проверить состояние", p.refresh, false, true)}
        {!doc.order && action("Архивировать черновик", p.archive, false, true)}
      </div>
    </div>
  );
}
