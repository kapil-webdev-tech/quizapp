import { inferStructuredPromptType } from "@/lib/question-prompt-format";
import type { EditableQuestion, EditableQuiz } from "@/lib/custom-quiz-store";
import type { QuestionTemplateLabel, ValidationIssue } from "../types";

export const questionTemplateLabels: QuestionTemplateLabel[] = [
  "Single Correct",
  "Statement Type",
  "Assertion-Reason",
  "Match the Following",
];

export function getResponseErrorMessage(status: number, bodyText: string) {
  const trimmedText = bodyText.trim();
  if (status === 413) {
    return "Upload is too large for the deployed server. Compress the PDF or split it into smaller files, then try again.";
  }
  if (trimmedText) {
    return trimmedText;
  }
  return `Request failed with status ${status}.`;
}

export async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.toLowerCase().includes("application/json")) {
    return (await response.json()) as T;
  }

  const bodyText = await response.text();
  throw new Error(getResponseErrorMessage(response.status, bodyText));
}

export function inferQuestionType(
  question: EditableQuestion,
): QuestionTemplateLabel {
  const type = inferStructuredPromptType(question.prompt);

  if (type === "assertion-reason") {
    return "Assertion-Reason";
  }
  if (type === "match-the-following") {
    return "Match the Following";
  }
  if (type === "statement-type") {
    return "Statement Type";
  }
  return "Single Correct";
}

export function parseValidationIssue(message: string): ValidationIssue {
  const questionMatch = message.match(/^Question\s+(\d+):\s*(.*)$/i);
  if (questionMatch) {
    const questionIndex = Number(questionMatch[1]) - 1;
    const detail = questionMatch[2] ?? message;
    const normalizedDetail = detail.toLowerCase();

    if (normalizedDetail.includes("option")) {
      return { message, field: "options", questionIndex };
    }
    if (normalizedDetail.includes("answer")) {
      return { message, field: "answer", questionIndex };
    }
    if (normalizedDetail.includes("difficulty")) {
      return { message, field: "difficulty", questionIndex };
    }
    if (normalizedDetail.includes("topic")) {
      return { message, field: "topic", questionIndex };
    }
    if (normalizedDetail.includes("explanation")) {
      return { message, field: "explanation", questionIndex };
    }

    return { message, field: "prompt", questionIndex };
  }

  const normalizedMessage = message.toLowerCase();
  if (normalizedMessage.includes("quiz title")) {
    return { message, field: "title", questionIndex: null };
  }
  if (normalizedMessage.includes("quiz category")) {
    return { message, field: "category", questionIndex: null };
  }
  if (normalizedMessage.includes("description")) {
    return { message, field: "description", questionIndex: null };
  }
  if (normalizedMessage.includes("durationminutes")) {
    return { message, field: "durationMinutes", questionIndex: null };
  }
  if (normalizedMessage.includes("focusareas")) {
    return { message, field: "focusAreas", questionIndex: null };
  }
  if (normalizedMessage.includes("questions are required")) {
    return { message, field: "questions", questionIndex: null };
  }

  return { message, field: null, questionIndex: null };
}

export function getValidationClass(active: boolean, baseClass: string) {
  return active
    ? `${baseClass} border-amber-300 bg-amber-50/80 focus:border-amber-500`
    : baseClass;
}

export function createQuestionFromTemplate(
  template: QuestionTemplateLabel,
): EditableQuestion {
  if (template === "Statement Type") {
    return {
      prompt:
        "Consider the following statements about the Cabinet Mission Plan: 1. It proposed a three-tier federal structure. 2. It accepted the demand for a sovereign Pakistan. Which of the statements given above is/are correct?",
      options: ["1 only", "2 only", "Both 1 and 2", "Neither 1 nor 2"],
      answer: "a",
      explanation:
        "The plan proposed a federal arrangement, but it did not concede a sovereign Pakistan.",
      difficulty: "Moderate",
      topic: "Modern India",
      tags: ["Cabinet Mission Plan"],
    };
  }

  if (template === "Assertion-Reason") {
    return {
      prompt:
        "Assertion (A): The Finance Commission is constituted every five years. Reason (R): It recommends the distribution of tax revenues between the Union and the States. Select the correct answer using the code given below.",
      options: [
        "Both A and R are true and R is the correct explanation of A",
        "Both A and R are true but R is not the correct explanation of A",
        "A is true but R is false",
        "A is false but R is true",
      ],
      answer: "b",
      explanation:
        "Both statements are true, but the reason states one function of the Commission rather than explaining why it is constituted every five years.",
      difficulty: "Moderate",
      topic: "Polity",
      tags: ["Finance Commission"],
    };
  }

  if (template === "Match the Following") {
    return {
      prompt:
        "Match the following: Column A: A. Black soil B. Alluvial soil C. Laterite soil D. Arid soil Column B: 1. Cotton cultivation 2. Riverine plains 3. High rainfall leaching 4. Desert regions Select the correct answer using the code given below.",
      options: [
        "A-1, B-2, C-3, D-4",
        "A-2, B-1, C-4, D-3",
        "A-3, B-4, C-1, D-2",
        "A-4, B-3, C-2, D-1",
      ],
      answer: "a",
      explanation:
        "These are the standard UPSC-style soil associations in Indian geography.",
      difficulty: "Moderate",
      topic: "Geography",
      tags: ["Indian Soils"],
    };
  }

  return {
    prompt: "Which one of the following rivers does not originate in India?",
    options: ["Brahmaputra", "Godavari", "Mahanadi", "Narmada"],
    answer: "a",
    explanation: "The Brahmaputra originates in Tibet before entering India.",
    difficulty: "Easy",
    topic: "Geography",
    tags: ["Indian Rivers"],
  };
}

export function updateQuestion(
  editableQuiz: EditableQuiz,
  questionIndex: number,
  updater: (question: EditableQuestion) => EditableQuestion,
) {
  return {
    ...editableQuiz,
    questions: editableQuiz.questions.map((question, index) =>
      index === questionIndex ? updater(question) : question,
    ),
  };
}
