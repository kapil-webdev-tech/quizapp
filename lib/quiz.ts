import type { QuizQuestion, QuizSet } from "@/lib/quiz-types";

export type QuizReviewItem = QuizQuestion & {
  selected: string | null;
  isCorrect: boolean;
};

export type QuizResult = {
  correct: number;
  incorrect: number;
  unanswered: number;
  scorePercent: number;
  review: QuizReviewItem[];
};

export type StoredAttempt = {
  quizSlug: string;
  completedAt: string;
  scorePercent: number;
  correct: number;
  total: number;
  category: string;
  title: string;
  answersQuery: string;
  synced?: boolean;
};

export function evaluateQuiz(quiz: QuizSet, answers: Record<string, string>): QuizResult {
  const review = quiz.questions.map((question) => {
    const selected = answers[question.id] ?? null;

    return {
      ...question,
      selected,
      isCorrect: selected === question.answer,
    };
  });

  const correct = review.filter((item) => item.isCorrect).length;
  const unanswered = review.filter((item) => item.selected === null).length;
  const incorrect = quiz.questions.length - correct - unanswered;
  const scorePercent = Math.round((correct / quiz.questions.length) * 100);

  return { correct, incorrect, unanswered, scorePercent, review };
}
