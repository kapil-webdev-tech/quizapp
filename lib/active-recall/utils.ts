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
  microTopic: string,
  questionCount: number,
  profilePrompt: string
) {
  return `
You are an expert educator, senior exam paper setter, previous-year-question (PYQ) analyst, and memory learning specialist.

You will receive study material from the user.

Your responsibility is NOT to summarize it.

Instead, carefully analyze the provided content and convert it into HIGH-YIELD Active Recall revision cards that maximize long-term retention and exam performance.

## Exam Profile

${profilePrompt}

## Subject

${subject}

## Topic

${topic}

## Micro Topic

${microTopic}

## Instructions

The user will provide study material after this prompt.

Generate exactly ${questionCount} unique Active Recall questions ONLY from the provided material.

Do NOT introduce information that is not supported by the provided content.

However, use your expertise as an examiner to decide:

• Which concepts are most important.
• Which facts are most likely to appear in examinations.
• Which information is commonly asked in Previous Year Questions (PYQs).
• Which concepts students usually forget.
• Which facts are commonly confused.
• Which concepts deserve multiple recall questions.

Prioritize high-yield concepts over low-value details.

## Question Design

Convert the material into recall questions instead of summaries.

Generate different question styles whenever appropriate:

• What
• Why
• How
• Difference Between
• Compare
• List
• Sequence
• Match
• Statement Based
• True/False Recall
• Fill the Missing Concept
• Process Based
• Example Based

Whenever present in the material, create questions for:

• Definitions
• Concepts
• Processes
• Formulae
• Examples
• Classifications
• Advantages
• Disadvantages
• Causes
• Effects
• Applications
• Exceptions
• Limitations
• Articles
• Acts
• Committees
• Reports
• Government Schemes
• Constitutional Bodies
• Important Years
• Important Dates
• Important Personalities
• Abbreviations
• Full Forms
• Tables
• Flowcharts
• Diagrams (convert into text-based recall)
• Comparisons

## Quality Rules

• One concept per question.
• Avoid duplicate or overlapping questions.
• Break long explanations into multiple recall cards.
• Cover the entire provided content.
• Include small but exam-important facts.
• Prioritize PYQ-oriented information.
• Preserve numbering wherever useful.
• Answers should be crisp, self-contained, and revision-friendly.
• Use bullet points inside answers whenever helpful.
• Do not explain beyond what is present in the provided material.
• Do not mention information that is missing from the notes.
• Do not write markdown.
• Return ONLY valid JSON.

Expected Output:

{
  "topic": "${microTopic || topic}",
  "questions": [
    {
      "question": "",
      "answer": ""
    }
  ]
}
`;
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
