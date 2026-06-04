"use client";

import Link from "next/link";
import { QuizCard } from "@/components/quiz-card";
import { useAvailableQuizzes } from "@/lib/custom-quiz-store";

export function ServerQuizGrid() {
  const { quizzes, loaded, error } = useAvailableQuizzes();

  if (!loaded) {
    return (
      <div className="rounded-[30px] border border-black/10 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
        <p className="text-sm text-slate-500">Loading backend quiz sets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[30px] border border-dashed border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-sm text-rose-800">{error}</p>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="rounded-[30px] border border-dashed border-black/20 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          No Quiz Sets Yet
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">
          No public or private quiz sets are available yet.
        </h2>
        <Link
          href="/studio"
          className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Open AI Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.slug} quiz={quiz} />
      ))}
    </div>
  );
}
