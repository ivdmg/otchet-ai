import React, { useState } from "react";
import { ChevronDown, HelpCircle, ShieldCheck, MessageSquare, ArrowRight } from "lucide-react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  tag: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "gost-spec",
    question: "Как система гарантирует соответствие ГОСТу?",
    answer: "Мы используем строгую шаблонную компиляцию на базе типографских стандартов OpenXML/LaTeX с экспортом в чистый .docx. В отличие от обычных чат-ботов, верстка формируется детерминированным компилятором: поля 30 мм слева, 15 мм справа, 20 мм сверху и снизу, шрифт Times New Roman 14pt, межстрочный интервал 1.5 и абзацный отступ 1.25 см.",
    tag: "ГОСТ 7.32-2017"
  },
  {
    id: "antiplagiat",
    question: "Будет ли текст оригинальным для систем «Антиплагиат»?",
    answer: "Да. Используется глубокая логическая генерация на основе контекстных академических моделей без прямого копирования общедоступных банков рефератов и без применения запрещенных технических обходов. Средняя оригинальность в системах «Антиплагиат.ВУЗ» составляет от 85% до 98%.",
    tag: "85-98% Оригинальность"
  },
  {
    id: "formulas-tables",
    question: "Поддерживаются ли формулы и сложные таблицы?",
    answer: "Да, система генерирует нативную верстку формул и табличных данных по ГОСТу без вставки растровых скриншотов. Таблицы нумеруются с левым выравниванием заголовков, а математические формулы центрируются с выравниванием номеров по правому краю.",
    tag: "Нативная верстка"
  },
  {
    id: "edit-docx",
    question: "Можно ли редактировать файл после скачивания?",
    answer: "Да, на выходе вы получаете стандартный редактируемый файл Microsoft Word (.docx) со всеми сохраненными встроенными стилями («Заголовок 1», «Основной текст», «Таблица»). Вы можете свободно дописывать текст или менять форматирование.",
    tag: "Microsoft Word .docx"
  },
  {
    id: "custom-metodichka",
    question: "Что если преподаватель выдал свою специфическую методичку?",
    answer: "На первом шаге генерации доступна загрузка файла методических указаний вашего ВУЗа (PDF или DOCX). Парсер извлекает индивидуальные требования кафедры (шрифт, отступы, структуру разделов) и адаптирует генерацию под них.",
    tag: "Адаптация под ВУЗ"
  }
];

export const FaqAccordionSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>("gost-spec");

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden border-t border-zinc-900">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-zinc-800/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span>[ АКАДЕМИЧЕСКИЕ ГАРАНТИИ & FAQ ]</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
            Часто задаваемые вопросы
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Все о гарантиях нормоконтроля, проверке оригинальности и редактировании файлов.
          </p>
        </div>

        {/* Collapsible Accordion List */}
        <div className="space-y-3 mb-12">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="dark-surface rounded-xl overflow-hidden border border-zinc-800 transition-all duration-200"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full p-5 text-left flex items-center justify-between space-x-4 cursor-pointer focus:outline-none group"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="text-xs sm:text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                      {item.question}
                    </span>
                    <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 shrink-0">
                      {item.tag}
                    </span>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-zinc-200 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-zinc-100 border-zinc-700" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-[13px] text-zinc-400 leading-relaxed border-t border-zinc-800/60 font-normal">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Telegram Support Bar */}
        <div className="dark-surface rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-zinc-800 text-center sm:text-left">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-100">Остался специфический вопрос по ГОСТу?</div>
              <div className="text-xs text-zinc-500">Техподдержка ответит на любые вопросы в течение нескольких минут.</div>
            </div>
          </div>

          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white font-medium text-xs transition-colors shrink-0 cursor-pointer"
          >
            <span>Написать в Telegram</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </section>
  );
};

export default FaqAccordionSection;
