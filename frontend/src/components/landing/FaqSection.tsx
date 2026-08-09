import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HelpCircle, 
  ChevronDown, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  CreditCard, 
  MessageSquare, 
  Search,
  Zap,
  CheckCircle2
} from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: "gost" | "antiplagiat" | "payment" | "general";
  badge?: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "gost-1",
    question: "Действительно ли верстка на 100% соответствует ГОСТ 7.32-2017?",
    answer: "Да. В отличие от обычных чат-ботов, AI GostDoc использует AST-архитектуру (Abstract Syntax Tree). Движок сначала строит дерево разделов, а затем компилирует документ в MS Word с точным соблюдением полей: 30 мм слева, 10 мм справа, 20 мм сверху и снизу, шрифт Times New Roman 14pt, межстрочный интервал 1.5 и абзацный отступ 1.25 см.",
    category: "gost",
    badge: "ГОСТ 7.32 Гарантия"
  },
  {
    id: "spot-2",
    question: "Как работает функция точечной перегенерации (Spot Regeneration)?",
    answer: "Если научный руководитель попросил переписать определенный параграф или добавить новые данные во 2-ю главу, вам не нужно заново генерировать всю работу. В AST-редакторе вы можете выбрать конкретный узел дерева и перегенерировать только его. Остальной документ и номера рисунков сохранятся.",
    category: "general",
    badge: "Spot Regeneration"
  },
  {
    id: "anti-3",
    question: "Какая оригинальность будет при проверке в «Антиплагиат.ВУЗ»?",
    answer: "Наши модели обучены генерировать глубокий глубоко смысловой академический текст. Средняя оригинальность работ составляет от 85% до 98%. Мы не используем скрытые символы, синонимайзеры или обходы — текст проходит реальную проверку по всем модулям (включая Кольцо ВУЗов и Перефразирования).",
    category: "antiplagiat",
    badge: "85%-98% Уникальность"
  },
  {
    id: "metod-4",
    question: "Что делать, если у моего ВУЗа специфические методические указания?",
    answer: "На 1-м шаге Мастера генерации вы можете загрузить PDF или DOCX файл методички вашего ВУЗа. Наш ИИ проанализирует требования и автоматически адаптирует структуру, шрифт, оформление формул и список источников под ваши правила.",
    category: "gost"
  },
  {
    id: "payment-5",
    question: "Безопасна ли оплата и как быстро начисляются кредиты?",
    answer: "Оплата происходит через защищенный платежный шлюз (СБП, Т-Пэй, банковские карты). Кредиты зачисляются на ваш баланс мгновенно. После каждой операции вы получаете электронный чек по 54-ФЗ.",
    category: "payment",
    badge: "Мгновенно & Безопасно"
  },
  {
    id: "format-6",
    question: "В каком формате я смогу скачать готовую работу?",
    answer: "Вы получаете готовый чистовой файл в формате MS Word (.DOCX). Вы сможете открыть его в любом текстовом редакторе, отредактировать, распечатать или сразу отправить преподавателю.",
    category: "general"
  }
];

export const FaqSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>("gost-1");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredFaqs = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = searchQuery.trim() === "" || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-950/60 via-slate-900 to-violet-950/60 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Часто задаваемые вопросы</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight font-outfit">
            Всё, что вы хотели знать об <span className="gradient-heading">AI GostDoc</span>
          </h2>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Ответы на главные вопросы о нормах ГОСТа, проверках оригинальности и генерации.
          </p>
        </div>

        {/* SEARCH INPUT & CATEGORY TABS */}
        <div className="space-y-4 mb-10">
          
          {/* Search Box */}
          <div className="relative max-w-xl mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по вопросам (например: ГОСТ, оплата, Antiplagiat)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl glass-input text-xs sm:text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === "all"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Все вопросы ({FAQ_ITEMS.length})
            </button>
            <button
              onClick={() => setActiveCategory("gost")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeCategory === "gost"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ГОСТ и Верстка</span>
            </button>
            <button
              onClick={() => setActiveCategory("antiplagiat")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeCategory === "antiplagiat"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Оригинальность</span>
            </button>
            <button
              onClick={() => setActiveCategory("payment")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeCategory === "payment"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Оплата и Опросы</span>
            </button>
          </div>

        </div>

        {/* ACCORDION LIST */}
        <div className="space-y-4 mb-16">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-sm">
              Вопросов по вашему запросу не найдено. Напишите нам в поддержку!
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <GlassCard key={faq.id} variant="indigo" glow className="overflow-hidden border border-slate-800/80">
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between space-x-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm sm:text-base font-bold text-white font-outfit">
                        {faq.question}
                      </span>
                      {faq.badge && (
                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-500/30 font-mono">
                          {faq.badge}
                        </span>
                      )}
                    </div>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-5 sm:px-6 pb-6 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              );
            })
          )}
        </div>

        {/* SUPPORT CONTACT BANNER */}
        <GlassCard variant="indigo" glow className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-indigo-500/30 text-center sm:text-left">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white font-outfit">Остались вопросы?</h4>
              <p className="text-xs text-slate-400 mt-0.5">Наша служба поддержки ответит в Telegram за 3 минуты</p>
            </div>
          </div>

          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-colors flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <span>Написать в Telegram</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </a>
        </GlassCard>

      </div>
    </section>
  );
};

export default FaqSection;
