"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { QuizSession } from "@/components/quiz-session";
import { useAvailableQuiz } from "@/lib/custom-quiz-store";
import { Switch } from "../ui/switch";

export function CustomQuizPlayer() {
  const params = useParams<{ slug: string }>();
  const { quiz, loaded, error } = useAvailableQuiz(params?.slug);
  const [attemptMode, setAttemptMode] = useState<"exam" | "practice">("exam");

  if (!params?.slug) {
    return (
      <div className="rounded-[30px] border border-black/10 bg-white/75 p-8 text-sm text-slate-500">
        Loading custom quiz...
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="rounded-[30px] border border-black/10 bg-white/75 p-8 text-sm text-slate-500">
        Loading custom quiz...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[30px] border border-dashed border-rose-200 bg-rose-50 p-8 text-sm text-rose-800">
        {error}
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="rounded-[30px] border border-dashed border-black/20 bg-white/75 p-8 text-sm text-slate-500">
        This custom quiz was not found in backend storage.
      </div>
    );
  }

  return (
    <>
      <section className="mb-6 rounded-[30px] border border-black/10 bg-white/75 p-6 shadow-[0_18px_80px_rgba(108,78,24,0.08)] sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          {/* LEFT CONTENT */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {quiz.category} • Custom
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              {quiz.title}
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              {quiz.description}
            </p>
          </div>

          {/* RIGHT PANEL */}
          <div className="w-full max-w-sm rounded-[24px] border border-black/10 bg-stone-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Attempt Mode
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {attemptMode === "exam"
                    ? "Timed full-quiz attempt."
                    : "Check each answer instantly while revising."}
                </p>
              </div>

              {/* SWITCH */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-600">
                  Quiz
                </span>

                <Switch
                  checked={attemptMode === "practice"}
                  onCheckedChange={(checked) =>
                    setAttemptMode(checked ? "practice" : "exam")
                  }
                  className="data-[state=checked]:bg-[#1f3a2f]"
                />

                <span className="text-sm font-semibold text-slate-600">
                  Practice
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <QuizSession
        key={`${quiz.slug}-${attemptMode}`}
        quiz={quiz}
        resultsBasePath="/custom-results"
        attemptMode={attemptMode}
      />
    </>
  );
}