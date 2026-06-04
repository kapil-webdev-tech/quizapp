// studio-entry.types.ts

export type StudioPath = {
  type: "button" | "link";
  title: string;
  label: string;
  description: string;
  path: string;
  loginMessage?: string;
};

export const STUDIO_PATHS: StudioPath[] = [
  {
    type: "button",
    title: "Generate with AI",
    label: "AI Path",
    description:
      "Choose a model, set the API key, select question formats, set the count, then generate a draft.",
    path: "/studio/ai",
    loginMessage: "Please login to use Generate with AI.",
  },
  {
    type: "button",
    title: "Write Questions Yourself",
    label: "Manual Path",
    description:
      "Start from a structured template, then edit prompts, options, answers, and explanations in the builder.",
    path: "/studio/manual",
    loginMessage: "Please login to use Write Questions Yourself.",
  },
  {
    type: "button",
    title: "Import PDF Test",
    label: "PDF Path",
    description:
      "Upload a UPSC prelims paper PDF, preview the extracted text, then import the parsed questions into the same editor and preview flow.",
    path: "/studio/pdf",
  },
  {
    type: "link",
    title: "Generate Active Recall Sheets",
    label: "Recall Path",
    description:
      "Open a dedicated interface to build prompt-driven recall cards, preview flips, and publish sheets separately from quiz authoring.",
    path: "/studio/active-recall",
  },
] as const;
