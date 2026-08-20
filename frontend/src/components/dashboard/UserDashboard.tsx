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
        return { label: "Курсовая", icon: GraduationCap };
      case "vkr":
        return { label: "ВКР / Диплом", icon: FileText };
      case "abstract":
        return { label: "Реферат", icon: BookOpen };
    }
  };

  const getStatusBadge = (status: DocumentItem["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <CheckCircle2 className="w-3 h-3" />
            <span>Готов</span>
          </span>
        );
      case "processing":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-zinc-900 text-zinc-300 border border-zinc-700 animate-pulse">
            <Clock className="w-3 h-3 animate-spin" />
            <span>Сборка ИИ</span>
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-rose-950/60 text-rose-400 border border-rose-800/60">
            <AlertCircle className="w-3 h-3" />
            <span>Ошибка</span>
          </span>
        );
      case "draft":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-zinc-900 text-zinc-500 border border-zinc-800">
            <span>Черновик</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-4">
      {/* Top User Header */}
      <div className="dark-surface p-5 sm:p-7 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <User className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg sm:text-xl font-bold text-zinc-100">Иван Иванов</h1>
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-mono text-[10px] uppercase">
                PRO ГОСТ
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">ivan.student@vuz.ru</p>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="dark-surface px-4 py-2 rounded-xl border border-zinc-800 flex items-center justify-between space-x-4 flex-1 sm:flex-initial">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase">Баланс кредитов</p>
                <p className="text-base font-bold text-zinc-100 font-mono">{userCredits} <span className="text-xs text-zinc-400">CR</span></p>
              </div>
            </div>
            <button
              onClick={() => setIsTopUpModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 font-medium text-xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>Пополнить</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={onNewDocument}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm hover:shadow-glow-cold flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Создать документ</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="dark-surface p-5 rounded-2xl border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-mono">Всего документов</p>
            <p className="text-2xl font-extrabold text-zinc-100 mt-1 font-mono">{documents.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="dark-surface p-5 rounded-2xl border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-mono">Сгенерировано страниц</p>
            <p className="text-2xl font-extrabold text-zinc-100 mt-1 font-mono">146 стр.</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="dark-surface p-5 rounded-2xl border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400 font-mono">Соответствие ГОСТ 7.32</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">100%</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Documents Section */}
      <div className="dark-surface p-5 sm:p-7 rounded-2xl border border-zinc-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-zinc-100 flex items-center space-x-2">
            <span>Мои документы</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full pl-9 pr-3.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-zinc-500 cursor-pointer"
            >
              <option value="all" className="bg-zinc-900 text-zinc-100">Все типы</option>
              <option value="coursework" className="bg-zinc-900 text-zinc-100">Курсовые</option>
              <option value="vkr" className="bg-zinc-900 text-zinc-100">ВКР / Дипломы</option>
              <option value="abstract" className="bg-zinc-900 text-zinc-100">Рефераты</option>
            </select>
          </div>
        </div>

        {/* Mobile Responsive Cards View */}
        <div className="grid grid-cols-1 gap-3 md:hidden">
          <AnimatePresence>
            {filteredDocs.map((doc) => {
              const typeConfig = getDocTypeBadge(doc.docType);
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={`mobile-${doc.id}`}
                  onClick={() => onViewDocument(doc.id)}
                  className="p-4 rounded-xl dark-surface border border-zinc-800 space-y-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <TypeIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-300">{typeConfig.label}</span>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>

                  <h3 className="font-bold text-xs text-zinc-100 line-clamp-2">{doc.title}</h3>

                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800">
                    <span>{doc.createdAt} • {doc.pageCount} стр.</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDocument(doc.id);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert(`Скачивание ${doc.title}.docx`);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteDoc(doc.id, e)}
                        className="p-1.5 rounded-lg bg-zinc-900 text-rose-400 border border-zinc-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Desktop Documents Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 font-mono uppercase tracking-wider">
                <th className="py-3 px-4">Тип & Документ</th>
                <th className="py-3 px-4">Объем</th>
                <th className="py-3 px-4">Дата создания</th>
                <th className="py-3 px-4">Статус</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-xs">
              {filteredDocs.map((doc) => {
                const typeConfig = getDocTypeBadge(doc.docType);
                const TypeIcon = typeConfig.icon;

                return (
                  <tr
                    key={doc.id}
                    onClick={() => onViewDocument(doc.id)}
                    className="hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 max-w-md">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 flex-shrink-0 mt-0.5">
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">
                            {doc.title}
                          </p>
                          <span className="text-[10px] text-zinc-500 font-mono">ID: {doc.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-zinc-400">
                      {doc.pageCount} стр.
                    </td>

                    <td className="py-3.5 px-4 text-zinc-500 font-mono">
                      {doc.createdAt}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(doc.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDocument(doc.id);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
                          title="Просмотреть"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Скачивание готового файла ${doc.title}.docx`);
                          }}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
                          title="Скачать DOCX"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteDoc(doc.id, e)}
                          className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-zinc-800 transition-colors cursor-pointer"
                          title="Удалить"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TopUp Payment Modal */}
      <PaymentTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onSuccessPayment={handleSuccessTopUp}
      />
    </div>
  );
};

export default UserDashboard;
