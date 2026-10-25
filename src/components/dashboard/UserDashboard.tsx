import React, { useState } from "react";
import { 
  FileText, 
  Download, 
  Eye, 
  Coins, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  User, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  ArrowUpRight,
  Share2,
  Copy,
  Users,
  Award,
  Settings,
  Building2,
  Lock,
  ExternalLink,
  Check,
  Send,
  ChevronDown
} from "lucide-react";
import { PaymentTopUpModal } from "../modals/PaymentTopUpModal";
import { DownloadFormatModal } from "../modals/DownloadFormatModal";
import { openPdfInBrowser } from "../../lib/pdfExport";
import { useUserStore } from "../../store/useUserStore";

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
}) => {
  const [activeTab, setActiveTab] = useState<"works" | "referral" | "settings">("works");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("all");
  const [documents, setDocuments] = useState<DocumentItem[]>(mockDocuments);

  const { user, addCredits, updateProfile, updateTitleDefaults, toggleLinkedAccount } = useUserStore();

  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [downloadModalData, setDownloadModalData] = useState<{ isOpen: boolean; title: string; docType?: string }>({
    isOpen: false,
    title: "",
  });

  const [copiedReferral, setCopiedReferral] = useState(false);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);
  const [isTitleAccordionOpen, setIsTitleAccordionOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  // Form state for Title Defaults & Password
  const [titleForm, setTitleForm] = useState(user.titleDefaults);
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    email: user.email,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [deleteTargetDoc, setDeleteTargetDoc] = useState<DocumentItem | null>(null);
  const [expandedDocIds, setExpandedDocIds] = useState<Record<string, boolean>>({});
  const [expandedRefIds, setExpandedRefIds] = useState<Record<string, boolean>>({});

  const toggleDocDetails = (id: string) => {
    setExpandedDocIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRefDetails = (id: string) => {
    setExpandedRefIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === "all" || doc.docType === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleDeleteDoc = (doc: DocumentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTargetDoc(doc);
  };

  const handleCopyRef = () => {
    const fullLink = `https://gostdoc.ai/ref/${user.referralCode}`;
    navigator.clipboard.writeText(fullLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateTitleDefaults(titleForm);
    updateProfile({ name: profileForm.name, email: profileForm.email });
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  const handleViewPdf = (doc: DocumentItem) => {
    openPdfInBrowser({
      title: doc.title,
      docType: doc.docType,
      authorName: user.titleDefaults.studentName || user.name,
      university: user.titleDefaults.university,
      department: user.titleDefaults.department,
      city: user.titleDefaults.city,
    });
  };

  const handleOpenDownloadModal = (doc: DocumentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDownloadModalData({
      isOpen: true,
      title: doc.title,
      docType: doc.docType,
    });
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-4">
      
      {/* Top User Header Card */}
      <div className="bg-transparent p-5 sm:p-7 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-300">
            <User className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg sm:text-xl font-bold text-white">{user.name}</h1>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Balance & Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-transparent px-4 py-2 rounded-xl border border-white/[0.08] flex items-center justify-between space-x-4 flex-1 sm:flex-initial">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/[0.08] text-amber-400 flex items-center justify-center">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-mono uppercase">Баланс кредитов</p>
                <p className="text-base font-bold text-white font-mono">{user.credits} <span className="text-xs text-zinc-400">CR</span></p>
              </div>
            </div>
            <button
              onClick={() => setIsTopUpModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] font-medium text-xs transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>Пополнить</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={onNewDocument}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Создать работу</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs: Мои работы | Рефералка | Настройки (Responsive wrapping) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-2">
        <button
          onClick={() => setActiveTab("works")}
          className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === "works"
              ? "bg-white text-zinc-950 font-bold shadow-sm"
              : "text-zinc-400 hover:text-white bg-transparent"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Мои работы</span>
          <span className="ml-1 px-1.5 py-0.2 rounded bg-zinc-800/80 text-[10px] text-zinc-300">
            {documents.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("referral")}
          className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === "referral"
              ? "bg-white text-zinc-950 font-bold shadow-sm"
              : "text-zinc-400 hover:text-white bg-transparent"
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Реферальная система</span>
          <span className="ml-1 px-2 py-0.5 rounded bg-amber-300 text-zinc-950 text-[10px] font-bold">
            +{user.referralEarnedCredits} CR
          </span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-white text-zinc-950 font-bold shadow-sm"
              : "text-zinc-400 hover:text-white bg-transparent"
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Настройки</span>
        </button>
      </div>

      {/* ================= TAB 1: МОИ РАБОТЫ ================= */}
      {activeTab === "works" && (
        <div className="space-y-6">
          {/* Stats Bar (2 Cards: Total Works and Generated Pages) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-transparent p-5 rounded-2xl border border-white/[0.08] flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-mono">Всего работ</p>
                <p className="text-2xl font-extrabold text-white mt-1 font-mono">{documents.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.08] text-zinc-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-transparent p-5 rounded-2xl border border-white/[0.08] flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-mono">Сгенерировано страниц</p>
                <p className="text-2xl font-extrabold text-white mt-1 font-mono">146 стр.</p>
              </div>
              <div className="p-3 rounded-xl bg-zinc-900 border border-white/[0.08] text-zinc-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Documents Table Container */}
          <div className="bg-transparent p-5 sm:p-7 rounded-2xl border border-white/[0.08] space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Список сгенерированных работ</span>
              </h2>

              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск по названию..."
                    className="w-full pl-9 pr-3.5 py-1.5 bg-zinc-950 border border-white/[0.08] rounded-xl text-zinc-100 text-xs placeholder-zinc-600 focus:outline-none focus:border-white"
                  />
                </div>

                {/* Custom Styled Dropdown for Type Filter */}
                <div className="relative w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                    className="w-full sm:w-44 px-3.5 py-1.5 bg-zinc-950 border border-white/[0.08] hover:border-white/20 rounded-xl text-zinc-200 text-xs flex items-center justify-between cursor-pointer transition-all"
                  >
                    <span>
                      {selectedTypeFilter === "coursework"
                        ? "Курсовые работы"
                        : selectedTypeFilter === "vkr"
                        ? "ВКР / Дипломы"
                        : selectedTypeFilter === "abstract"
                        ? "Рефераты"
                        : "Все типы"}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isFilterDropdownOpen && (
                    <div className="absolute right-0 top-full mt-1.5 w-full sm:w-44 bg-[#0e1017] border border-white/[0.1] rounded-xl shadow-2xl p-1 z-30 space-y-0.5">
                      {[
                        { id: "all", label: "Все типы" },
                        { id: "coursework", label: "Курсовые работы" },
                        { id: "vkr", label: "ВКР / Дипломы" },
                        { id: "abstract", label: "Рефераты" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedTypeFilter(item.id);
                            setIsFilterDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            selectedTypeFilter === item.id
                              ? "bg-white text-zinc-950 font-semibold"
                              : "text-zinc-300 hover:bg-zinc-900"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Card List (No horizontal scroll) */}
            <div className="md:hidden space-y-3">
              {filteredDocs.map((doc) => {
                const typeConfig = getDocTypeBadge(doc.docType);
                const TypeIcon = typeConfig.icon;
                const isExpanded = !!expandedDocIds[doc.id];

                return (
                  <div
                    key={`mob-doc-${doc.id}`}
                    className="p-4 rounded-xl bg-zinc-950/70 border border-white/[0.08] space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300 shrink-0 mt-0.5">
                        <TypeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-1.5 py-0.2 rounded border border-zinc-800">
                            {typeConfig.label}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">ID: {doc.id}</span>
                        </div>
                        <h4 className="text-xs font-semibold text-white leading-snug pt-1 break-words">
                          {doc.title}
                        </h4>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => handleViewPdf(doc)}
                        className="flex-1 py-2 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] text-xs font-mono flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-zinc-400" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={(e) => handleOpenDownloadModal(doc, e)}
                        className="flex-1 py-2 px-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-mono font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Скачать</span>
                      </button>

                      <button
                        onClick={(e) => handleDeleteDoc(doc, e)}
                        className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-white/[0.08] transition-colors cursor-pointer shrink-0"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Details Accordion */}
                    <div className="border-t border-white/[0.06] pt-2">
                      <button
                        type="button"
                        onClick={() => toggleDocDetails(doc.id)}
                        className="w-full flex items-center justify-between text-[11px] font-mono text-zinc-400 hover:text-zinc-200 py-0.5 cursor-pointer"
                      >
                        <span>Подробнее</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      {isExpanded && (
                        <div className="pt-2 space-y-1.5 text-[11px] font-mono text-zinc-400 bg-zinc-900/50 p-2.5 rounded-lg mt-1 border border-white/[0.04]">
                          <div className="flex justify-between">
                            <span>Объем:</span>
                            <span className="text-zinc-200 font-bold">{doc.pageCount} страниц</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Дата создания:</span>
                            <span className="text-zinc-300">{doc.createdAt}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Статус:</span>
                            <span className="inline-flex items-center space-x-1 px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/60">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Готов</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-xs text-zinc-500 font-mono uppercase tracking-wider">
                    <th className="py-3 px-4">Тип & Название</th>
                    <th className="py-3 px-4">Объем</th>
                    <th className="py-3 px-4">Дата создания</th>
                    <th className="py-3 px-4">Статус</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-xs">
                  {filteredDocs.map((doc) => {
                    const typeConfig = getDocTypeBadge(doc.docType);
                    const TypeIcon = typeConfig.icon;

                    return (
                      <tr
                        key={doc.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300 flex-shrink-0 mt-0.5">
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
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/60">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Готов</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Open PDF in Browser Tab */}
                            <button
                              onClick={() => handleViewPdf(doc)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-white/[0.08] text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer"
                              title="Открыть PDF работы в браузере"
                            >
                              <Eye className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Открыть PDF</span>
                            </button>

                            {/* Download Button (opens modal with DOCX or PDF) */}
                            <button
                              onClick={(e) => handleOpenDownloadModal(doc, e)}
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-mono font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                              title="Скачать работу (выбор формата DOCX / PDF)"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Скачать</span>
                            </button>

                            <button
                              onClick={(e) => handleDeleteDoc(doc, e)}
                              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 border border-white/[0.08] transition-colors cursor-pointer"
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
        </div>
      )}

      {/* ================= TAB 2: РЕФЕРАЛЬНАЯ СИСТЕМА ================= */}
      {activeTab === "referral" && (
        <div className="space-y-6">
          {/* Referral Banner */}
          <div className="bg-transparent p-6 sm:p-8 rounded-2xl border border-white/[0.08] space-y-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-md bg-amber-300 text-zinc-950 font-bold shadow-sm inline-block">
                Партнерская программа для студентов
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Приглашай одногруппников и получай бесплатные генерации
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Делись персональной ссылкой: друг получает скидку 10% на первую генерацию, а ты получаешь <strong className="text-white">5–10 кредитов</strong> с каждой завершенной работы.
              </p>
            </div>

            {/* Referral Link Copy Bar */}
            <div className="p-4 rounded-xl bg-zinc-950/80 border border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-2xl">
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 font-mono uppercase">Ваша персональная ссылка:</span>
                <div className="font-mono text-sm text-amber-300 font-bold truncate">
                  https://gostdoc.ai/ref/{user.referralCode}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyRef}
                className="px-4 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs font-mono flex items-center justify-center space-x-2 transition-all cursor-pointer shrink-0"
              >
                {copiedReferral ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Ссылка скопирована!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Скопировать ссылку</span>
                  </>
                )}
              </button>
            </div>

            {/* 4 Referral Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06]">
                <p className="text-[11px] text-zinc-400 font-mono">Переходов по ссылке</p>
                <p className="text-xl font-bold font-mono text-white mt-1">{user.referralClicks}</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06]">
                <p className="text-[11px] text-zinc-400 font-mono">Регистраций друзей</p>
                <p className="text-xl font-bold font-mono text-white mt-1">{user.referralSignups}</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06]">
                <p className="text-[11px] text-zinc-400 font-mono">Работ выполнено</p>
                <p className="text-xl font-bold font-mono text-white mt-1">{user.referralWorksGenerated}</p>
              </div>
              <div className="p-4 rounded-xl bg-zinc-950/50 border border-white/[0.06]">
                <p className="text-[11px] text-zinc-400 font-mono">Начислено бонусов</p>
                <p className="text-xl font-bold font-mono text-amber-400 mt-1">+{user.referralEarnedCredits} CR</p>
              </div>
            </div>
          </div>

          {/* Referral History */}
          <div className="bg-transparent p-5 sm:p-6 rounded-2xl border border-white/[0.08] space-y-4">
            <h3 className="text-sm font-bold text-white">История приглашений и начислений</h3>
            
            {/* Mobile Referral Cards (No horizontal scroll) */}
            <div className="md:hidden space-y-2.5">
              {user.referrals.map((ref) => {
                const isExpanded = !!expandedRefIds[ref.id];

                return (
                  <div
                    key={`mob-ref-${ref.id}`}
                    className="p-3.5 rounded-xl bg-zinc-950/70 border border-white/[0.06] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-white">{ref.friendName}</p>
                        <p className="text-[10px] font-mono text-zinc-500">{ref.date}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          +{ref.rewardCredits} CR
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleRefDetails(ref.id)}
                          className="p-1 rounded text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="pt-2 border-t border-white/[0.06] text-[11px] font-mono space-y-1 text-zinc-400">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-zinc-500">Работа:</span>
                          <span className="text-zinc-200 text-right">{ref.docTitle}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-500">Статус:</span>
                          <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
                            Зачислено
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-zinc-500 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Дата</th>
                    <th className="py-2.5 px-3">Друг</th>
                    <th className="py-2.5 px-3">Работа</th>
                    <th className="py-2.5 px-3">Начисление</th>
                    <th className="py-2.5 px-3 text-right">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {user.referrals.map((ref) => (
                    <tr key={ref.id} className="text-zinc-300">
                      <td className="py-3 px-3 font-mono text-zinc-500">{ref.date}</td>
                      <td className="py-3 px-3 font-semibold text-white">{ref.friendName}</td>
                      <td className="py-3 px-3 text-zinc-400">{ref.docTitle}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">+{ref.rewardCredits} CR</td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-800/50">
                          Зачислено
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: НАСТРОЙКИ ================= */}
      {activeTab === "settings" && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* 1. Account Profile & Security (PRIMARY SECTION) */}
          <div className="bg-transparent p-6 sm:p-7 rounded-2xl border border-white/[0.08] space-y-5">
            <div className="flex items-center space-x-2.5 border-b border-white/[0.06] pb-3">
              <User className="w-5 h-5 text-zinc-300" />
              <div>
                <h3 className="text-sm font-bold text-white">Профиль и безопасность</h3>
                <p className="text-[11px] text-zinc-400">Управление учетной записью</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-zinc-300 block mb-1 font-medium">Имя пользователя</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-medium">Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 focus:outline-none focus:border-white"
                />
              </div>
            </div>

            {/* Password Change Block */}
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                  Смена пароля
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordSent(true);
                    setTimeout(() => setForgotPasswordSent(false), 4000);
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  Забыли пароль?
                </button>
              </div>

              {forgotPasswordSent && (
                <div className="p-2.5 rounded-lg bg-zinc-900 border border-white/20 text-xs text-zinc-200 font-mono">
                  Ссылка для сброса пароля отправлена на {profileForm.email}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Текущий пароль</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Новый пароль</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-medium">Повторите пароль</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 focus:outline-none focus:border-white"
                  />
                </div>
              </div>
            </div>

            {/* Social Accounts Linking */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                Привязка аккаунтов для быстрого входа
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Yandex */}
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 text-xs">
                    <span className="w-6 h-6 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px]">
                      Я
                    </span>
                    <span className="text-zinc-200">Яндекс ID</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLinkedAccount("yandex")}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border ${
                      user.linkedAccounts.yandex
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                        : "bg-zinc-900 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {user.linkedAccounts.yandex ? "Подключен" : "Привязать"}
                  </button>
                </div>

                {/* Google */}
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 text-xs">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                      G
                    </span>
                    <span className="text-zinc-200">Google</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLinkedAccount("google")}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border ${
                      user.linkedAccounts.google
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                        : "bg-zinc-900 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {user.linkedAccounts.google ? "Подключен" : "Привязать"}
                  </button>
                </div>

                {/* Telegram */}
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5 text-xs">
                    <Send className="w-4 h-4 text-sky-400" />
                    <span className="text-zinc-200">Telegram</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleLinkedAccount("telegram")}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border ${
                      user.linkedAccounts.telegram
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                        : "bg-zinc-900 text-zinc-400 border-zinc-700"
                    }`}
                  >
                    {user.linkedAccounts.telegram ? "Подключен" : "Привязать"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Title Page Default Settings (COLLAPSIBLE ACCORDION) */}
          <div className="bg-transparent rounded-2xl border border-white/[0.08] overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsTitleAccordionOpen((prev) => !prev)}
              className="w-full p-6 sm:p-7 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-300">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <span>Данные для титульного листа (ГОСТ 7.32-2017)</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Автоматическая подстановка ВУЗа, кафедры, студента и руководителя
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline-block">
                  {isTitleAccordionOpen ? "Свернуть" : "Развернуть"}
                </span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isTitleAccordionOpen ? "rotate-180" : ""}`} />
              </div>
            </button>

            {isTitleAccordionOpen && (
              <div className="p-6 sm:p-7 pt-2 border-t border-white/[0.06] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2">
                    <label className="text-zinc-300 block mb-1 font-medium">Университет / ВУЗ (полное наименование)</label>
                    <input
                      type="text"
                      value={titleForm.university}
                      onChange={(e) => setTitleForm({ ...titleForm, university: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white"
                      placeholder="ФГБОУ ВО «Московский государственный университет имени М.В. Ломоносова»"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Факультет / Институт</label>
                    <input
                      type="text"
                      value={titleForm.faculty}
                      onChange={(e) => setTitleForm({ ...titleForm, faculty: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white"
                      placeholder="Факультет ВМК"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Кафедра</label>
                    <input
                      type="text"
                      value={titleForm.department}
                      onChange={(e) => setTitleForm({ ...titleForm, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white"
                      placeholder="Кафедра системного анализа"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Специальность / Направление подготовки</label>
                    <input
                      type="text"
                      value={titleForm.specialty}
                      onChange={(e) => setTitleForm({ ...titleForm, specialty: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white"
                      placeholder="09.03.04 Программная инженерия"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Город</label>
                    <input
                      type="text"
                      value={titleForm.city}
                      onChange={(e) => setTitleForm({ ...titleForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white"
                      placeholder="Москва"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">Курс и группа</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={titleForm.course}
                        onChange={(e) => setTitleForm({ ...titleForm, course: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white"
                        placeholder="3 курс"
                      />
                      <input
                        type="text"
                        value={titleForm.group}
                        onChange={(e) => setTitleForm({ ...titleForm, group: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white"
                        placeholder="Группа ПИ-301"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-zinc-300 block mb-1 font-medium">ФИО студента (в именительном падеже)</label>
                    <input
                      type="text"
                      value={titleForm.studentName}
                      onChange={(e) => setTitleForm({ ...titleForm, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white"
                      placeholder="Иванов Иван Иванович"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-300 block mb-1 font-medium">Научный руководитель (ученая степень, звание, ФИО)</label>
                    <input
                      type="text"
                      value={titleForm.supervisor}
                      onChange={(e) => setTitleForm({ ...titleForm, supervisor: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-white/[0.1] text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white"
                      placeholder="доцент, к.т.н. Смирнов Алексей Владимирович"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Save Settings Button with Inline Status Feedback */}
          <div className="flex items-center space-x-4 pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs font-mono transition-all cursor-pointer shadow-md active:scale-98"
            >
              Сохранить изменения
            </button>

            {savedSettingsNotice && (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Изменения сохранены</span>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Top Up Payment Modal */}
      <PaymentTopUpModal
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
        onSuccessPayment={(added) => addCredits(added)}
      />

      {/* Unified Download Format Selection Modal */}
      <DownloadFormatModal
        isOpen={downloadModalData.isOpen}
        onClose={() => setDownloadModalData({ ...downloadModalData, isOpen: false })}
        docTitle={downloadModalData.title}
        docType={downloadModalData.docType}
        authorName={user.titleDefaults.studentName || user.name}
        institution={user.titleDefaults.university}
      />

      {/* Delete Confirmation Modal */}
      {deleteTargetDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[#0e1017] border border-zinc-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-white">Удалить работу?</h3>
                <p className="text-xs text-zinc-400 line-clamp-2">{deleteTargetDoc.title}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              Вы действительно хотите удалить эту работу? Восстановить её будет невозможно.
            </p>

            <div className="flex items-center justify-end space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetDoc(null)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocuments((prev) => prev.filter((d) => d.id !== deleteTargetDoc.id));
                  setDeleteTargetDoc(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
