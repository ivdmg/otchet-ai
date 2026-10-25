import { create } from "zustand";
import { DocumentASTGraph, OutlineAST } from "../schemas/docAstSchema";
import { WizardFormData, initialWizardData } from "../components/wizard/types";

export interface LogEntry {
  id: string;
  timestamp: string;
  step: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface DocumentState {
  wizardStep: number;
  wizardData: WizardFormData;
  currentDocId: string | null;
  outlineAst: OutlineAST | null;
  documentAstGraph: DocumentASTGraph | null;
  generationProgress: number;
  generationStatus: "idle" | "processing" | "completed" | "failed";
  logs: LogEntry[];

  setWizardStep: (step: number) => void;
  updateWizardData: (patch: Partial<WizardFormData>) => void;
  resetWizard: () => void;
  setOutlineAst: (outline: OutlineAST) => void;
  setDocumentAstGraph: (graph: DocumentASTGraph) => void;
  startGeneration: (docId: string) => void;
  addLog: (message: string, step?: string, type?: LogEntry["type"]) => void;
  updateProgress: (percent: number, status?: DocumentState["generationStatus"]) => void;
  resetGeneration: () => void;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  wizardStep: 1,
  wizardData: initialWizardData,
  currentDocId: null,
  outlineAst: null,
  documentAstGraph: null,
  generationProgress: 0,
  generationStatus: "idle",
  logs: [],

  setWizardStep: (step) => set({ wizardStep: step }),

  updateWizardData: (patch) =>
    set((state) => ({
      wizardData: { ...state.wizardData, ...patch },
    })),

  resetWizard: () =>
    set({
      wizardStep: 1,
      wizardData: initialWizardData,
      outlineAst: null,
      documentAstGraph: null,
      generationProgress: 0,
      generationStatus: "idle",
      logs: [],
    }),

  setOutlineAst: (outline) => set({ outlineAst: outline }),

  setDocumentAstGraph: (graph) => set({ documentAstGraph: graph }),

  startGeneration: (docId) => {
    set({
      currentDocId: docId,
      generationStatus: "processing",
      generationProgress: 0,
      logs: [],
    });
  },

  addLog: (message, step = "SYSTEM", type = "info") => {
    const timeStr = new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    set((state) => ({
      logs: [
        ...state.logs,
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: timeStr,
          step,
          message,
          type,
        },
      ],
    }));
  },

  updateProgress: (percent, status) => {
    set((state) => ({
      generationProgress: percent,
      generationStatus: status || state.generationStatus,
    }));
  },

  resetGeneration: () =>
    set({
      generationProgress: 0,
      generationStatus: "idle",
      logs: [],
    }),
}));
