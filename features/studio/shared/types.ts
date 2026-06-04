import type { ChangeEvent } from "react";
import type {
  EditableQuestion,
  EditableQuiz,
  GenerationMode,
  StudioDraftMode,
} from "@/lib/custom-quiz-store";
import type { QuizSet } from "@/lib/quiz-types";

export type StudioFlow = StudioDraftMode;
export type StudioView = "setup" | "editor" | "preview";

export type QuestionTemplateLabel =
  | "Single Correct"
  | "Statement Type"
  | "Assertion-Reason"
  | "Match the Following";

export type ValidationIssue = {
  message: string;
  field:
    | "title"
    | "category"
    | "description"
    | "durationMinutes"
    | "focusAreas"
    | "questions"
    | "prompt"
    | "options"
    | "answer"
    | "explanation"
    | "difficulty"
    | "topic"
    | null;
  questionIndex: number | null;
};

export type QuestionDraftActions = {
  addFocusAreaTag: (rawValue: string) => void;
  removeFocusAreaTag: (
    tag: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  appendQuestion: (template: QuestionTemplateLabel) => void;
  addQuestionTags: (questionIndex: number, rawValue: string) => void;
  removeQuestionTag: (
    questionIndex: number,
    tag: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => void;
  removeQuestion: (questionIndex: number) => void;
  updateQuestion: (
    questionIndex: number,
    updater: (question: EditableQuestion) => EditableQuestion,
  ) => void;
};

export type BulkImportHandlers = {
  openBulkTool: (mode: "answers" | "solutions") => void;
  handleAnswerKeyFileImport: (event: ChangeEvent<HTMLInputElement>) => void;
  handleSolutionsFileImport: (event: ChangeEvent<HTMLInputElement>) => void;
};

export type PreviewState = {
  quiz: QuizSet | null;
  issue: ValidationIssue | null;
};

export type WorkspaceDraft = {
  editorQuiz: EditableQuiz | null;
  setEditorQuiz: React.Dispatch<React.SetStateAction<EditableQuiz | null>>;
  editingSlug: string | null;
  editIntent: "update" | "add" | null;
  setEditIntent: React.Dispatch<React.SetStateAction<"update" | "add" | null>>;
};

export type StudioProvider = "ChatGPT" | "Gemini" | "Claude";
export type StudioProviderKeys = Record<StudioProvider, string>;
export type StudioAttachmentDraft = {
  id: string;
  name: string;
  size: number;
  type: string;
  kind: "image" | "pdf" | "text";
  previewUrl?: string;
  file: File;
};

export type StudioSourcePreview = {
  attachments: Array<{
    name: string;
    kind: string;
    size: number;
    extractor: string;
    status: string;
    warning: string;
    text: string;
    pages: Array<{
      pageNumber: number;
      text: string;
    }>;
  }>;
  combinedText: string;
  chunks: string[];
  chunkCount: number;
};

export type GenerationModeMap = Record<GenerationMode, QuestionTemplateLabel>;
