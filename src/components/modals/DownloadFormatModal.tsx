import React, { useState } from "react";
import { X, FileText, Download, Check, ExternalLink, Sparkles } from "lucide-react";
import { exportGostDocx } from "../../lib/docxExport";
import { openPdfInBrowser } from "../../lib/pdfExport";

interface DownloadFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  docTitle: string;
  docType?: string;
  authorName?: string;
  institution?: string;
}

export const DownloadFormatModal: React.FC<DownloadFormatModalProps> = ({
  isOpen,
  onClose,
  docTitle,
  docType = "coursework",
  authorName = "Иванов И. И.",
  institution,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<"docx" | "pdf">("docx");
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      if (selectedFormat === "docx") {
        await exportGostDocx({
          title: docTitle,
          docType,
          authorName,
          institution,
        });
      } else {
        openPdfInBrowser({
          title: docTitle,
          docType,
          authorName,
          university: institution,
        });
      }
    } finally {
      setIsDownloading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#0c0c10] border border-white/15 p-6 space-y-5 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Выберите формат выгрузки</h3>
            <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate max-w-xs">
              {docTitle || "Документ ГОСТ"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2 Format Options */}
        <div className="space-y-3">
          {/* DOCX Card */}
          <div
            onClick={() => setSelectedFormat("docx")}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
              selectedFormat === "docx"
                ? "border-blue-500/80 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                : "border-white/[0.08] bg-transparent hover:border-white/20"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
              selectedFormat === "docx" ? "bg-blue-600 text-white" : "bg-zinc-900 border border-white/10 text-zinc-400"
            }`}>
              DOCX
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Microsoft Word (.docx)</span>
                {selectedFormat === "docx" && <Check className="w-3.5 h-3.5 text-blue-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Редактируемый чистовой файл по ГОСТ 7.32-2017. Поля 30/10/20/20 мм, TNR 14pt, 1.5 интервал.
              </p>
            </div>
          </div>

          {/* PDF Card */}
          <div
            onClick={() => setSelectedFormat("pdf")}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
              selectedFormat === "pdf"
                ? "border-rose-500/80 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                : "border-white/[0.08] bg-transparent hover:border-white/20"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
              selectedFormat === "pdf" ? "bg-rose-600 text-white" : "bg-zinc-900 border border-white/10 text-zinc-400"
            }`}>
              PDF
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Adobe Acrobat (.pdf)</span>
                {selectedFormat === "pdf" && <Check className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">
                Фиксированная типографская верстка для прямой печати и отправки преподавателю.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-transparent hover:bg-white/5 border border-white/[0.08] text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Отмена
          </button>
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{selectedFormat === "docx" ? "Скачать .DOCX" : "Открыть / Скачать PDF"}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
