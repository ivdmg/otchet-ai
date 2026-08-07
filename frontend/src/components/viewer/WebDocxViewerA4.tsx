import React, { useState } from "react";
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  ChevronLeft, 
  ChevronRight
} from "lucide-react";
import { DocumentASTGraph } from "../../schemas/docAstSchema";
import { SpotRegenerationModal } from "../modals/SpotRegenerationModal";

interface WebDocxViewerA4Props {
  documentAst?: DocumentASTGraph;
  docTitle: string;
  docId?: string;
  onDownloadDocx?: () => void;
}

const mockPagesData = [
  {
    pageNumber: 1,
    isTitlePage: true,
    institution: "МИНИСТЕРСТВО НАУКИ И ВЫСШЕГО ОБРАЗОВАНИЯ РОССИЙСКОЙ ФЕДЕРАЦИИ",
    university: "ФЕДЕРАЛЬНОЕ ГОСУДАРСТВЕННОЕ БЮДЖЕТНОЕ ОБРАЗОВАТЕЛЬНОЕ УЧРЕЖДЕНИЕ ВЫСШЕГО ОБРАЗОВАНИЯ",
    department: "Кафедра «Информационные системы и технологии»",
    type: "КУРСОВАЯ РАБОТА",
    subject: "по дисциплине «Искусственный интеллект»",
    title: "ПРИМЕНЕНИЕ ИСКУССТВЕННОГО ИНТЕЛЛЕКТА В АВТОМАТИЗАЦИИ БАНКОВСКИХ ПРОЦЕССОВ",
    author: "Иванов И.И.",
    cityYear: "Москва 2026",
  },
  {
    pageNumber: 2,
    isTitlePage: false,
    title: "СОДЕРЖАНИЕ",
    content: [
      { type: "toc_item", title: "ВВЕДЕНИЕ", page: "3" },
      { type: "toc_item", title: "ГЛАВА 1. ТЕОРЕТИЧЕСКИЕ ОСНОВЫ ИИ В БАНКОВСКОМ СЕКТОРЕ", page: "5" },
      { type: "toc_item", title: "1.1. Понятие и эволюция автоматизации банковских операций", page: "5" },
      { type: "toc_item", title: "1.2. Нормативно-правовое регулирование ИИ в РФ", page: "8" },
      { type: "toc_item", title: "ГЛАВА 2. АНАЛИЗ ЭФФЕКТИВНОСТИ И ВНЕДРЕНИЯ ИИ-СИСТЕМ", page: "12" },
      { type: "toc_item", title: "2.1. Диагностика бизнес-процессов кредитной организации", page: "12" },
      { type: "toc_item", title: "2.2. Оценка рисков и защищенности данных", page: "16" },
      { type: "toc_item", title: "ЗАКЛЮЧЕНИЕ", page: "21" },
      { type: "toc_item", title: "СПИСОК ИСПОЛЬЗОВАННЫХ ИСТОЧНИКОВ", page: "23" },
    ],
  },
  {
    pageNumber: 3,
    isTitlePage: false,
    title: "ВВЕДЕНИЕ",
    content: [
      {
        type: "paragraph",
        id: "node_intro_rel",
        text: "Актуальность темы исследования обусловлена стремительной цифровизацией банковской сферы и повышением требований к скорости обработки транзакций. Использование алгоритмов машинного обучения и нейросетей позволяет кредитным организациям сократить операционные расходы и минимизировать финансовые риски.",
      },
      {
        type: "paragraph",
        id: "node_intro_obj",
        text: "Объектом исследования являются процессы автоматизации кредитного скоринга и взаимодействия с клиентами в современных банках.",
      },
      {
        type: "paragraph",
        id: "node_intro_sub",
        text: "Предметом исследования выступают методы и алгоритмы искусственного интеллекта, применимые для оптимизации банковских операций.",
      },
      {
        type: "paragraph",
        id: "node_intro_goal",
        text: "Цель работы заключается в разработке проектных решений по внедрению интеллектуальных сервисов в банковские процессы.",
      },
    ],
  },
  {
    pageNumber: 4,
    isTitlePage: false,
    title: "ГЛАВА 1. ТЕОРЕТИЧЕСКИЕ ОСНОВЫ ИИ В БАНКОВСКОМ СЕКТОРЕ",
    content: [
      {
        type: "subtitle",
        text: "1.1. Понятие и эволюция автоматизации банковских операций",
      },
      {
        type: "paragraph",
        id: "node_1_1_p1",
        text: "Автоматизация банковской деятельности представляет собой комплекс программно-аппаратных решений, направленных на выполнение рутинных финансовых операций без прямого участия человека. На современном этапе развития ключевое место занимают технологии машинного обучения.",
      },
      {
        type: "table",
        id: "node_1_1_tbl",
        caption: "Таблица 1.1 — Сравнительный анализ классических и ИИ-систем",
        headers: ["Параметр сравнения", "Традиционные АБС", "Интеллектуальные ИИ-системы"],
        rows: [
          ["Скорость обработки заявки", "До 24 часов", "Менее 30 секунд"],
          ["Точность оценки риска", "78%", "96.4%"],
          ["Адаптивность к фроду", "Низкая (жесткие правила)", "Высокая (самообучение)"],
        ],
      },
      {
        type: "formula",
        id: "node_1_1_form",
        formula_text: "E_{efficiency} = \\sum_{i=1}^{n} \\frac{T_{manual} - T_{ai}}{T_{manual}} \\times 100\\%",
        formula_number: "(1.1)",
      },
    ],
  },
];

export const WebDocxViewerA4: React.FC<WebDocxViewerA4Props> = ({
  docTitle,
  docId = "doc_123",
  onDownloadDocx,
}) => {
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Modal Spot Regeneration state
  const [isSpotModalOpen, setIsSpotModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeText, setSelectedNodeText] = useState<string>("");

  const handleZoomIn = () => setZoomPercent((prev) => Math.min(prev + 15, 150));
  const handleZoomOut = () => setZoomPercent((prev) => Math.max(prev - 15, 60));

  const totalPages = mockPagesData.length;
  const pageData = mockPagesData[currentPage - 1];

  const handleOpenSpotModal = (nodeId: string, text: string) => {
    setSelectedNodeId(nodeId);
    setSelectedNodeText(text);
    setIsSpotModalOpen(true);
  };

  const handleRegenerateSpotNode = async (nodeId: string, userInstructions: string) => {
    console.log(`[API POST /api/v1/documents/${docId}/spot-regenerate]`, {
      node_id: nodeId,
      user_instructions: userInstructions,
    });
    // Эмуляция задержки ответа API
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Toolbar Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white max-w-md truncate">{docTitle}</h3>
            <p className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>ГОСТ 7.32-2017 Сверифицирован • Эмуляция А4 (30/10/20/20 мм)</span>
            </p>
          </div>
        </div>

        {/* Page & Zoom Controls */}
        <div className="flex items-center space-x-4">
          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Уменьшить"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200 px-2 min-w-[50px] text-center">{zoomPercent}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Увеличить"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Page switcher */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-300">
              Стр. <strong className="text-white font-mono">{currentPage}</strong> из {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Download DOCX button */}
          <button
            onClick={onDownloadDocx || (() => alert("Идет компиляция и скачивание файла .docx по ГОСТу..."))}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/20 flex items-center space-x-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Скачать .DOCX</span>
          </button>
        </div>
      </div>

      {/* A4 Web DOCX Emulator Container */}
      <div className="overflow-x-auto py-8 flex justify-center bg-slate-950/60 rounded-3xl border border-slate-900">
        <div
          className="transition-transform duration-200 origin-top shadow-2xl"
          style={{ transform: `scale(${zoomPercent / 100})` }}
        >
          {/* A4 Sheet Dimensions: 210mm x 297mm (~794px x 1123px) */}
          <div
            className="bg-white text-black shadow-2xl relative select-text"
            style={{
              width: "794px",
              minHeight: "1123px",
              fontFamily: "'PT Serif', 'Times New Roman', serif",
              paddingLeft: "113px", // 30 mm left margin
              paddingRight: "38px",  // 10 mm right margin
              paddingTop: "75px",   // 20 mm top margin
              paddingBottom: "75px",// 20 mm bottom margin
              boxSizing: "border-box",
            }}
          >
            {/* Нумерация страниц ГОСТ */}
            {!pageData.isTitlePage && (
              <div className="absolute top-8 left-0 right-0 text-center text-sm font-serif text-slate-800">
                {pageData.pageNumber}
              </div>
            )}

            {/* Содержимое Страницы */}
            {pageData.isTitlePage ? (
              <div className="h-full flex flex-col justify-between text-center leading-tight py-4">
                <div className="space-y-2 uppercase text-xs tracking-tight font-serif font-bold">
                  <p>{pageData.institution}</p>
                  <p>{pageData.university}</p>
                  <p className="pt-2">{pageData.department}</p>
                </div>

                <div className="my-16 space-y-4">
                  <h1 className="text-xl font-bold uppercase tracking-widest">{pageData.type}</h1>
                  <p className="text-sm italic font-serif">{pageData.subject}</p>
                  <p className="text-base font-bold uppercase pt-4 px-4 leading-normal">
                    {pageData.title}
                  </p>
                </div>

                <div className="text-right text-xs font-serif space-y-2 pr-8 my-12">
                  <p>Выполнил студент: <span className="font-bold">{pageData.author}</span></p>
                  <p>Проверил руководитель: __________________</p>
                </div>

                <div className="text-center text-xs font-serif uppercase pt-8">
                  {pageData.cityYear}
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-justify text-[14pt] leading-[1.5]">
                {pageData.title && (
                  <h2 className="text-center font-bold text-[14pt] uppercase tracking-wide mb-6">
                    {pageData.title}
                  </h2>
                )}

                {pageData.content?.map((item: any, idx: number) => {
                  if (item.type === "toc_item") {
                    return (
                      <div key={idx} className="flex justify-between items-baseline text-sm font-serif border-b border-dotted border-slate-300 pb-1">
                        <span>{item.title}</span>
                        <span className="font-bold ml-2">{item.page}</span>
                      </div>
                    );
                  }

                  if (item.type === "subtitle") {
                    return (
                      <h3 key={idx} className="font-bold text-[14pt] mt-4 mb-2">
                        {item.text}
                      </h3>
                    );
                  }

                  if (item.type === "paragraph") {
                    return (
                      <div
                        key={idx}
                        onMouseEnter={() => setHoveredNodeId(item.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="relative group transition-all rounded p-1 border border-transparent hover:border-amber-400/40 hover:bg-amber-50/20"
                        style={{ textIndent: "1.25cm" }}
                      >
                        <p className="text-slate-900">{item.text}</p>

                        {/* Кнопка Точечной Перегенерации Spot Regeneration */}
                        {hoveredNodeId === item.id && (
                          <button
                            onClick={() => handleOpenSpotModal(item.id, item.text)}
                            className="absolute right-2 -top-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[10px] font-sans font-semibold flex items-center space-x-1 shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all z-20 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-200" />
                            <span>Перегенерировать абзац (1 Кредит)</span>
                          </button>
                        )}
                      </div>
                    );
                  }

                  if (item.type === "table") {
                    return (
                      <div key={idx} className="my-6 space-y-2">
                        <p className="text-left font-serif italic text-xs">{item.caption}</p>
                        <table className="w-full border-collapse border border-black text-xs font-serif text-center">
                          <thead>
                            <tr className="bg-slate-100">
                              {item.headers.map((h: string, hIdx: number) => (
                                <th key={hIdx} className="border border-black p-2 font-bold">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {item.rows.map((row: string[], rIdx: number) => (
                              <tr key={rIdx}>
                                {row.map((cell: string, cIdx: number) => (
                                  <td key={cIdx} className="border border-black p-2">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }

                  if (item.type === "formula") {
                    return (
                      <div key={idx} className="my-4 flex items-center justify-between text-sm font-serif">
                        <div className="flex-1 text-center font-mono italic">
                          {item.formula_text}
                        </div>
                        <div className="font-bold">
                          {item.formula_number}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spot Regeneration Modal */}
      <SpotRegenerationModal
        isOpen={isSpotModalOpen}
        onClose={() => setIsSpotModalOpen(false)}
        nodeId={selectedNodeId}
        currentText={selectedNodeText}
        onRegenerate={handleRegenerateSpotNode}
      />
    </div>
  );
};
