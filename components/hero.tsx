import Link from "next/link";

export function Hero() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="rounded-[28px] border border-black/10 bg-[#1f3a2f] p-6 text-stone-50 shadow-[0_30px_120px_rgba(24,42,35,0.28)] sm:rounded-[36px] sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-200/90 sm:text-xs sm:tracking-[0.38em]">
          Prelims Training Space
        </p>
        <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-5xl">
          Build exam stamina with sharp UPSC topic drills, revision logs, and AI-generated custom tests.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-stone-200/88 sm:mt-5 sm:text-base">
          Choose a subject set, attempt timed questions, or generate a new quiz with ChatGPT, Gemini, or Claude and import it directly into the app.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
          <Link
            href="/subjects"
            className="inline-flex w-full items-center justify-center rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-amber-200 sm:w-auto"
          >
            Start Practising
          </Link>
          <Link
            href="/studio"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
          >
            Open AI Studio
          </Link>
        </div>
      </div>
      <div className="grid gap-4">
        <div className="rounded-[30px] border border-black/10 bg-white/80 p-6 shadow-[0_18px_60px_rgba(127,95,33,0.12)]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">Today&apos;s Focus</p>
          <div className="mt-5 space-y-4">
            <div>
              <p className="text-3xl font-semibold text-slate-900">AI + UPSC</p>
              <p className="text-sm text-slate-600">Generate a topic-specific drill in minutes</p>
            </div>
            <div className="h-px bg-black/10" />
            <div>
              <p className="text-3xl font-semibold text-slate-900">Import JSON</p>
              <p className="text-sm text-slate-600">Validate and save model output for test-taking</p>
            </div>
          </div>
        </div>
        <div className="rounded-[30px] border border-black/10 bg-[#9f2f1f] p-6 text-stone-50 shadow-[0_18px_60px_rgba(159,47,31,0.18)]">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-100">Workflow</p>
          <p className="mt-4 text-2xl font-semibold">Prompt the model, paste JSON, validate, save, and attempt the quiz instantly.</p>
          <p className="mt-3 text-sm leading-6 text-orange-50/85">
            Custom quiz sets are stored locally first, then can be used just like the built-in tests.
          </p>
        </div>
      </div>
    </section>
  );
}
