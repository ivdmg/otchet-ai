import { FileText, Download, ArrowUpRight } from "lucide-react";
import { ProductFlow, Preview } from "./ProductFlow";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChromeButton, ChromeTheme } from "./Chrome";
import {
  PrototypeApi,
  ApiError,
  Catalog,
  Document,
  Referral,
  errorText,
  money,
  statuses,
} from "./prototypeApi";
import "./prototype.css";
type Props = {
  home: React.ReactNode;
  theme: "dark" | "light";
  toggle: () => void;
  page: string;
  setPage: (p: string) => void;
  initialTopic: string;
  initialType: string;
};
export default function StudioWorkspace({
  home,
  theme,
  toggle,
  page,
  setPage,
  initialTopic,
  initialType,
}: Props) {
  const [key, setKey] = useState(""),
    [user, setUser] = useState<{ email: string } | null>(null),
    [catalog, setCatalog] = useState<Catalog | null>(null),
    [docs, setDocs] = useState<Document[]>([]),
    [referral, setReferral] = useState<Referral | null>(null),
    [selected, setSelected] = useState(
      () => new URLSearchParams(location.search).get("document") || "",
    ),
    [sections, setSections] = useState<string[]>([]),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [token, setToken] = useState(""),
    [mode, setMode] = useState("login"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [quote, setQuote] = useState<{
      price_kopecks: number;
      bonus_hundredths: number;
    } | null>(null),
    [menu, setMenu] = useState(false);
  const [preview, setPreview] = useState<Preview | null>(null);
  useEffect(() => {
    const url = new URL(location.href);
    if (selected) url.searchParams.set("document", selected);
    else url.searchParams.delete("document");
    history.replaceState(null, "", url);
  }, [selected]);
  const [draft, setDraft] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("gost-prototype-draft") || "null") || {
          topic: "",
          doc_type: "coursework",
          anonymized: false,
        }
      );
    } catch {
      return { topic: "", doc_type: "coursework", anonymized: false };
    }
  });
  const lock = useRef(false),
    abort = useRef(new AbortController());
  const api = useMemo(
    () =>
      new PrototypeApi(() => {
        setUser(null);
        setDocs([]);
        setReferral(null);
        setError("Сессия истекла. Войдите снова; форма сохранена.");
      }),
    [key],
  );
  useEffect(() => {
    setKey("local-proxy");
  }, []);
  useEffect(() => {
    abort.current = new AbortController();
    return () => abort.current.abort();
  }, []);
  useEffect(() => {
    if (initialTopic) setDraft((d) => ({ ...d, topic: initialTopic }));
    if (initialType) setDraft((d) => ({ ...d, doc_type: initialType }));
    if (initialTopic || initialType) setSelected("");
  }, [initialTopic, initialType]);
  useEffect(() => {
    try {
      localStorage.setItem("gost-prototype-draft", JSON.stringify(draft));
    } catch {}
    setQuote(null);
  }, [draft]);
  const current = docs.find((d) => d.id === selected);
  useEffect(() => {
    setSections(current?.plan?.sections || []);
  }, [selected, current?.plan?.sections?.join("\n")]);
  async function run(action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setError(errorText(e));
        if (e instanceof ApiError && e.status === 409 && api.csrf)
          await load().catch(() => {});
      }
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function load(signal?: AbortSignal) {
    const [d, r] = await Promise.all([
      api.request<{ items: Document[] }>(
        "/documents",
        "GET",
        undefined,
        signal,
      ),
      api.request<Referral>("/referrals", "GET", undefined, signal),
    ]);
    setDocs(d.items);
    setReferral(r);
    return d.items;
  }
  useEffect(() => {
    if (!key) return;
    const c = new AbortController();
    run(async () => {
      setCatalog(
        await api.request<Catalog>("/catalog", "GET", undefined, c.signal),
      );
      const ref = new URLSearchParams(location.search).get("ref");
      if (ref)
        await api.request(
          `/referrals/capture/${encodeURIComponent(ref)}`,
          "GET",
          undefined,
          c.signal,
        );
      try {
        const me = await api.request<{
          user: { email: string };
          csrf_token: string;
        }>("/auth/me", "GET", undefined, c.signal);
        api.csrf = me.csrf_token;
        setUser(me.user);
        await load(c.signal);
        if (new URLSearchParams(location.search).get("document"))
          setPage("create");
        setError("");
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 401)) throw e;
        setError("");
      }
    });
    return () => c.abort();
  }, [api]);
  // Snapshots only; the timer schedules HTTP and never increments progress.
  const active = docs.some(
    (d) =>
      ["planning", "ordered", "generating"].includes(d.state) ||
      (d.order &&
        [
          "checking_payment",
          "queued",
          "refund_pending",
          "refund_attention",
          "payment_attention",
        ].includes(d.order.state)),
  );
  useEffect(() => {
    if (!user || page === "home" || !active) return;
    const c = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let delay = 3000;
    let stopped = false;
    let inFlight = false;
    async function tick() {
      if (stopped || inFlight || document.hidden) return;
      inFlight = true;
      try {
        await load(c.signal);
        delay = 3000;
        setError((previous) =>
          previous.startsWith("Не удалось связаться") ? "" : previous,
        );
      } catch (e) {
        if (c.signal.aborted) return;
        setError(errorText(e));
        delay = Math.max(
          Math.min(60000, delay * 2),
          e instanceof ApiError ? e.retryAfter * 1000 : 0,
        );
        if (e instanceof ApiError && (e.status === 401 || e.status === 403))
          return;
      } finally {
        inFlight = false;
      }
      if (!stopped && !document.hidden) timer = setTimeout(tick, delay);
    }
    timer = setTimeout(tick, delay);
    const visibility = () => {
      if (!document.hidden) {
        clearTimeout(timer);
        timer = setTimeout(tick, 0);
      } else {
        clearTimeout(timer);
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      stopped = true;
      c.abort();
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [api, user, page, active]);
  useEffect(() => {
    if (!key || draft.topic.trim().length < 8 || !draft.anonymized) return;
    const c = new AbortController();
    const t = setTimeout(
      () =>
        api
          .request<{ price_kopecks: number; bonus_hundredths: number }>(
            "/quote",
            "POST",
            draft,
            c.signal,
          )
          .then(setQuote)
          .catch((e) => {
            if (!c.signal.aborted) setError(errorText(e));
          }),
      400,
    );
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [draft, key, api]);
  const open = (d: Document) => {
    setSelected(d.id);
    setPage("create");
  };
  async function authenticate() {
    const result = await api.request<{
      user: { email: string };
      csrf_token: string;
    }>("/auth/login", "POST", { email, password }, abort.current.signal);
    api.csrf = result.csrf_token;
    setUser(result.user);
    setPassword("");
    await load();
  }
  async function create() {
    const r = await api.request<{ document_id: string }>(
      "/documents",
      "POST",
      draft,
      abort.current.signal,
    );
    setSelected(r.document_id);
    await load();
  }
  const button = (
    label: string,
    action: () => Promise<void>,
    disabled = false,
  ) => (
    <ChromeButton
      className="button button-ink"
      disabled={busy || disabled}
      onClick={() => run(action)}
    >
      {label}
    </ChromeButton>
  );
  const auth = (
    <section className="proto-card">
      <h2>
        {mode === "login"
          ? "Вход"
          : mode === "register"
            ? "Регистрация"
            : mode === "verify"
              ? "Подтверждение email"
              : "Восстановление доступа"}
      </h2>
      <p>
        Форма сохранена. Почта стенда — локальный приватный mail sink; внешнее
        письмо не отправляется.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => {
            if (mode === "login") await authenticate();
            else if (mode === "register") {
              await api.request("/auth/register", "POST", { email, password });
              setMode("verify");
              setNotice(
                "Аккаунт создан. Владелец стенда читает токен в локальном mail sink по runbook.",
              );
            } else if (mode === "verify") {
              await api.request("/auth/verify", "POST", { token });
              setMode("login");
              setNotice("Email подтверждён. Войдите.");
            } else if (mode === "reset-request") {
              await api.request("/auth/reset-request", "POST", { email });
              setMode("reset");
              setNotice(
                "Запрос принят. Токен доступен владельцу в локальном mail sink.",
              );
            } else {
              await api.request("/auth/reset", "POST", { token, password });
              setMode("login");
              setNotice("Пароль изменён. Войдите заново.");
            }
          });
        }}
      >
        {(mode === "login" ||
          mode === "register" ||
          mode === "reset-request") && (
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        )}
        {["login", "register", "reset"].includes(mode) && (
          <label>
            Пароль (12–128 символов)
            <input
              type="password"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              minLength={12}
              maxLength={128}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        )}
        {["verify", "reset"].includes(mode) && (
          <label>
            Токен из локального письма
            <input
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </label>
        )}
        <ChromeButton className="button button-ink" disabled={busy}>
          Продолжить
        </ChromeButton>
      </form>
      <div className="proto-actions">
        {[
          ["login", "Войти"],
          ["register", "Создать аккаунт"],
          ["verify", "Подтвердить email"],
          ["reset-request", "Забыли пароль?"],
        ].map(([v, t]) => (
          <button key={v} onClick={() => setMode(v)}>
            {t}
          </button>
        ))}
      </div>
    </section>
  );
  const job = current?.jobs
    .filter((j) => j.kind === (current.order ? "document" : "plan"))
    .slice(-1)[0];
  useEffect(() => {
    setPreview(null);
    if (!current?.download_url) return;
    const c = new AbortController();
    api
      .request<Preview>(
        `/documents/${current.id}/preview`,
        "GET",
        undefined,
        c.signal,
      )
      .then(setPreview)
      .catch((e) => {
        if (!c.signal.aborted) setError(errorText(e));
      });
    return () => c.abort();
  }, [api, current?.id, current?.download_url]);
  const price = quote?.price_kopecks ?? catalog?.price_kopecks;
  return (
    <ChromeTheme.Provider value={theme}>
      {page === "home" ? (
        home
      ) : (
        <div className={`workspace ${menu ? "workspace-panel-open" : ""}`}>
          <aside className="sidebar proto-sidebar">
            <div className="sidebar-identity">
              <strong>AI GostDoc</strong>
              <p>{user?.email || "Личный стенд"}</p>
            </div>
            <ChromeButton
              className="button button-ink new-work"
              onClick={() => {
                setSelected("");
                setPage("create");
                setMenu(false);
              }}
            >
              + Новая работа
            </ChromeButton>
            <nav>
              {[
                ["create", "Генератор"],
                ["library", "Мои работы"],
                ["referrals", "Пригласить друзей"],
                ["profile", "Мой профиль"],
              ].map(([p, t]) => (
                <ChromeButton
                  key={p}
                  className={`side-link ${page === p ? "active" : ""}`}
                  onClick={() => {
                    setPage(p);
                    setMenu(false);
                  }}
                >
                  {t}
                </ChromeButton>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="balance-box">
                Доступные бонусы
                <strong>{referral ? money(referral.available) : "—"}</strong>
                <small>кредитов · пополнения нет</small>
              </div>
            </div>
          </aside>
          <div className="workspace-body">
            <header className="workspace-header">
              <button onClick={() => setMenu(!menu)} aria-label="Открыть меню">
                ☰
              </button>
              <ChromeButton
                className="brand"
                aria-label="ГОСТ docx — на главную"
                onClick={() => setPage("home")}
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
              <button onClick={toggle}>
                {theme === "dark" ? "Светлая" : "Тёмная"} тема
              </button>
            </header>
            <main className="workspace-main proto-main">
              <div aria-live="polite">
                {busy && <p role="status">Обращаемся к серверу…</p>}
                {error && (
                  <p role="alert" className="proto-error">
                    {error}
                  </p>
                )}
                {notice && <p role="status">{notice}</p>}
              </div>
              {!key ? (
                <p role="status">Подключаем локальный стенд…</p>
              ) : (
                <>
                  {!catalog && (
                    <section className="proto-card">
                      <p>
                        Каталог недоступен. Проверьте запуск backend и
                        существующий .env по runbook.
                      </p>
                      <button onClick={() => location.reload()}>
                        Повторить подключение
                      </button>
                    </section>
                  )}
                  {page === "create" && (
                    <>
                      <div className="page-heading">
                        <h1>
                          {current?.download_url
                            ? "Всё на своих местах."
                            : current?.state === "plan_ready"
                              ? "Хорошая работа начинается с плана."
                              : current?.order
                                ? "Ваша работа обретает форму."
                                : current?.state === "approved"
                                  ? "План готов. Начнём писать?"
                                  : "С чего начнём?"}
                        </h1>
                      </div>
                      <ol className="stepper">
                        {["Задача", "AI-план", "Оплата", "DOCX"].map((t, i) => (
                          <li
                            key={t}
                            className={
                              (current
                                ? current.download_url
                                  ? 3
                                  : current.order
                                    ? 2
                                    : 1
                                : 0) === i
                                ? "current"
                                : ""
                            }
                          >
                            <span>0{i + 1}</span> {t}
                          </li>
                        ))}
                      </ol>
                      <ProductFlow
                        theme={theme}
                        draft={draft}
                        setDraft={setDraft}
                        catalog={catalog}
                        price={price}
                        doc={current}
                        job={job}
                        sections={sections}
                        setSections={setSections}
                        referral={referral}
                        preview={preview}
                        busy={busy}
                        canCreate={!!quote}
                        signedIn={!!user}
                        create={() => {
                          if (user) run(create);
                          else {
                            setMode("login");
                            setNotice(
                              "Войдите ниже. Тема и параметры сохранены.",
                            );
                          }
                        }}
                        save={() =>
                          run(async () => {
                            await api.request(
                              `/documents/${current!.id}/plan`,
                              "PUT",
                              { sections },
                            );
                            await load();
                          })
                        }
                        approve={() =>
                          run(async () => {
                            await api.request(
                              `/documents/${current!.id}/plan`,
                              "PUT",
                              { sections },
                            );
                            await api.request(
                              `/documents/${current!.id}/approve`,
                              "POST",
                            );
                            await load();
                          })
                        }
                        pay={(method) =>
                          run(async () => {
                            await api.request(
                              `/documents/${current!.id}/orders`,
                              "POST",
                              { method },
                            );
                            await load();
                          })
                        }
                        download={() => run(() => api.download(current!.id))}
                        refresh={() =>
                          run(async () => {
                            await load();
                          })
                        }
                        archive={() =>
                          run(async () => {
                            await api.request(
                              `/documents/${current!.id}`,
                              "DELETE",
                            );
                            setSelected("");
                            await load();
                          })
                        }
                      />
                      {!user && auth}
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
                      </div>
                      {user ? (
                        <>
                          <div className="library-overview">
                            <div>
                              <span>Всего работ</span>
                              <strong>
                                {String(docs.length).padStart(2, "0")}
                              </strong>
                            </div>
                            <div>
                              <span>Готовы к скачиванию</span>
                              <strong>
                                {String(
                                  docs.filter((d) => d.download_url).length,
                                ).padStart(2, "0")}
                              </strong>
                            </div>
                            <div>
                              <span>На вашем балансе</span>
                              <strong>
                                {money(referral?.available || 0)}{" "}
                                <small>кредитов</small>
                              </strong>
                            </div>
                          </div>
                          <div className="works-list">
                            <div className="works-table-head">
                              <span>НАЗВАНИЕ</span>
                              <span>СТРУКТУРА</span>
                              <span>ДАТА</span>
                              <span>СТАТУС</span>
                              <span />
                            </div>
                            {docs.map((d) => (
                              <div className="work-row" key={d.id}>
                                <ChromeButton
                                  className="work-title"
                                  onClick={() => open(d)}
                                >
                                  <span
                                    className={`work-icon work-icon-${d.doc_type}`}
                                  >
                                    <FileText size={23} strokeWidth={1.4} />
                                  </span>
                                  <span>
                                    <b>{d.topic}</b>
                                    <small>
                                      {d.doc_type === "abstract"
                                        ? "Реферат"
                                        : d.doc_type === "coursework"
                                          ? "Курсовая"
                                          : "Дипломная"}
                                    </small>
                                  </span>
                                </ChromeButton>
                                <span className="work-meta">
                                  {d.approved_plan?.sections.length ||
                                    d.plan?.sections.length ||
                                    "—"}{" "}
                                  раздела
                                </span>
                                <span className="work-meta">
                                  {d.created
                                    ? new Date(
                                        d.created * 1000,
                                      ).toLocaleDateString("ru-RU")
                                    : "—"}
                                </span>
                                <span
                                  className={`work-status ${d.download_url ? "ready" : "draft"}`}
                                >
                                  <span />
                                  {statuses[d.state] || d.state}
                                </span>
                                <div className="work-actions">
                                  <ChromeButton
                                    className="icon-button"
                                    aria-label={`Открыть ${d.topic}`}
                                    onClick={() => open(d)}
                                  >
                                    <ArrowUpRight size={20} />
                                  </ChromeButton>
                                  {d.download_url && (
                                    <ChromeButton
                                      className="icon-button"
                                      aria-label={`Скачать DOCX ${d.topic}`}
                                      disabled={busy}
                                      onClick={() =>
                                        run(() => api.download(d.id))
                                      }
                                    >
                                      <Download size={18} />
                                    </ChromeButton>
                                  )}
                                </div>
                              </div>
                            ))}
                            {!docs.length && (
                              <div className="empty-state">
                                <FileText size={30} />
                                <h3>Пока ничего.</h3>
                                <p>Первая работа начинается с темы.</p>
                              </div>
                            )}
                          </div>
                          <div className="library-bottom-note">
                            <FileText size={17} />
                            <span>
                              Все работы и файлы сохранены в вашем аккаунте.
                            </span>
                            {button("Обновить библиотеку", async () => {
                              await load();
                            })}
                          </div>
                        </>
                      ) : (
                        auth
                      )}
                    </>
                  )}
                  {page === "referrals" && (
                    <>
                      <h1>Пригласить друзей</h1>
                      {user && referral ? (
                        <section className="proto-card">
                          <h2>
                            Пять квалифицированных покупателей → стандартная
                            работа
                          </h2>
                          <p>
                            За первую завершённую денежную покупку нового друга
                            — 20% оплаченной суммы, максимум{" "}
                            {money(referral.standard_price_hundredths / 5)}{" "}
                            кредитов. Для пяти покупок не дешевле стандартной
                            работы этого хватает на{" "}
                            {money(referral.standard_price_hundredths)}{" "}
                            кредитов. Это тестовый тариф.
                          </p>
                          <p>
                            Ожидание {referral.maturation_days} дней без
                            возврата или спора. Повторные и бонусные покупки не
                            дают наград. Бонусы нельзя купить, вывести или
                            передать.
                          </p>
                          <label>
                            Личная ссылка
                            <input
                              readOnly
                              value={
                                new URL(referral.link, location.origin).href
                              }
                            />
                          </label>
                          {button("Копировать ссылку", async () => {
                            await navigator.clipboard.writeText(
                              new URL(referral.link, location.origin).href,
                            );
                            setNotice("Ссылка скопирована");
                          })}
                          <div className="proto-stats">
                            {[
                              ["Зарегистрированы", referral.registered],
                              [
                                "Квалифицированные покупатели",
                                referral.qualified,
                              ],
                              ["Доступно", money(referral.available)],
                              ["Ожидают", money(referral.pending)],
                              [
                                "На проверке (из ожидающих)",
                                money(referral.held),
                              ],
                              ["Зарезервировано", money(referral.reserved)],
                              ["Бонусный долг", money(referral.debt)],
                            ].map(([t, v]) => (
                              <p key={t}>
                                <span>{t}</span>
                                <strong>{v}</strong>
                              </p>
                            ))}
                          </div>
                          <h3>
                            До стандартной работы осталось{" "}
                            {money(referral.remaining_to_standard)} кредитов
                          </h3>
                          <h3>История</h3>
                          {referral.history.length ? (
                            referral.history.map((h) => (
                              <p key={h.operation_id}>
                                {new Date(h.created * 1000).toLocaleDateString(
                                  "ru-RU",
                                )}{" "}
                                · {h.kind} · {money(h.amount)}
                              </p>
                            ))
                          ) : (
                            <p>Начислений ещё нет.</p>
                          )}
                        </section>
                      ) : (
                        auth
                      )}
                    </>
                  )}
                  {page === "profile" && (
                    <>
                      <h1>Мой профиль</h1>
                      {user ? (
                        <section className="proto-card">
                          <p>{user.email}</p>
                          <p>
                            Вход по защищённой cookie. Авторизация и баланс
                            хранятся на сервере.
                          </p>
                          {button("Выйти", async () => {
                            await api.request("/auth/logout", "POST");
                            api.csrf = "";
                            setUser(null);
                            setDocs([]);
                            setReferral(null);
                            setSelected("");
                          })}
                        </section>
                      ) : (
                        auth
                      )}
                    </>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}
    </ChromeTheme.Provider>
  );
}
