import { NextResponse } from "next/server";
import { buildAiPrompt, generationModes, parseGeneratedQuiz, type GenerationMode } from "@/lib/custom-quiz-schema";
import { buildAttachmentContext, extractAttachment, type ExtractedAttachment } from "@/lib/source-extract";

const PROVIDERS = ["ChatGPT", "Gemini", "Claude"] as const;
type Provider = (typeof PROVIDERS)[number];
export const runtime = "nodejs";

function isProvider(value: string): value is Provider {
  return PROVIDERS.includes(value as Provider);
}

function isGenerationMode(value: string): value is GenerationMode {
  return generationModes.includes(value as GenerationMode);
}

async function generateWithOpenAI(prompt: string, providedApiKey?: string) {
  const apiKey = providedApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OpenAI API key. Paste one in the studio or set OPENAI_API_KEY.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: prompt,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}.`);
  }

  const data = await response.json();
  return typeof data.output_text === "string"
    ? data.output_text
    : data.output
        ?.flatMap((item: { content?: Array<{ text?: string }> }) => item.content ?? [])
        .map((item: { text?: string }) => item.text ?? "")
        .join("\n") ?? "";
}

async function generateWithGemini(prompt: string, providedApiKey?: string) {
  const apiKey = providedApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Gemini API key. Paste one in the studio or set GEMINI_API_KEY.");
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}.`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("\n") ?? "";
}

async function generateWithClaude(prompt: string, providedApiKey?: string) {
  const apiKey = providedApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing Anthropic API key. Paste one in the studio or set ANTHROPIC_API_KEY.");
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude request failed with status ${response.status}.`);
  }

  const data = await response.json();
  return data.content?.map((item: { text?: string }) => item.text ?? "").join("\n") ?? "";
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    let provider: string | undefined;
    let userPrompt: string | undefined;
    let apiKey: string | undefined;
    let modes: GenerationMode[] = [];
    let attachments: ExtractedAttachment[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      provider = String(formData.get("provider") ?? "");
      userPrompt = String(formData.get("userPrompt") ?? "").trim();
      apiKey = String(formData.get("apiKey") ?? "").trim();
      const modesValue = String(formData.get("modes") ?? "[]");
      try {
        const parsedModes = JSON.parse(modesValue) as string[];
        modes = Array.isArray(parsedModes) ? parsedModes.filter(isGenerationMode) : [];
      } catch {
        modes = [];
      }

      const files = formData
        .getAll("files")
        .filter((entry): entry is File => entry instanceof File && entry.size > 0)
        .slice(0, 4);

      attachments = await Promise.all(files.map((file) => extractAttachment(file)));
    } else {
      const body = (await request.json()) as {
        provider?: string;
        userPrompt?: string;
        apiKey?: string;
        modes?: string[];
        attachments?: Array<{ name?: string; type?: string; size?: number; kind?: string }>;
      };
      provider = body.provider;
      userPrompt = body.userPrompt?.trim();
      apiKey = body.apiKey?.trim();
      modes = Array.isArray(body.modes) ? body.modes.filter(isGenerationMode) : [];
      attachments = Array.isArray(body.attachments) ? (body.attachments as ExtractedAttachment[]) : [];
    }

    if (!provider || !isProvider(provider)) {
      return NextResponse.json({ error: "Unsupported provider." }, { status: 400 });
    }

    if (!userPrompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    if (modes.length === 0) {
      return NextResponse.json({ error: "Select at least one question type." }, { status: 400 });
    }

    const attachmentContext = buildAttachmentContext(attachments);

    const compiledPrompt = buildAiPrompt(`${userPrompt}${attachmentContext}`, provider, { modes });
    const rawJson = await (provider === "ChatGPT"
      ? generateWithOpenAI(compiledPrompt, apiKey)
      : provider === "Gemini"
        ? generateWithGemini(compiledPrompt, apiKey)
        : generateWithClaude(compiledPrompt, apiKey));

    const cleanedJson = rawJson.replace(/^```json\s*/i, "").replace(/^```/, "").replace(/```$/m, "").trim();
    const quiz = parseGeneratedQuiz(cleanedJson);

    return NextResponse.json({ rawJson: cleanedJson, quiz });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
