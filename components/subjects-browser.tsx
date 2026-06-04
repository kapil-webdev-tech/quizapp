"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QuizCard } from "@/components/quiz-card";
import { useAvailableQuizzes } from "@/lib/custom-quiz-store";

const allDifficulties = ["All", "Easy", "Moderate", "Hard"] as const;

function getQuizDifficulty(
  quiz: Awaited<ReturnType<typeof useAvailableQuizzes>>["quizzes"][number],
) {
  if (quiz.questions.some((question) => question.difficulty === "Hard")) {
    return "Hard";
  }

  if (quiz.questions.some((question) => question.difficulty === "Moderate")) {
    return "Moderate";
  }

  return "Easy";
}

export function SubjectsBrowser() {
  const { quizzes, loaded, error } = useAvailableQuizzes();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] =
    useState<(typeof allDifficulties)[number]>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const tagParam = searchParams.get("tag")?.trim() ?? "";
  const effectiveQuery = query.trim().length > 0 ? query : tagParam;

  const allCategories = useMemo(
    () => ["All", ...new Set(quizzes.map((quiz) => quiz.category))],
    [quizzes],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = effectiveQuery.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        quiz.title.toLowerCase().includes(normalizedQuery) ||
        quiz.category.toLowerCase().includes(normalizedQuery) ||
        quiz.focusAreas.some((area) =>
          area.toLowerCase().includes(normalizedQuery),
        ) ||
        quiz.questions.some((question) =>
          question.topic.toLowerCase().includes(normalizedQuery),
        );

      const matchesCategory = category === "All" || quiz.category === category;
      const quizDifficulty = getQuizDifficulty(quiz);
      const matchesDifficulty =
        difficulty === "All" || quizDifficulty === difficulty;

      return matchesQuery && matchesCategory && matchesDifficulty;
    });
  }, [category, difficulty, effectiveQuery, quizzes]);

  if (!loaded) {
    return (
      <section className="mt-8 rounded-[30px] border border-black/10 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
        <p className="text-sm text-slate-500">Loading backend quiz catalog...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-8 rounded-[30px] border border-dashed border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-sm text-rose-800">{error}</p>
      </section>
    );
  }

  return (
    <>
      <section className="mt-6 rounded-[24px] border border-black/10 bg-white/80 p-4 shadow-[0_18px_70px_rgba(102,73,24,0.08)] sm:mt-8 sm:rounded-[34px] sm:p-7">
        <div className="flex items-center justify-between gap-3 sm:hidden">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Filters
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {filtered.length} sets available
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-stone-50 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
          >
            Open
          </button>
        </div>

        <div className="hidden gap-4 sm:grid lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <label className="block sm:col-span-1">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Search
            </span>
            <input
              type="text"
              value={query || tagParam}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by topic, title, or focus tag"
              className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Category
            </span>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            >
              {allCategories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Difficulty
            </span>
            <select
              value={difficulty}
              onChange={(event) =>
                setDifficulty(
                  event.target.value as (typeof allDifficulties)[number],
                )
              }
              className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            >
              {allDifficulties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-col items-start gap-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <span className="rounded-full bg-amber-100 px-4 py-2 font-semibold text-amber-950">
            {filtered.length} sets found
          </span>
          <span>{quizzes.length} total backend sets available</span>
        </div>
      </section>

      {filtersOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] sm:hidden"
          onClick={() => setFiltersOpen(false)}
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] border border-black/10 bg-white p-5 shadow-[0_-18px_50px_rgba(0,0,0,0.12)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-stone-300" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Refine
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  Filter quiz sets
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-slate-800"
              >
                Done
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Search
                </span>
                <input
                  type="text"
                  value={query || tagParam}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by topic, title, or focus tag"
                  className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Category
                </span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
                >
                  {allCategories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                  Difficulty
                </span>
                <select
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(
                      event.target.value as (typeof allDifficulties)[number],
                    )
                  }
                  className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
                >
                  {allDifficulties.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                  setDifficulty("All");
                }}
                className="inline-flex items-center justify-center rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-slate-800"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-3">
        {filtered.map((quiz) => (
          <QuizCard key={quiz.slug} quiz={quiz} />
        ))}
      </section>

      {filtered.length === 0 ? (
        <section className="mt-8 rounded-[24px] border border-dashed border-black/20 bg-white/70 p-6 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)] sm:rounded-[30px] sm:p-8">
          <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            No backend quiz sets match the current filters.
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Adjust the search term or reset the category and difficulty filters.
          </p>
        </section>
      ) : null}
    </>
  );
}
