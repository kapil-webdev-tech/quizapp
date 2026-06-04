"use client";

import { useMemo } from "react";
import { useAvailableQuizzes } from "@/lib/custom-quiz-store";

function formatCount(value: number) {
  return String(value).padStart(2, "0");
}

export function StatsStrip() {
  const { quizzes, loaded } = useAvailableQuizzes();

  const stats = useMemo(() => {
    if (!loaded) {
      return [
        { label: "Question Sets", value: "00" },
        { label: "Question Count", value: "00" },
        { label: "Concept Tags", value: "00" },
      ];
    }

    const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);
    const totalConceptTags = new Set(quizzes.flatMap((quiz) => quiz.focusAreas)).size;

    return [
      { label: "Question Sets", value: formatCount(quizzes.length) },
      { label: "Question Count", value: formatCount(totalQuestions) },
      { label: "Concept Tags", value: formatCount(totalConceptTags) },
    ];
  }, [loaded, quizzes]);

  return (
    <section className="mt-6 grid gap-3 md:grid-cols-3 md:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-[24px] border border-black/10 bg-white/75 p-4 shadow-[0_14px_50px_rgba(101,74,26,0.08)] sm:rounded-[28px] sm:p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
          <p className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{stat.value}</p>
        </div>
      ))}
    </section>
  );
}
