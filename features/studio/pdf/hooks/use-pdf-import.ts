"use client";

import { useState } from "react";
import type { EditableQuiz } from "@/lib/custom-quiz-store";
import type { StudioSourcePreview } from "@/features/studio/shared/types";
import { readJsonResponse } from "@/features/studio/shared/utils/quiz-draft-utils";

export function usePdfImport() {
  const [pdfSkipPages, setPdfSkipPages] = useState(0);
  const [isPreviewingSource, setIsPreviewingSource] = useState(false);
  const [isImportingPdf, setIsImportingPdf] = useState(false);

  return {
    pdfSkipPages,
    setPdfSkipPages,
    isPreviewingSource,
    setIsPreviewingSource,
    isImportingPdf,
    setIsImportingPdf,
  };
}

export async function requestPdfSourcePreview({
  attachments,
  skipPages,
}: {
  attachments: Array<{ file: File; name: string }>;
  skipPages: number;
}) {
  const formData = new FormData();
  attachments.forEach((attachment) => {
    formData.append("files", attachment.file, attachment.name);
  });
  formData.append("skipPages", String(skipPages));

  const response = await fetch("/api/ai/preview-source", {
    method: "POST",
    body: formData,
  });
  const data = await readJsonResponse<{
    attachments?: StudioSourcePreview["attachments"];
    combinedText?: string;
    chunks?: string[];
    chunkCount?: number;
    error?: string;
  }>(response);

  if (
    !response.ok ||
    data.error ||
    !Array.isArray(data.attachments) ||
    typeof data.combinedText !== "string"
  ) {
    throw new Error(data.error || "Preview extraction failed.");
  }

  return {
    attachments: data.attachments,
    combinedText: data.combinedText,
    chunks: data.chunks || [],
    chunkCount: data.chunkCount || 0,
  };
}

export async function requestPdfQuizImport({
  attachment,
  skipPages,
}: {
  attachment: { file: File; name: string };
  skipPages: number;
}) {
  const formData = new FormData();
  formData.append("files", attachment.file, attachment.name);
  formData.append("skipPages", String(skipPages));

  const response = await fetch("/api/import-pdf-quiz", {
    method: "POST",
    body: formData,
  });
  const data = await readJsonResponse<{
    quiz?: EditableQuiz;
    examType?: "gs" | "csat";
    extractedQuestionCount?: number;
    warnings?: string[];
    error?: string;
  }>(response);

  if (!response.ok || data.error || !data.quiz) {
    throw new Error(data.error || "PDF import failed.");
  }

  return {
    ...data,
    quiz: data.quiz,
  };
}
