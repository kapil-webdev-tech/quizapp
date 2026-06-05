import type { RecallCard, RecallSheet } from "./types";

export function normalizeRecallText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function createEmptyRecallCard(): RecallCard {
  return {
    id: crypto.randomUUID(),
    question: "",
    answer: "",
  };
}

export function createEmptyRecallCards(count: number) {
  return Array.from({ length: Math.max(1, count) }, createEmptyRecallCard);
}

export function generateRecallPrompt(
  subject: string,
  topic: string,
  questionCount: number,
) {
  return `You are a UPSC Prelims expert.

Create a HIGH-YIELD Active Recall Sheet for:

Subject: ${subject}
Topic: ${topic}

Generate exactly ${questionCount} high-yield recall questions.

Rules:
- Only include exam-relevant questions
- Focus on traps, acts, bodies, authority confusion
- Include at least 1 statement-based question
- Preserve useful numbering inside questions or answers when needed
- Answers must be crisp but may use multiple lines where revision clarity requires it
- No explanations outside the answer field

Return ONLY JSON:

{
  "topic": "${topic}",
  "questions": [
    {
      "question": "",
      "answer": ""
    }
  ]
}`;
}

export function parseRecallSheet(input: string) {
  const parsed = JSON.parse(input) as {
    topic?: unknown;
    questions?: unknown;
  };

  if (typeof parsed.topic !== "string") {
    throw new Error("JSON must include a topic string.");
  }

  const topic = normalizeRecallText(parsed.topic);
  if (!topic) {
    throw new Error("Topic cannot be empty.");
  }

  if (!Array.isArray(parsed.questions)) {
    throw new Error("JSON must include a questions array.");
  }

  if (parsed.questions.length === 0) {
    throw new Error("At least one question is required before editing.");
  }

  const questions = parsed.questions.map((item, index) => {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.question !== "string" ||
      typeof item.answer !== "string"
    ) {
      throw new Error(
        `Question ${index + 1} must include string values for question and answer.`,
      );
    }

    const question = normalizeRecallText(item.question);
    const answer = normalizeRecallText(item.answer);

    if (!question || !answer) {
      throw new Error(
        `Question ${index + 1} must include non-empty question and answer values.`,
      );
    }

    return {
      id: crypto.randomUUID(),
      question,
      answer,
    };
  });

  return {
    topic,
    questions,
  } satisfies RecallSheet;
}

export function cleanRecallSheetForPreview(sheet: RecallSheet) {
  const topic = normalizeRecallText(sheet.topic);
  const questions = sheet.questions
    .map((card) => ({
      id: card.id,
      question: normalizeRecallText(card.question),
      answer: normalizeRecallText(card.answer),
    }))
    .filter((card) => card.question && card.answer);

  if (!topic) {
    throw new Error("Enter a topic before preview.");
  }

  if (questions.length === 0) {
    throw new Error("Add at least one valid recall card before preview.");
  }

  return {
    topic,
    questions,
  } satisfies RecallSheet;
}

export function shuffleQuestions<T>(questions: T[]) {
  const next = [...questions];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex] as T;
    next[swapIndex] = current as T;
  }

  return next;
}
