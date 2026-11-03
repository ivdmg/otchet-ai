export type Job = {
  id: string;
  kind: string;
  status: string;
  stage: string;
  current_section: string;
  completed_units: number;
  total_units: number;
  percent: number;
  error: string;
  retry_at: number;
};
export type Order = {
  payment_mode?: string;
  id: string;
  method: string;
  state: string;
  amount_kopecks: number;
  checkout_url: string | null;
  refunds: { id: string; state: string; error: string }[];
};
export type Document = {
  created?: number;
  id: string;
  topic: string;
  doc_type: string;
  state: string;
  plan: { sections: string[] } | null;
  approved_plan: { sections: string[] } | null;
  jobs: Job[];
  order: Order | null;
  download_url: string | null;
};
export type Catalog = {
  payment_mode?: string;
  price_kopecks: number;
  bonus_hundredths: number;
  retention_days: number;
  max_sections: number;
};
export type Referral = {
  link: string;
  registered: number;
  qualified: number;
  available: number;
  pending: number;
  held: number;
  reserved: number;
  debt: number;
  remaining_to_standard: number;
  standard_price_hundredths: number;
  maturation_days: number;
  history: {
    operation_id: string;
    kind: string;
    amount: number;
    created: number;
  }[];
};
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public retryAfter = 0,
  ) {
    super(code);
  }
}
export class PrototypeApi {
  csrf = "";
  constructor(public expired: () => void) {}
  async request<T>(
    path: string,
    method = "GET",
    body?: unknown,
    signal?: AbortSignal,
  ): Promise<T> {
    const response = await fetch(`/api/v1${path}`, {
      method,
      credentials: "include",
      signal: AbortSignal.any([
        signal || new AbortController().signal,
        AbortSignal.timeout(20000),
      ]),
      headers: {
        ...(this.csrf ? { "X-CSRF-Token": this.csrf } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      if (response.status === 401 && path != "/auth/login" && path != "/auth/me") this.expired();
      throw new ApiError(
        response.status,
        typeof data.detail === "string" ? data.detail : "validation_error",
        Number(data.retry_after || response.headers.get("Retry-After") || 0),
      );
    }
    return response.json();
  }
  async download(id: string) {
    const r = await fetch(
      `/api/v1/documents/${encodeURIComponent(id)}/download`,
      {
        credentials: "include",
        signal: AbortSignal.timeout(20000),
      },
    );
    if (!r.ok) {
      if (r.status === 401) this.expired();
      throw new ApiError(r.status, "download_unavailable");
    }
    const url = URL.createObjectURL(await r.blob());
    const a = document.createElement("a");
    a.href = url;
    a.download = `gostdoc-${id}.docx`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
}
export const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 }).format(n / 100);
export const statuses: Record<string, string> = {
  planning: "Составляем AI-план",
  plan_ready: "План готов к правкам",
  approved: "План утверждён",
  ordered: "Заказ создан",
  generating: "Генерация",
  checking_payment: "Проверяем оплату на сервере",
  queued: "В очереди",
  running: "AI работает",
  retry: "Ожидание повторной попытки AI",
  completed: "Готово",
  failed: "Технический сбой",
  simulated_refund: "Генерация не завершена. Тестовый заказ отменён, деньги не списывались.",
  simulated_partial_refund: "Частичный тестовый возврат, без денежного списания",
  pdf: "Конвертируем и проверяем PDF",
  draft: "Черновик",
  test_failed: "Генерация не завершилась. Денежного списания не было.",
  cancelled: "Отменено",
  payment_attention: "Оплата не определена — нужна сверка оператора",
  refund_pending: "Возврат обрабатывается",
  refund_attention: "Возврат требует помощи оператора",
  refunded: "Денежный возврат подтверждён",
  partially_refunded: "Частичный денежный возврат",
  bonus_released: "Бонусный резерв возвращён",
  expired: "Срок хранения истёк",
  archived: "Черновик архивирован",
  docx: "Сохраняем DOCX",
  validation: "Проверяем оформление",
  bibliography: "Источники",
  intro: "Введение",
  conclusion: "Заключение",
};
export function errorText(e: unknown) {
  if (e instanceof ApiError) {
    const map: Record<string, string> = {
      groq_key_missing:
        "На backend не настроен GROQ_API_KEY. Настоящий AI-план пока недоступен.",
      openrouter_key_missing: "На сервере не настроен ключ OpenRouter. AI-генерация пока недоступна.",
      ai_credits_required: "На балансе AI-провайдера недостаточно средств. Генерация остановлена.",
      yukassa_test_credentials_required:
        "На backend не настроены тестовые реквизиты ЮKassa.",
      closed_prototype:
        "Локальный сервер не прошёл private gate. Проверьте существующий .env и перезапустите npm run dev.",
      ai_access_denied: "AI-провайдер отклонил доступ (HTTP 403). Проверьте разрешения модели и сетевой доступ; заказ не завершён.",
      ai_auth: "AI-провайдер не принял авторизацию. Проверьте серверную настройку ключа.",
      stale_approval: "План изменился. Закройте окно и подтвердите актуальный план.",
      plan_hourly_limit: "Доступно до трёх AI-планов в час. Ручное редактирование бесплатно.",
      plan_daily_limit: "Дневной лимит пяти AI-планов исчерпан. Ручное редактирование бесплатно.",
      daily_ai_budget_reserved: "Дневной бюджет AI исчерпан. Новый заказ не создан, оплата не проводилась.",
      input_token_limit: "Требования или план превышают допустимый объём AI-входа. Сократите их.",
      invalid_credentials: "Неверный email или пароль.",
      email_verification_required:
        "Подтвердите email токеном из локального mail sink.",
      insufficient_bonus_or_debt:
        "Не хватает доступных бонусов или есть бонусный долг. Можно оплатить рублями.",
      validation_error:
        "Проверьте поля: тема 8–400 символов, пароль 12–128, план 2–3 главы с 1–4 уникальными параграфами по 3–160 символов.",
      email_exists: "Этот email уже зарегистрирован.",
      invalid_or_expired_token: "Токен истёк или уже использован.",
      download_unavailable:
        "Файл недоступен: проверьте вход, владельца и срок хранения.",
    };
    return (
      map[e.code] ||
      (e.status === 401
        ? "Сессия истекла. Войдите снова; форма сохранена."
        : e.status === 409
          ? "Состояние изменилось на сервере. Обновите работу перед повтором."
          : e.status === 429
            ? "Лимит запросов. Сделайте паузу перед повтором."
            : `Сервис сообщил: ${e.code}.`)
    );
  }
  return "Не удалось связаться с сервером. Проверьте сеть. Существующий заказ не нужно оплачивать повторно.";
}
