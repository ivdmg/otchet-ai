import { z } from 'zod';

export const nodeTypeSchema = z.enum([
  'paragraph',
  'table',
  'list',
  'formula',
  'footnote'
]);
export type NodeType = z.infer<typeof nodeTypeSchema>;

export const listTypeSchema = z.enum(['bullet', 'numeric']);
export type ListType = z.infer<typeof listTypeSchema>;

export const sourceTypeSchema = z.enum(['monograph', 'article', 'law', 'web']);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export const astNodeSchema = z.object({
  id: z.string(),
  type: nodeTypeSchema,
  text: z.string().optional(),
  caption: z.string().optional(),
  headers: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).optional(),
  list_items: z.array(z.string()).optional(),
  list_type: listTypeSchema.optional(),
  footnote_text: z.string().optional(),
  formula_text: z.string().optional(),
  formula_number: z.string().optional(),
});
export type AstNode = z.infer<typeof astNodeSchema>;

export const sectionAstSchema = z.object({
  section_title: z.string().optional(),
  title: z.string().optional(),
  nodes: z.array(astNodeSchema).default([]),
});
export type SectionAST = z.infer<typeof sectionAstSchema>;

export const chapterAstSchema = z.object({
  title: z.string(),
  sections: z.array(sectionAstSchema).default([]),
});
export type ChapterAST = z.infer<typeof chapterAstSchema>;

export const outlineSectionItemSchema = z.object({
  title: z.string(),
  target_paragraphs: z.number().int(),
  include_table: z.boolean().default(false),
});
export type OutlineSectionItem = z.infer<typeof outlineSectionItemSchema>;

export const outlineChapterItemSchema = z.object({
  title: z.string(),
  sections: z.array(outlineSectionItemSchema),
});
export type OutlineChapterItem = z.infer<typeof outlineChapterItemSchema>;

export const outlineAstSchema = z.object({
  doc_type: z.enum(['coursework', 'abstract', 'vkr']),
  title: z.string(),
  chapters: z.array(outlineChapterItemSchema),
});
export type OutlineAST = z.infer<typeof outlineAstSchema>;

export const introductionAstSchema = z.object({
  type: z.literal('INTRODUCTION').default('INTRODUCTION'),
  title: z.string().default('Введение'),
  relevance_paragraphs: z.array(z.string()),
  object: z.string(),
  subject: z.string(),
  goal: z.string(),
  tasks: z.array(z.string()),
  methods: z.array(z.string()),
});
export type IntroductionAST = z.infer<typeof introductionAstSchema>;

export const taskResultItemSchema = z.object({
  task_name: z.string(),
  finding_text: z.string(),
});
export type TaskResultItem = z.infer<typeof taskResultItemSchema>;

export const conclusionAstSchema = z.object({
  type: z.literal('CONCLUSION').default('CONCLUSION'),
  title: z.string().default('Заключение'),
  task_results: z.array(taskResultItemSchema),
  final_summary_paragraphs: z.array(z.string()),
});
export type ConclusionAST = z.infer<typeof conclusionAstSchema>;

export const bibliographyItemSchema = z.object({
  id: z.string(),
  authors: z.array(z.string()),
  title: z.string(),
  source_type: sourceTypeSchema,
  publisher_or_journal: z.string().optional(),
  year: z.number().int(),
  pages_or_url: z.string().optional(),
});
export type BibliographyItem = z.infer<typeof bibliographyItemSchema>;

export const bibliographyAstSchema = z.object({
  type: z.literal('BIBLIOGRAPHY').default('BIBLIOGRAPHY'),
  title: z.string().default('Список использованных источников'),
  items: z.array(bibliographyItemSchema),
});
export type BibliographyAST = z.infer<typeof bibliographyAstSchema>;

export const documentAstGraphSchema = z.object({
  version: z.string().default('1.0.0'),
  doc_type: z.string().default('coursework'),
  title: z.string(),
  author_name: z.string().optional(),
  institution: z.string().optional(),
  city: z.string().optional(),
  year: z.number().int().optional(),
  introduction: introductionAstSchema.optional(),
  chapters: z.array(chapterAstSchema).default([]),
  conclusion: conclusionAstSchema.optional(),
  bibliography: bibliographyAstSchema.optional(),
  appendices: z.array(z.record(z.any())).optional(),
});
export type DocumentASTGraph = z.infer<typeof documentAstGraphSchema>;
