export interface WizardFormData {
  title: string;
  subject: string;
  docType: "coursework" | "abstract" | "vkr";
  pageCount: number;
  chapterCount: number;
  customPrompt?: string;
  attachedFile?: File | null;
}

export const initialWizardData: WizardFormData = {
  title: "",
  subject: "",
  docType: "coursework",
  pageCount: 30,
  chapterCount: 3,
  customPrompt: "",
  attachedFile: null,
};
