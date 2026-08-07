export type DocType = "coursework" | "abstract" | "vkr";

export interface WizardFormData {
  docType: DocType;
  title: string;
  subject: string;
  authorName?: string;
  institution?: string;
  city?: string;
  year?: number;
  guideFile?: File | null;
  chapterCount: number;
}

export const initialWizardData: WizardFormData = {
  docType: "coursework",
  title: "",
  subject: "",
  authorName: "",
  institution: "",
  city: "Москва",
  year: new Date().getFullYear(),
  guideFile: null,
  chapterCount: 3,
};
