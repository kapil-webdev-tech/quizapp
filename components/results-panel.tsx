"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import type { QuizSet } from "@/lib/quiz-types";
import { saveAttempt } from "@/lib/attempt-store";
import { evaluateQuiz, type StoredAttempt } from "@/lib/quiz";

export function ResultsPanel({
  quiz,
  answers,
  retakeHref,
}: {
  quiz: QuizSet;
  answers: Record<string, string>;
  retakeHref?: string;
}) {
  const result = useMemo(() => evaluateQuiz(quiz, answers), [answers, quiz]);
  const hasSavedRef = useRef(false);
  const answersQuery = useMemo(() => new URLSearchParams(answers).toString(), [answers]);

  useEffect(() => {
    if (hasSavedRef.current) {
      return;
    }

    const nextAttempt: StoredAttempt = {
      quizSlug: quiz.slug,
      completedAt: new Date().toISOString(),
      scorePercent: result.scorePercent,
      correct: result.correct,
      total: quiz.questions.length,
      category: quiz.category,
      title: quiz.title,
      answersQuery,
    };

    hasSavedRef.current = true;
    void saveAttempt(nextAttempt);
  }, [answersQuery, quiz, result.correct, result.scorePercent]);

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-black/10 bg-[#9f2f1f] p-5 text-stone-50 shadow-[0_20px_90px_rgba(159,47,31,0.24)] sm:rounded-[32px] sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-100 sm:text-xs sm:tracking-[0.3em]">Result Snapshot</p>
          <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{result.scorePercent}%</h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-orange-50/88">
            {result.correct} correct, {result.incorrect} incorrect, {result.unanswered} unanswered.
          </p>
          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <Link href={retakeHref ?? `/custom/${quiz.slug}`} className="inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 sm:w-auto">
              Retake Quiz
            </Link>
            <Link href="/revision" className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto">
              Open Revision Log
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-[24px] border border-black/10 bg-white/80 p-4 shadow-[0_16px_50px_rgba(114,83,26,0.1)] sm:rounded-[28px] sm:p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Accuracy</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{result.scorePercent}%</p>
          </div>
          <div className="rounded-[24px] border border-black/10 bg-white/80 p-4 shadow-[0_16px_50px_rgba(114,83,26,0.1)] sm:rounded-[28px] sm:p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Correct</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-700 sm:text-3xl">{result.correct}</p>
          </div>
          <div className="rounded-[24px] border border-black/10 bg-white/80 p-4 shadow-[0_16px_50px_rgba(114,83,26,0.1)] sm:rounded-[28px] sm:p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Need Review</p>
            <p className="mt-3 text-2xl font-semibold text-amber-700 sm:text-3xl">{result.incorrect + result.unanswered}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {result.review.map((item, index) => {
          const selectedText = item.options.find((option) => option.id === item.selected)?.text;
          const answerText = item.options.find((option) => option.id === item.answer)?.text;

          return (
            <article key={item.id} className="rounded-[24px] border border-black/10 bg-white/85 p-4 shadow-[0_14px_40px_rgba(101,73,27,0.08)] sm:rounded-[28px] sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Question {index + 1}</p>
                  <h2 className="mt-2 text-lg font-semibold leading-8 text-slate-900 sm:text-xl">{item.prompt}</h2>
                </div>
                <span className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${item.isCorrect ? "bg-emerald-100 text-emerald-900" : "bg-rose-100 text-rose-900"}`}>
                  {item.isCorrect ? "Correct" : "Review"}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Your Answer</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">{selectedText ?? "Not answered"}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Correct Answer</p>
                  <p className="mt-2 text-sm font-medium text-emerald-900">{answerText}</p>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">{item.explanation}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
