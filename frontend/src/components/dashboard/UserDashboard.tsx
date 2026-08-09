import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Download, 
  Eye, 
  Coins, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  User, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  ArrowUpRight
} from "lucide-react";
import { PaymentTopUpModal } from "../modals/PaymentTopUpModal";
import { GlassCard } from "../ui/GlassCard";

interface UserDashboardProps {
  onNewDocument: () => void;
  onViewDocument: (docId: string) => void;
}

interface DocumentItem {
  id: string;
  title: string;
  docType: "coursework" | "abstract" | "vkr";
  status: "completed" | "processing" | "failed" | "draft";
  createdAt: string;
  pageCount: number;
}

const mockDocuments: DocumentItem[] = [
  {
    id: "doc_101",
    title: "Применение искусственного интеллекта в автоматизации банковских процессов",
    docType: "coursework",
    status: "completed",
    createdAt: "07 авг 2026, 21:40",
    pageCount: 32,
  },
  {
    id: "doc_102",
    title: "Правовое регулирование цифровых финансовых активов в РФ",
    docType: "vkr",
    status: "completed",
    createdAt: "05 авг 2026, 14:15",
    pageCount: 68,
  },
  {
    id: "doc_103",
    title: "Разработка микросервисной архитектуры высоконагруженных систем",
    docType: "coursework",
    status: "processing",
    createdAt: "Сегодня, 23:10",
    pageCount: 28,
  },
  {
    id: "doc_104",
    title: "Анализ современных методов оптимизации запросов в БД PostgreSQL",
    docType: "abstract",
    status: "completed",
    createdAt: "01 авг 2026, 18:20",
    pageCount: 18,
  },
];

export const UserDashboard: React.FC<UserDashboardProps> = ({
  onNewDocument,
  onViewDocument,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);
  const [userCredits, setUserCredits] = useState<number>(15);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === "all" || doc.docType === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleDeleteDoc = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Вы уверены, что хотите удалить этот документ?")) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  const handleSuccessTopUp = (added: number) => {
    setUserCredits((prev) => prev + added);
  };

  const getDocTypeBadge = (type: DocumentItem["docType"]) => {
    switch (type) {
      case "coursework":
        return { label: "Курсовая", icon: GraduationCap, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" };
      case "vkr":
        return { label: "ВКР / Диплом", icon: FileText, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
      case "abstract":
        return { label: "Реферат", icon: BookOpen, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    }
  };

  const getStatusBadge = (status: DocumentItem["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Готов (ГОСТ)</span>
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Генерация ИИ</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Ошибка</span>
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <span>Черновик</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-4">
      {/* Top Banner / User Header */}
      <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden shadow-glass">
        <div className="flex items-center space-x-4 sm:space-x-5 relative z-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-xl shadow-indigo-600/30 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
              <User className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white dark:text-white light:text-slate-900">Иван Иванов</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                PRO ГОСТ
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 mt-1">ivan.student@vuz.ru • На платформе с 2026 года</p>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 relative z-10 w-full md:w-auto">
          <div className="glass-card px-4 py-2.5 rounded-2xl border border-amber-500/30 bg-amber-950/20 flex items-center justify-between space-x-3 flex-1 sm:flex-initial">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Coins className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">Баланс кредитов</p>
                <p className="text-lg font-extrabold text-white font-mono">{userCredits} <span className="text-xs text-amber-400 font-normal">CR</span></p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsTopUpModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1 cursor-pointer shrink-0"
            >
              <span>Пополнить</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNewDocument}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer glow-effect-indigo"
          >
            <Plus className="w-5 h-5" />
            <span>Создать документ</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <GlassCard variant="indigo" interactive className="p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium">Всего создано работ</p>
            <p className="text-2xl font-extrabold text-white dark:text-white light:text-slate-900 mt-1 font-mono">{documents.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard variant="gold" interactive className="p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium">Сгенерировано страниц</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">146 стр.</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </GlassCard>

        <GlassCard variant="cyan" interactive className="p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-400 light:text-slate-600 font-medium">Соответствие ГОСТ 7.32</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">100%</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </GlassCard>
      </div>

      {/* Main Documents Section */}
      <GlassCard variant="indigo" interactive={false} className="p-4 sm:p-6 rounded-3xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white dark:text-white light:text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Мои сгенерированные документы</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full pl-10 pr-4 py-2 glass-input rounded-xl text-white text-xs focus:outline-none"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 glass-input rounded-xl text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">Все типы</option>
              <option value="coursework" className="bg-slate-900 text-white">Курсовые</option>
              <option value="vkr" className="bg-slate-900 text-white">ВКР / Дипломы</option>
              <option value="abstract" className="bg-slate-900 text-white">Рефераты</option>
            </select>
          </div>
        </div>

        {/* Mobile Responsive Cards View for Touch Devices (hidden on md and up) */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          <AnimatePresence>
            {filteredDocs.map((doc) => {
              const typeConfig = getDocTypeBadge(doc.docType);
              const TypeIcon = typeConfig.icon;

              return (
                <motion.div
                  key={`mobile-${doc.id}`}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewDocument(doc.id)}
                  className="p-4 rounded-2xl glass-card border border-slate-800 space-y-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-xl border ${typeConfig.color}`}>
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300">{typeConfig.label}</span>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>

                  <h3 className="font-bold text-sm text-white line-clamp-2">{doc.title}</h3>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>{doc.createdAt} • {doc.pageCount} стр.</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDocument(doc.id);
                        }}
                        className="p-2 rounded-xl bg-slate-800 text-indigo-400 cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Скачивание ${doc.title}.docx`);
                        }}
                        className="p-2 rounded-xl bg-slate-800 text-emerald-400 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteDoc(doc.id, e)}
                        className="p-2 rounded-xl bg-slate-800 text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Desktop Documents Table (hidden on small mobile) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Тип & Документ</th>
                <th className="py-3 px-4">Объем</th>
                <th className="py-3 px-4">Дата создания</th>
                <th className="py-3 px-4">Статус</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredDocs.map((doc) => {
                const typeConfig = getDocTypeBadge(doc.docType);
                const TypeIcon = typeConfig.icon;

                return (
                  <tr
                    key={doc.id}
                    onClick={() => onViewDocument(doc.id)}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 max-w-md">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-xl border ${typeConfig.color} flex-shrink-0 mt-0.5`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white dark:text-white light:text-slate-900 group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {doc.title}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {doc.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-medium text-slate-300 dark:text-slate-300 light:text-slate-700">
                      {doc.pageCount} стр.
                    </td>

                    <td className="py-4 px-4 text-slate-400">
                      {doc.createdAt}
                    </td>

                    <td className="py-4 px-4">
                      {getStatusBadge(doc.status)}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDocument(doc.id);
                          }}
                          className="p-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer"
                          title="Просмотреть в Web DOCX Viewer A4"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Скачивание готового файла ${doc.title}.docx`);
                          }}
                          className="p-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer"
                          title="Скачать DOCX"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleDeleteDoc(doc.id, e)}
                          className="p-2 rounded-xl bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* TopUp Payment Modal */}
      <PaymentTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onSuccessPayment={handleSuccessTopUp}
      />
    </div>
  );
};
