import Link from "next/link";
import type { QuizSet } from "@/lib/quiz-types";

export function QuizCard({ quiz }: { quiz: QuizSet }) {
  return (
    <article className="flex h-full flex-col rounded-[26px] border border-black/10 bg-white/85 p-5 shadow-[0_16px_60px_rgba(128,99,43,0.12)] sm:rounded-[30px] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700 sm:text-xs sm:tracking-[0.28em]">{quiz.category}</p>
          <h2 className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl">{quiz.title}</h2>
        </div>
        <div className="flex flex-col items-end gap-2">
          {quiz.isPublic ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
              Public
            </span>
          ) : null}
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
            {quiz.questions.length} Qs
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{quiz.description}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {quiz.focusAreas.map((area) => (
          <Link key={area} href={`/subjects?tag=${encodeURIComponent(area)}`} className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-stone-50">
            {area}
          </Link>
        ))}
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-600">
        <div className="rounded-2xl bg-stone-50 p-3">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Duration</dt>
          <dd className="mt-1 font-semibold text-slate-900">{quiz.durationMinutes} min</dd>
        </div>
        <div className="rounded-2xl bg-stone-50 p-3">
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-500">Attempts</dt>
          <dd className="mt-1 font-semibold text-slate-900">{quiz.attemptCount}</dd>
        </div>
      </dl>
      <Link
        href={`/custom/${quiz.slug}`}
        className="mt-6 inline-flex w-full items-center justify-center self-start rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 sm:w-fit"
      >
        Attempt Quiz
      </Link>
    </article>
  );
}
