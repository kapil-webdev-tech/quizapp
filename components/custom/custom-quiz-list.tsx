"use client";

import Link from "next/link";
import { useState } from "react";
import {
  deleteCustomQuiz,
  updateCustomQuizVisibility,
  useCustomQuizzes,
} from "@/lib/custom-quiz-store";
import { useSupabaseSession } from "@/lib/supabase";

function FlagIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current"
      strokeWidth="2"
    >
      <path d="M6 21V4m0 0h10l-2 3 2 3H6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CustomQuizList() {
  const { quizzes, loaded, error, refresh } = useCustomQuizzes();
  const { session, loaded: sessionLoaded } = useSupabaseSession();
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [visibilityMenuSlug, setVisibilityMenuSlug] = useState<string | null>(null);

  async function handleDelete(slug: string) {
    try {
      setPendingSlug(slug);
      setActionError(null);
      setActionMessage(null);
      await deleteCustomQuiz(slug);
      await refresh();
      setActionMessage("Quiz set deleted from backend storage.");
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete quiz set.",
      );
    } finally {
      setPendingSlug(null);
    }
  }

  async function handleVisibilityChange(slug: string, isPublic: boolean) {
    try {
      setPendingSlug(slug);
      setVisibilityMenuSlug(null);
      setActionError(null);
      setActionMessage(null);
      await updateCustomQuizVisibility(slug, isPublic);
      await refresh();
      setActionMessage(isPublic ? "Quiz published publicly." : "Quiz moved back to private.");
    } catch (visibilityError) {
      setActionError(
        visibilityError instanceof Error
          ? visibilityError.message
          : "Unable to update quiz visibility.",
      );
    } finally {
      setPendingSlug(null);
    }
  }

  if (!sessionLoaded || !loaded) {
    return (
      <div className="rounded-[30px] border border-black/10 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
        <p className="text-sm text-slate-500">Loading saved custom quizzes...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[30px] border border-dashed border-black/20 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Sign In Required</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">Saved custom quizzes now live in the backend.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">Sign in to view, edit, and attempt the quizzes you created in the studio.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
          Sign In
        </Link>
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
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">No Custom Sets Yet</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">Generate your first quiz in the AI studio.</h2>
        <Link href="/studio" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
          Open AI Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionMessage ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {actionMessage}
        </p>
      ) : null}
      {actionError ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {actionError}
        </p>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {quizzes.map((quiz) => (
          <article key={quiz.slug} className="relative rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_14px_50px_rgba(108,78,26,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Custom Quiz</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{quiz.title}</h2>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setVisibilityMenuSlug(
                      visibilityMenuSlug === quiz.slug ? null : quiz.slug,
                    )
                  }
                  disabled={pendingSlug === quiz.slug}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                    quiz.isPublic
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-black/10 bg-white text-slate-700"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <FlagIcon />
                  {quiz.isPublic ? "Public" : "Private"}
                </button>
                {visibilityMenuSlug === quiz.slug ? (
                  <div className="absolute right-0 top-12 z-10 w-48 rounded-2xl border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
                    <button
                      type="button"
                      onClick={() => void handleVisibilityChange(quiz.slug, true)}
                      disabled={pendingSlug === quiz.slug || quiz.isPublic}
                      className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Publish publicly
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleVisibilityChange(quiz.slug, false)}
                      disabled={pendingSlug === quiz.slug || !quiz.isPublic}
                      className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Keep private
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{quiz.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {quiz.focusAreas.map((area) => (
                <span key={area} className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-slate-700">
                  {area}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/custom/${quiz.slug}`} className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                Attempt Quiz
              </Link>
              <Link href={`/studio/manual?edit=${encodeURIComponent(quiz.slug)}`} className="rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100">
                Edit Quiz
              </Link>
              <button type="button" disabled={pendingSlug === quiz.slug} onClick={() => void handleDelete(quiz.slug)} className="rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50">
                {pendingSlug === quiz.slug ? "Deleting..." : "Delete"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
