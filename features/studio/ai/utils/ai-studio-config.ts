import type {
  GenerationModeMap,
  StudioProvider,
} from "@/features/studio/shared/types";

export const studioProviders: StudioProvider[] = ["ChatGPT", "Gemini", "Claude"];

export const aiModeLabels: GenerationModeMap = {
  "single-correct": "Single Correct",
  "statement-type": "Statement Type",
  "assertion-reason": "Assertion-Reason",
  "match-the-following": "Match the Following",
};

export const providerMeta: Record<
  StudioProvider,
  {
    keyLabel: string;
    keyHint: string;
    docsLabel: string;
    docsHref: string;
  }
> = {
  ChatGPT: {
    keyLabel: "OpenAI API Key",
    keyHint: "Paste an OpenAI API key that has access to the selected model.",
    docsLabel: "OpenAI API keys",
    docsHref: "https://platform.openai.com/api-keys",
  },
  Gemini: {
    keyLabel: "Gemini API Key",
    keyHint: "Paste a Google AI Studio or Gemini API key with model access.",
    docsLabel: "Gemini API keys",
    docsHref: "https://aistudio.google.com/app/apikey",
  },
  Claude: {
    keyLabel: "Anthropic API Key",
    keyHint: "Paste an Anthropic API key that can access the Messages API.",
    docsLabel: "Anthropic API keys",
    docsHref: "https://console.anthropic.com/settings/keys",
  },
};
