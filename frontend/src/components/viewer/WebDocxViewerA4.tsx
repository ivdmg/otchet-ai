import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Sliders
} from "lucide-react";
import { DocumentASTGraph } from "../../schemas/docAstSchema";
import { SpotRegenerationModal } from "../modals/SpotRegenerationModal";
import { triggerSuccessConfetti } from "../../lib/confetti";

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
  const [showMarginGuide, setShowMarginGuide] = useState<boolean>(false);

  const [isSpotModalOpen, setIsSpotModalOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeText, setSelectedNodeText] = useState<string>("");

  const handleZoomIn = () => setZoomPercent((prev) => Math.min(prev + 15, 150));
  const handleZoomOut = () => setZoomPercent((prev) => Math.max(prev - 15, 60));
  const resetZoom = () => setZoomPercent(100);

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      
      {/* Top Toolbar Bar */}
      <div className="dark-surface p-4 rounded-2xl border border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-20 z-40 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-zinc-100 max-w-md truncate">{docTitle}</h3>
            <p className="text-[11px] text-zinc-400 font-mono flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ГОСТ 7.32-2017 • Поля 30/15/20/20 мм</span>
            </p>
          </div>
        </div>

        {/* Page & Zoom Controls */}
        <div className="flex flex-wrap items-center space-x-2.5 gap-y-2">
          {/* Toggle Margin Lines Guide */}
          <button
            onClick={() => setShowMarginGuide(!showMarginGuide)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center space-x-1.5 transition-colors cursor-pointer ${
              showMarginGuide
                ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
            title="Показать / скрыть направляющие полей ГОСТ"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Сетка полей</span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Уменьшить"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="font-mono text-zinc-200 px-1.5 min-w-[40px] text-center hover:text-zinc-100 cursor-pointer text-xs"
              title="Сбросить масштаб"
            >
              {zoomPercent}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Увеличить"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Page switcher */}
          <div className="flex items-center space-x-1.5 bg-zinc-900 px-2.5 py-1.5 rounded-xl border border-zinc-800 text-xs">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-zinc-400 text-xs font-mono">
              Стр. <strong className="text-zinc-100">{currentPage}</strong> / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="p-1 text-zinc-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download DOCX button */}
          <button
            onClick={() => {
              triggerSuccessConfetti();
              if (onDownloadDocx) {
                onDownloadDocx();
              } else {
                alert("Компиляция и скачивание файла .docx по ГОСТу...");
              }
            }}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs transition-all shadow-sm hover:shadow-glow-cold flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Скачать .DOCX</span>
          </button>
        </div>
      </div>

      {/* A4 Web DOCX Physical Paper Emulator Container */}
      <div className="overflow-x-auto py-8 flex flex-col items-center justify-center bg-[#070709] rounded-2xl border border-zinc-900 shadow-inner min-h-[700px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, scale: (zoomPercent / 100) * 0.99 }}
            animate={{ opacity: 1, scale: zoomPercent / 100 }}
            exit={{ opacity: 0, scale: (zoomPercent / 100) * 0.99 }}
            transition={{ duration: 0.2 }}
            className="origin-top my-4"
          >
            {/* Physical Realistic A4 Sheet: 210mm x 297mm (~794px x 1123px) */}
            <div
              className="bg-[#FAFAFA] text-zinc-950 relative select-text transition-shadow duration-300 rounded-sm border border-zinc-300"
              style={{
                width: "794px",
                minHeight: "1123px",
                fontFamily: "'PT Serif', 'Times New Roman', serif",
                paddingLeft: "113px", // 30 mm left margin
                paddingRight: "38px",  // 10 mm right margin
                paddingTop: "75px",   // 20 mm top margin
                paddingBottom: "75px",// 20 mm bottom margin
                boxSizing: "border-box",
                boxShadow: "0 25px 65px -12px rgba(0, 0, 0, 0.7)",
              }}
            >
              {/* Optional Translucent ГОСТ Margin Guides */}
              {showMarginGuide && (
                <div className="absolute inset-0 pointer-events-none border-t border-b border-rose-500/30" style={{ margin: "75px 38px 75px 113px", outline: "1px dashed rgba(244, 63, 94, 0.4)" }}>
                  <div className="absolute top-2 left-2 text-[9px] font-mono text-rose-600 bg-rose-50 px-1 rounded border border-rose-200">Поля: Левое 30мм, Правое 10мм, Верх/Низ 20мм</div>
                </div>
              )}

              {/* Page Number GOST */}
              {!pageData.isTitlePage && (
                <div className="absolute top-8 right-10 text-right text-xs font-serif text-zinc-800 font-bold">
                  {pageData.pageNumber}
                </div>
              )}

              {/* Page Content */}
              {pageData.isTitlePage ? (
                <div className="h-full flex flex-col justify-between text-center leading-tight py-4">
                  <div className="space-y-2 uppercase text-xs tracking-tight font-serif font-bold text-zinc-800">
                    <p>{pageData.institution}</p>
                    <p>{pageData.university}</p>
                    <p className="pt-2">{pageData.department}</p>
                  </div>

                  <div className="my-16 space-y-4">
                    <h1 className="text-lg font-bold uppercase tracking-widest text-zinc-900 font-sans">{pageData.type}</h1>
                    <p className="text-xs italic font-serif text-zinc-700">{pageData.subject}</p>
                    <p className="text-base font-bold uppercase pt-4 px-4 leading-normal text-zinc-900 font-sans">
                      {pageData.title}
                    </p>
                  </div>

                  <div className="text-right text-xs font-serif space-y-2 pr-8 my-12 text-zinc-800">
                    <p>Выполнил студент: <span className="font-bold">{pageData.author}</span></p>
                    <p>Проверил руководитель: __________________</p>
                  </div>

                  <div className="text-center text-xs font-serif uppercase pt-8 text-zinc-600">
                    {pageData.cityYear}
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-justify text-[14pt] leading-[1.5] text-zinc-900">
                  {pageData.title && (
                    <h2 className="text-center font-bold text-[14pt] uppercase tracking-wide mb-6 font-sans">
                      {pageData.title}
                    </h2>
                  )}

                  {pageData.content?.map((item: any, idx: number) => {
                    if (item.type === "toc_item") {
                      return (
                        <div key={idx} className="flex justify-between items-baseline text-sm font-serif border-b border-dotted border-zinc-400 pb-1">
                          <span>{item.title}</span>
                          <span className="font-bold ml-2">{item.page}</span>
                        </div>
                      );
                    }

                    if (item.type === "subtitle") {
                      return (
                        <h3 key={idx} className="font-bold text-[14pt] mt-4 mb-2 font-sans">
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
                          className="relative group transition-all rounded p-1 border border-transparent hover:border-zinc-400/50 hover:bg-zinc-100/60"
                          style={{ textIndent: "1.25cm" }}
                        >
                          <p className="text-zinc-900">{item.text}</p>

                          {/* Spot Regeneration Micro-interaction Floating Button */}
                          <AnimatePresence>
                            {hoveredNodeId === item.id && (
                              <motion.button
                                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => handleOpenSpotModal(item.id, item.text)}
                                className="absolute right-2 -top-3 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-700 text-[11px] font-sans font-medium flex items-center space-x-1.5 shadow-lg transition-all z-20 cursor-pointer"
                              >
                                <Sparkles className="w-3 h-3 text-amber-300" />
                                <span>Перегенерировать абзац</span>
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    if (item.type === "table") {
                      return (
                        <div key={idx} className="my-6 space-y-2">
                          <p className="text-left font-serif italic text-xs text-zinc-700">{item.caption}</p>
                          <table className="w-full border-collapse border border-zinc-900 text-xs font-serif text-center">
                            <thead>
                              <tr className="bg-zinc-100">
                                {item.headers.map((h: string, hIdx: number) => (
                                  <th key={hIdx} className="border border-zinc-900 p-2 font-bold">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {item.rows.map((row: string[], rIdx: number) => (
                                <tr key={rIdx}>
                                  {row.map((cell: string, cIdx: number) => (
                                    <td key={cIdx} className="border border-zinc-900 p-2">{cell}</td>
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
                          <div className="flex-1 text-center font-mono italic text-zinc-900">
                            {item.formula_text}
                          </div>
                          <div className="font-bold font-sans text-xs">
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
          </motion.div>
        </AnimatePresence>

        {/* Page Thumbnail Slider Bar */}
        <div className="mt-6 flex items-center space-x-2 bg-zinc-900/90 p-2 rounded-xl border border-zinc-800 shadow-lg">
          {mockPagesData.map((p) => (
            <button
              key={p.pageNumber}
              onClick={() => setCurrentPage(p.pageNumber)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                currentPage === p.pageNumber
                  ? "bg-zinc-100 text-zinc-950 shadow-sm"
                  : "bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80"
              }`}
            >
              Стр. {p.pageNumber}
            </button>
          ))}
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

export default WebDocxViewerA4;
