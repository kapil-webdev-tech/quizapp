import type { QuizQuestion, QuizSet } from "@/lib/quiz-types";
import {
  formatQuestionPrompt,
  inferStructuredPromptType,
  parseMatchFollowingPrompt,
} from "@/lib/question-prompt-format";

export type EditableQuestion = {
  prompt: string;
  options: [string, string, string, string];
  answer: "a" | "b" | "c" | "d";
  explanation: string;
  difficulty: QuizQuestion["difficulty"];
  topic: string;
  tags: string[];
};

export type EditableQuiz = {
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  negativeMarking: string;
  focusAreas: string[];
  isPublic: boolean;
  questions: EditableQuestion[];
};

export const generationModes = ["single-correct", "statement-type", "assertion-reason", "match-the-following"] as const;
export type GenerationMode = (typeof generationModes)[number];

export type AiGenerationConfig = {
  questionCount?: number;
  modes: GenerationMode[];
};

type ParsedQuestion = {
  prompt: unknown;
  options: unknown;
  answer: unknown;
  explanation: unknown;
  difficulty: unknown;
  topic: unknown;
  tags?: unknown;
};

type ParsedQuiz = {
  title: unknown;
  category: unknown;
  description: unknown;
  durationMinutes: unknown;
  negativeMarking: unknown;
  focusAreas: unknown;
  questions: unknown;
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isDifficulty(value: string): value is QuizQuestion["difficulty"] {
  return ["Easy", "Moderate", "Hard"].includes(value);
}

function hasDuplicateOptions(options: string[]) {
  const normalized = options.map((option) => option.trim().toLowerCase());
  return new Set(normalized).size !== normalized.length;
}

function isSequentialLetterMarker(marker: string, index: number) {
  return marker.toUpperCase() === String.fromCharCode(65 + index);
}

function isSequentialNumberMarker(marker: string, index: number) {
  return marker === String(index + 1);
}

function looksLikeMatchCodeOption(option: string) {
  const normalized = option.toUpperCase().replace(/\s+/g, " ").trim();
  const pairMatches = normalized.match(/\b(?:[A-D]\s*-\s*\d+|\d+\s*-\s*[A-D])\b/g) ?? [];
  return pairMatches.length >= 2;
}

function validateStructuredQuestion(
  prompt: string,
  options: string[],
  index: number,
) {
  const type = inferStructuredPromptType(prompt);

  if (type === "statement-type") {
    const statementLines = formatQuestionPrompt(prompt).filter(
      (segment) =>
        /^(?:[1-9]|10|[१-९]|१०)\.\s/.test(segment) ||
        /^[IVX]+\.\s/.test(segment) ||
        /^(Statement|Stmt|कथन)\s*(?:[IVX]+|\d+)\s*:/.test(segment),
    );

    if (statementLines.length < 2) {
      throw new Error(
        `Question ${index + 1}: statement-type prompt must contain at least 2 clearly separated statements.`,
      );
    }

    return;
  }

  if (type === "assertion-reason") {
    const normalizedPrompt = prompt.toLowerCase();
    const hasAssertion = /(assertion|कथन)\s*\(?a\)?[:.]?/i.test(normalizedPrompt);
    const hasReason = /(reason|कारण)\s*\(?r\)?[:.]?/i.test(normalizedPrompt);

    if (!hasAssertion || !hasReason) {
      throw new Error(
        `Question ${index + 1}: assertion-reason prompt must include Assertion (A) and Reason (R) markers.`,
      );
    }

    return;
  }

  if (type !== "match-the-following") {
    return;
  }

  const parsedPrompt = parseMatchFollowingPrompt(prompt);
  if (!parsedPrompt) {
    throw new Error(
      `Question ${index + 1}: match-the-following prompt could not be parsed into two aligned lists.`,
    );
  }

  if (
    parsedPrompt.leftItems.length < 2 ||
    parsedPrompt.rightItems.length < 2 ||
    parsedPrompt.leftItems.length !== parsedPrompt.rightItems.length
  ) {
    throw new Error(
      `Question ${index + 1}: match-the-following prompt must contain equal non-empty List I and List II items.`,
    );
  }

  const invalidLeftMarker = parsedPrompt.leftItems.findIndex(
    (item, itemIndex) => !isSequentialLetterMarker(item.marker, itemIndex),
  );
  if (invalidLeftMarker !== -1) {
    throw new Error(
      `Question ${index + 1}: List I markers must be sequential A, B, C...`,
    );
  }

  const invalidRightMarker = parsedPrompt.rightItems.findIndex(
    (item, itemIndex) => !isSequentialNumberMarker(item.marker, itemIndex),
  );
  if (invalidRightMarker !== -1) {
    throw new Error(
      `Question ${index + 1}: List II markers must be sequential 1, 2, 3...`,
    );
  }

  if (options.some((option) => !looksLikeMatchCodeOption(option))) {
    throw new Error(
      `Question ${index + 1}: match-the-following options must be matching codes like 'A-1, B-2, C-3, D-4'.`,
    );
  }
}

function normalizeQuestion(question: ParsedQuestion, index: number): QuizQuestion {
  if (typeof question.prompt !== "string" || question.prompt.trim().length < 12) {
    throw new Error(`Question ${index + 1}: prompt is missing or too short.`);
  }

  if (!Array.isArray(question.options) || question.options.length !== 4) {
    throw new Error(`Question ${index + 1}: exactly 4 options are required.`);
  }

  const options = question.options.map((option, optionIndex) => {
    if (typeof option !== "string" || option.trim().length === 0) {
      throw new Error(`Question ${index + 1}: option ${optionIndex + 1} is invalid.`);
    }

    return {
      id: String.fromCharCode(97 + optionIndex),
      text: option.trim(),
    };
  });

  const normalizedOptionTexts = options.map((option) => option.text);
  if (hasDuplicateOptions(normalizedOptionTexts)) {
    throw new Error(`Question ${index + 1}: options must be distinct.`);
  }

  if (typeof question.answer !== "string") {
    throw new Error(`Question ${index + 1}: answer is missing.`);
  }

  const normalizedAnswer = question.answer.trim().toLowerCase();
  if (!["a", "b", "c", "d"].includes(normalizedAnswer)) {
    throw new Error(`Question ${index + 1}: answer must be one of a, b, c, d.`);
  }

  if (typeof question.explanation !== "string" || question.explanation.trim().length < 8) {
    throw new Error(`Question ${index + 1}: explanation is required.`);
  }

  if (typeof question.difficulty !== "string" || !isDifficulty(question.difficulty.trim())) {
    throw new Error(`Question ${index + 1}: difficulty must be Easy, Moderate, or Hard.`);
  }

  if (typeof question.topic !== "string" || question.topic.trim().length === 0) {
    throw new Error(`Question ${index + 1}: topic is required.`);
  }

  validateStructuredQuestion(question.prompt.trim(), normalizedOptionTexts, index);

  const tags = Array.isArray(question.tags)
    ? question.tags
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return {
    id: `custom-q-${index + 1}`,
    prompt: question.prompt.trim(),
    options,
    answer: normalizedAnswer,
    explanation: question.explanation.trim(),
    difficulty: question.difficulty.trim() as QuizQuestion["difficulty"],
    topic: question.topic.trim(),
    tags: Array.from(new Set(tags)),
  };
}

export function editableQuizToQuiz(editableQuiz: EditableQuiz): QuizSet {
  return parseGeneratedQuiz(JSON.stringify(editableQuiz));
}

export function quizToEditableQuiz(quiz: QuizSet): EditableQuiz {
  return {
    title: quiz.title,
    category: quiz.category,
    description: quiz.description,
    durationMinutes: quiz.durationMinutes,
    negativeMarking: quiz.negativeMarking,
    focusAreas: quiz.focusAreas,
    isPublic: quiz.isPublic ?? false,
    questions: quiz.questions.map((question) => ({
      prompt: question.prompt,
      options: [
        question.options[0]?.text ?? "",
        question.options[1]?.text ?? "",
        question.options[2]?.text ?? "",
        question.options[3]?.text ?? "",
      ],
      answer: question.answer as EditableQuestion["answer"],
      explanation: question.explanation,
      difficulty: question.difficulty,
      topic: question.topic,
      tags: question.tags ?? [],
    })),
  };
}

export function createBlankEditableQuiz(): EditableQuiz {
  return {
    title: "",
    category: "",
    description: "",
    durationMinutes: 15,
    negativeMarking: "0.66 per wrong answer",
    focusAreas: [],
    isPublic: false,
    questions: [
      {
        prompt: "",
        options: ["", "", "", ""],
        answer: "a",
        explanation: "",
        difficulty: "Moderate",
        topic: "",
        tags: [],
      },
    ],
  };
}

export function parseGeneratedQuiz(raw: string): QuizSet {
  let parsed: ParsedQuiz;

  try {
    parsed = JSON.parse(raw) as ParsedQuiz;
  } catch {
    throw new Error("The generated content is not valid JSON.");
  }

  if (typeof parsed.title !== "string" || parsed.title.trim().length < 4) {
    throw new Error("Quiz title is required.");
  }

  if (typeof parsed.category !== "string" || parsed.category.trim().length < 3) {
    throw new Error("Quiz category is required.");
  }

  if (typeof parsed.description !== "string" || parsed.description.trim().length < 12) {
    throw new Error("Quiz description is required.");
  }

  if (typeof parsed.durationMinutes !== "number" || parsed.durationMinutes < 5) {
    throw new Error("durationMinutes must be a number greater than or equal to 5.");
  }

  if (typeof parsed.negativeMarking !== "string" || parsed.negativeMarking.trim().length === 0) {
    throw new Error("negativeMarking is required.");
  }

  if (!Array.isArray(parsed.focusAreas) || parsed.focusAreas.length === 0) {
    throw new Error("focusAreas must be a non-empty array.");
  }

  const focusAreas = parsed.focusAreas.map((item, index) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      throw new Error(`focusAreas[${index}] must be a non-empty string.`);
    }

    return item.trim();
  });

  if (!Array.isArray(parsed.questions) || parsed.questions.length < 3) {
    throw new Error("At least 3 questions are required.");
  }

  const questions = parsed.questions.map((question, index) => normalizeQuestion(question as ParsedQuestion, index));
  const title = parsed.title.trim();
  const slugBase = slugify(title) || "custom-quiz";

  return {
    slug: `custom-${slugBase}`,
    title,
    category: parsed.category.trim(),
    description: parsed.description.trim(),
    durationMinutes: parsed.durationMinutes,
    totalMarks: questions.length * 2,
    negativeMarking: parsed.negativeMarking.trim(),
    attemptCount: "Custom set",
    focusAreas,
    isPublic: typeof (parsed as ParsedQuiz & { isPublic?: unknown }).isPublic === "boolean"
      ? ((parsed as ParsedQuiz & { isPublic?: boolean }).isPublic ?? false)
      : false,
    questions,
  };
}

export const AI_JSON_SHAPE = `{
  "title": "Modern India Statements Drill",
  "category": "History",
  "description": "A UPSC prelims set with statement-based and factual elimination questions.",
  "durationMinutes": 15,
  "negativeMarking": "0.66 per wrong answer",
  "focusAreas": ["Modern India", "Statement Questions", "Elimination"],
  "isPublic": false,
  "questions": [
    {
      "prompt": "Consider the following statements about the Swadeshi Movement:\\n1. It followed the partition of Bengal.\\n2. It encouraged indigenous enterprise.\\nWhich of the statements given above is/are correct?",
      "options": ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
      "answer": "c",
      "explanation": "The movement emerged after the partition of Bengal and promoted indigenous goods and enterprise.",
      "difficulty": "Moderate",
      "topic": "Modern India",
      "tags": ["Swadeshi Movement", "National Movement"]
    }
  ]
}`;

const generationModeInstructions: Record<GenerationMode, string> = {
  "single-correct": "Use direct single-correct UPSC prelims MCQs.",
  "statement-type":
    "Use statement-based questions with clearly separated statements and standard options like '1 only', '2 only', 'Both 1 and 2', or 'Neither 1 nor 2' when relevant.",
  "assertion-reason":
    "Use assertion-reason questions with Assertion (A) and Reason (R).",
  "match-the-following":
    "Use match-the-following questions with standard matching codes.",
};

export function buildAiPrompt(userPrompt: string, provider: string, config?: AiGenerationConfig) {
  const instruction = userPrompt.trim() || "Create a UPSC prelims practice set.";
  const questionCount =
    typeof config?.questionCount === "number"
      ? Math.max(3, Math.min(config.questionCount, 10))
      : null;
  const modes: GenerationMode[] = config?.modes?.length ? config.modes : ["single-correct", "statement-type"];
  const modeRules = modes.map((mode) => `- ${generationModeInstructions[mode]}`).join("\n");
  const countRule = questionCount ? `- Create exactly ${questionCount} questions.\n` : "";

  return `Role:
You generate UPSC prelims quiz JSON for ${provider}.

Task:
${instruction}

Output Format:
Return only valid JSON matching this exact schema:
${AI_JSON_SHAPE}

Rules:
- Output raw JSON only. No markdown. No extra text.
${countRule}- Use only these question formats:
${modeRules}
- If multiple formats are selected, distribute questions across them.
- Each question must have exactly 4 options.
- answer must be one of: a, b, c, d.
- difficulty must be Easy, Moderate, or Hard.
- Keep the set UPSC prelims oriented.
- Keep explanations concise and factual.
- focusAreas must be a short array of reusable search tags.
- Set isPublic to false unless the prompt explicitly asks for public publishing.
- title, category, description, focusAreas, and questions must match the requested topic.`;
}
