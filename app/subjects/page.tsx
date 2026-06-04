import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { SubjectsBrowser } from "@/components/subjects-browser";

export default function SubjectsPage() {
  return (
    <AppShell>
      <section className="rounded-[24px] border border-black/10 bg-white/70 p-5 shadow-[0_20px_90px_rgba(115,84,24,0.08)] sm:rounded-[34px] sm:p-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700 sm:text-xs sm:tracking-[0.3em]">
          Subject Bank
        </p>

        <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
          Pick the subject where you need sharper recall and cleaner elimination.
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Explore quizzes by subject, practice important topics, and strengthen your accuracy with targeted question sets.
        </p>

        <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap">
          <div className="rounded-full bg-slate-900 px-4 py-2 font-semibold text-white">
            Curated quiz sets
          </div>
          <div className="rounded-full bg-stone-100 px-4 py-2 font-semibold text-slate-800">
            Topic-wise practice
          </div>
          <div className="rounded-full bg-stone-100 px-4 py-2 font-semibold text-slate-800">
            Instant start
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section className="mt-8 rounded-[30px] border border-black/10 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
            <p className="text-sm text-slate-500">
              Loading subjects...
            </p>
          </section>
        }
      >
        <SubjectsBrowser />
      </Suspense>
    </AppShell>
  );
}