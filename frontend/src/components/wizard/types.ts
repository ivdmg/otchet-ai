export type DocType = "coursework" | "abstract" | "vkr";

export interface WizardFormData {
  docType: DocType;
  title: string;
  subject: string;
  pageCount: number;
  chapterCount: number;
  customPrompt?: string;
  guideFile?: File | null;
  authorName?: string;
  institution?: string;
  city?: string;
  year?: number;
}

export const initialWizardData: WizardFormData = {
  docType: "coursework",
  title: "",
  subject: "",
  pageCount: 25,
  chapterCount: 3,
  customPrompt: "",
  guideFile: null,
};

