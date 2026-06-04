"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadAttempts } from "@/lib/attempt-store";
import type { StoredAttempt } from "@/lib/quiz";
import { useSupabaseSession } from "@/lib/supabase";

const attemptDateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

export function RevisionLog() {
  const [attempts, setAttempts] = useState<StoredAttempt[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { session, loaded: sessionLoaded } = useSupabaseSession();

  useEffect(() => {
    if (!sessionLoaded || !session) {
      return;
    }

    let active = true;

    void loadAttempts().then((data) => {
      if (!active) {
        return;
      }

      setAttempts(data);
      setLoaded(true);
    });

    return () => {
      active = false;
    };
  }, [session, sessionLoaded]);

  if (!sessionLoaded) {
    return (
      <div className="rounded-[24px] border border-black/10 bg-white/70 p-6 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)] sm:rounded-[30px] sm:p-8">
        <p className="text-sm text-slate-500">Loading recent attempts...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[24px] border border-dashed border-black/20 bg-white/70 p-6 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)] sm:rounded-[30px] sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 sm:text-xs sm:tracking-[0.28em]">Sign In Required</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">Revision history is stored in the backend now.</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Sign in to keep attempts off local storage and available across devices.</p>
        <Link href="/login" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto">
          Sign In
        </Link>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="rounded-[24px] border border-black/10 bg-white/70 p-6 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)] sm:rounded-[30px] sm:p-8">
        <p className="text-sm text-slate-500">Loading recent attempts...</p>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-black/20 bg-white/70 p-6 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)] sm:rounded-[30px] sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 sm:text-xs sm:tracking-[0.28em]">No Attempts Yet</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">Attempt a quiz to unlock your revision trail.</h2>
        <Link href="/subjects" className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 sm:w-auto">
          Browse Subjects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attempts.map((attempt) => (
        <article key={`${attempt.quizSlug}-${attempt.completedAt}`} className="flex flex-col gap-4 rounded-[24px] border border-black/10 bg-white/85 p-4 shadow-[0_14px_50px_rgba(108,78,26,0.08)] sm:gap-5 sm:rounded-[28px] sm:p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">{attempt.category}</p>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900">
                Synced
              </span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">{attempt.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Completed {attemptDateFormatter.format(new Date(attempt.completedAt))}
            </p>
          </div>
          <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
            <div className="rounded-2xl bg-stone-50 px-4 py-3 text-sm text-slate-600">
              {attempt.correct}/{attempt.total} correct
            </div>
            <div className="rounded-2xl bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950">
              {attempt.scorePercent}%
            </div>
            <Link href={`/results/${attempt.quizSlug}?${attempt.answersQuery}`} className="inline-flex w-full items-center justify-center rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-stone-100 sm:w-auto">
              Open Results Page
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
