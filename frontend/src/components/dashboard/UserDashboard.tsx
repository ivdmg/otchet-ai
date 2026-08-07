import React, { useState } from "react";
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
        return { label: "Курсовая", icon: GraduationCap, color: "text-blue-400 bg-blue-500/10 border-blue-500/20" };
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
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
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
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Top Banner / User Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="flex items-center space-x-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-xl shadow-blue-600/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
              <User className="w-8 h-8" />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-white">Иван Иванов</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                PRO ГОСТ
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">ivan.student@vuz.ru • На платформе с 2026 года</p>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="flex flex-wrap items-center gap-4 relative z-10">
          <div className="glass-card px-5 py-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Coins className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Баланс кредитов</p>
              <p className="text-xl font-extrabold text-white font-mono">{userCredits} <span className="text-xs text-amber-400 font-normal">CR</span></p>
            </div>
            <button
              onClick={() => setIsTopUpModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>Пополнить</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={onNewDocument}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/25 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Создать документ</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Всего создано работ</p>
            <p className="text-2xl font-extrabold text-white mt-1 font-mono">{documents.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Сгенерировано страниц</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">146 стр.</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Соответствие ГОСТ 7.32</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">100%</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Documents Table / Search Section */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <span>Мои сгенерированные документы</span>
          </h2>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="relative">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="all">Все типы</option>
                <option value="coursework">Курсовые</option>
                <option value="vkr">ВКР / Дипломы</option>
                <option value="abstract">Рефераты</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
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
                    className="hover:bg-slate-900/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 max-w-md">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-xl border ${typeConfig.color} flex-shrink-0 mt-0.5`}>
                          <TypeIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                            {doc.title}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {doc.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-medium text-slate-300">
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDocument(doc.id);
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 transition-colors"
                          title="Просмотреть в Web DOCX Viewer A4"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Скачивание готового файла ${doc.title}.docx`);
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-400 transition-colors"
                          title="Скачать DOCX"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteDoc(doc.id, e)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
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
