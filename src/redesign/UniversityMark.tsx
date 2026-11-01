import React from "react";

/** Small monochrome interpretations for the ticker, not official university seals. */
export function UniversityMark({ name }: { name: string }) {
  const marks: Record<string, React.ReactNode> = {
    "МГУ": <><path d="M6 54h52M12 54V39h10v15m20 0V39h10v15M24 54V26h16v28M28 26V14h8v12M32 14V5m-5 15h10M12 43h10m20 0h10M29 33h6m-6 7h6m-6 7h6"/><path d="m32 3 2 4 5 1-4 3 1 5-4-3-4 3 1-5-4-3 5-1Z"/></>,
    "ВШЭ": <><circle cx="32" cy="32" r="26"/><circle cx="32" cy="32" r="21" strokeDasharray="1 4"/><path d="m32 18-5 9-13-6 7 12-5 8 11-4 5 10 5-10 11 4-5-8 7-12-13 6Z"/><path d="m26 29 6 5 6-5m-6 5v11"/></>,
    "УИГА": <><path d="M5 32h18L32 9l9 23h18L41 42l-9 14-9-14Z"/><path d="m12 32 20 7 20-7M32 15v31M19 49l-8-7m34 7 8-7"/></>,
    "СПбГУ": <><path d="m18 12 28 41M46 12 18 53M13 8l10 8-5 5-8-9Zm38 0-10 8 5 5 8-9ZM23 42l9-19 9 19-9 9Z"/><path d="M26 31h12M24 39h16M32 18V7m-5 3h10"/></>,
    "ИТМО": <><path d="M6 13h52v38H6Z"/><text x="32" y="39" textAnchor="middle" fontSize="20" fontWeight="800" fill="currentColor" stroke="none" fontFamily="Arial,sans-serif">itmo</text></>,
    "КФУ": <><path d="M7 51h50M11 45h42M16 43V28m8 15V28m16 15V28m8 15V28M10 25l22-13 22 13ZM32 12V5"/><path d="M29 43V31h6v12"/></>,
    "УрФУ": <><path d="m8 17 11 25V17m7 0v32m0-20h12m0-12v32m7-32v17l6 8 7-8V17M9 51h47"/></>,
    "РУДН": <><circle cx="32" cy="32" r="24"/><ellipse cx="32" cy="32" rx="11" ry="24"/><path d="M9 25h46M9 39h46M32 8v48M16 13l32 38M48 13 16 51"/></>,
    "МФТИ": <><path d="m10 46 15-30 8 16 7-11 14 25ZM16 46h33"/><circle cx="42" cy="14" r="5"/><path d="m9 51 18-9m12-7 16-8"/></>,
    "МГТУ им. Баумана": <><path d="m26 9 12 0 2 7 8 5 7-1 5 11-6 5-1 9 4 6-10 7-7-4-9 1-5 5-10-7 2-8-4-8-7-3 3-12 8-1 6-6Z"/><circle cx="33" cy="34" r="13"/><path d="M25 42V26l8 9 8-9v16"/></>,
    "РАНХиГС": <><path d="M10 14h44v39H10ZM17 22h30M20 28v17m8-17v17m8-17v17m8-17v17M16 48h32M20 8h24"/></>,
    "Финансовый университет": <><path d="M32 8v48M12 16h40M15 16v23q17 17 34 0V16M20 24h24M23 31h18"/><path d="M19 49 9 44m36 5 10-5"/></>,
    "ТГУ": <><path d="M8 48h48M13 48V26h38v22M9 25l23-12 23 12ZM20 29v14m8-14v14m8-14v14m8-14v14M27 13V7h10v6"/></>,
    "НИЯУ МИФИ": <><ellipse cx="32" cy="32" rx="26" ry="10"/><ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="26" ry="10" transform="rotate(120 32 32)"/><circle cx="32" cy="32" r="4" fill="currentColor"/></>,
    "СФУ": <><path d="m8 43 11-23 9 23 9-23 10 23 9-23M8 51h48M12 12h40"/><path d="m20 35 9-7 9 7 9-7"/></>,
    "НГУ": <><path d="M9 13v38M22 13v38M9 32h13M32 51V13h14M43 13l7 19 8-19M50 32v19"/></>,
  };
  return <svg className="university-mark" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{marks[name]}</svg>;
}
