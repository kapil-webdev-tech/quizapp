"use client";

import { useMemo, useState } from "react";
import {
  buildAiPrompt,
  generationModes,
  parseGeneratedQuiz,
  quizToEditableQuiz,
  type GenerationMode,
} from "@/lib/custom-quiz-store";
import type {
  StudioProvider,
  StudioProviderKeys,
  StudioSourcePreview,
} from "@/features/studio/shared/types";
import { readJsonResponse } from "@/features/studio/shared/utils/quiz-draft-utils";

export function useAiGeneration() {
  const [provider, setProvider] = useState<StudioProvider>("ChatGPT");
  const [providerKeys, setProviderKeys] = useState<StudioProviderKeys>({
    ChatGPT: "",
    Gemini: "",
    Claude: "",
  });
  const [userPrompt, setUserPrompt] = useState("Generate a UPSC prelims quiz .");
  const [selectedModes, setSelectedModes] = useState<GenerationMode[]>([
    "single-correct",
    "statement-type",
  ]);
  const [generatedJson, setGeneratedJson] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewingSource, setIsPreviewingSource] = useState(false);

  const aiPrompt = useMemo(
    () => buildAiPrompt(userPrompt, provider, { modes: selectedModes }),
    [provider, selectedModes, userPrompt],
  );

  function updateProviderKey(value: string) {
    setProviderKeys((current) => ({ ...current, [provider]: value }));
  }

  function toggleGenerationMode(modeValue: GenerationMode) {
    setSelectedModes((current) => {
      if (current.includes(modeValue)) {
        return current.length === 1
          ? current
          : current.filter((item) => item !== modeValue);
      }
      return [...current, modeValue];
    });
  }

  return {
    provider,
    setProvider,
    providerKeys,
    setProviderKeys,
    currentProviderKey: providerKeys[provider],
    userPrompt,
    setUserPrompt,
    selectedModes,
    setSelectedModes,
    generatedJson,
    setGeneratedJson,
    isGenerating,
    setIsGenerating,
    isPreviewingSource,
    setIsPreviewingSource,
    aiPrompt,
    updateProviderKey,
    toggleGenerationMode,
    generationModes,
  };
}

export async function requestAiQuizGeneration({
  provider,
  userPrompt,
  apiKey,
  selectedModes,
  attachments,
}: {
  provider: StudioProvider;
  userPrompt: string;
  apiKey: string;
  selectedModes: GenerationMode[];
  attachments: Array<{ file: File; name: string }>;
}) {
  const formData = new FormData();
  formData.set("provider", provider);
  formData.set("userPrompt", userPrompt);
  formData.set("apiKey", apiKey);
  formData.set("modes", JSON.stringify(selectedModes));
  attachments.forEach((attachment) => {
    formData.append("files", attachment.file, attachment.name);
  });

  const response = await fetch("/api/ai/generate-quiz", {
    method: "POST",
    body: formData,
  });
  const data = await readJsonResponse<{ rawJson?: string; error?: string }>(
    response,
  );

  if (!response.ok || data.error || !data.rawJson) {
    throw new Error(data.error || "Generation failed.");
  }

  const quiz = parseGeneratedQuiz(data.rawJson);
  return {
    rawJson: data.rawJson,
    quiz,
    editableQuiz: quizToEditableQuiz(quiz),
  };
}

export async function requestSourcePreview({
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
