"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  fetchActiveRecallSheet,
  type ActiveRecallSheetRecord,
} from "@/lib/active-recall-store";
import { useSupabaseSession } from "@/lib/supabase";

type ViewerQuestion = {
  id: string;
  question: string;
  answer: string;
};

function toViewerQuestions(sheet: ActiveRecallSheetRecord["sheet"]) {
  return sheet.questions.map((question, index) => ({
    id: `saved-recall-${index}-${question.question.slice(0, 20)}-${question.answer.slice(0, 20)}`,
    question: question.question,
    answer: question.answer,
  }));
}

function shuffleQuestions<T>(questions: T[]) {
  const next = [...questions];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex] as T;
    next[swapIndex] = current as T;
  }

  return next;
}

function normalizeQuestionCountLabel(count: number) {
  return `${count} Card${count === 1 ? "" : "s"}`;
}

function SavedRecallCard({
  index,
  question,
  isRevealed,
  onToggle,
}: {
  index: number;
  question: ViewerQuestion;
  isRevealed: boolean;
  onToggle: () => void;
}) {
  const questionWrapClass =
    question.question.length <= 90 ? "" : "max-h-[260px] overflow-auto pr-1";
  const answerWrapClass =
    question.answer.length <= 90 ? "" : "max-h-[260px] overflow-auto pr-1";

  return (
    <div className="group mb-4 break-inside-avoid rounded-[28px] [perspective:1600px] print:mb-3">
      <button type="button" onClick={onToggle} className="block w-full text-left">
        <div className="grid rounded-[28px] [transform-style:preserve-3d]">
          <div
            className={`col-start-1 row-start-1 rounded-[28px] border border-[#ece6d9] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,246,239,0.94))] p-5 shadow-[0_16px_44px_rgba(15,23,42,0.08)] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden sm:p-6 ${
              isRevealed
                ? "pointer-events-none opacity-0 [transform:rotateY(-180deg)_scale(0.985)]"
                : "opacity-100 [transform:rotateY(0deg)_scale(1)]"
            }`}
          >
            <div className="flex flex-col justify-start gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#17153a] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  Card {index + 1}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Question
                </span>
              </div>
              <div className={questionWrapClass}>
                <p className="break-words whitespace-pre-line text-base font-semibold leading-7 text-slate-950 sm:text-lg">
                  {question.question}
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Click to reveal answer
              </p>
            </div>
          </div>

          <div
            className={`col-start-1 row-start-1 rounded-[28px] border border-[#d9eadf] bg-[linear-gradient(180deg,rgba(245,251,247,0.98),rgba(236,247,241,0.95))] p-5 shadow-[0_18px_46px_rgba(31,58,47,0.1)] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden sm:p-6 ${
              isRevealed
                ? "opacity-100 [transform:rotateY(0deg)_scale(1)]"
                : "pointer-events-none opacity-0 [transform:rotateY(180deg)_scale(0.985)]"
            }`}
          >
            <div className="flex flex-col justify-start gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-50">
                  Card {index + 1}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800">
                  Answer
                </span>
              </div>
              <div className={answerWrapClass}>
                <p className="break-words whitespace-pre-line text-base font-semibold leading-7 text-slate-950 sm:text-lg">
                  {question.answer}
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700/70">
                Click to flip back
              </p>
            </div>
          </div>

          <div className="col-start-1 row-start-1 hidden rounded-[28px] border border-black/10 bg-white print:block print:shadow-none">
            <div className="flex flex-col justify-start gap-4 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#17153a] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  Card {index + 1}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Question
                </span>
              </div>
              <div className={questionWrapClass}>
                <p className="break-words whitespace-pre-line text-base font-semibold leading-7 text-slate-950">
                  {question.question}
                </p>
              </div>
              <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800">
                  Answer
                </p>
                <div className={answerWrapClass}>
                  <p className="break-words whitespace-pre-line text-base font-semibold leading-7 text-slate-950">
                    {question.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

export function ActiveRecallSheetPlayer() {
  const params = useParams<{ id: string }>();
  const { session, loaded: sessionLoaded } = useSupabaseSession();
  const [record, setRecord] = useState<ActiveRecallSheetRecord | null>(null);
  const [questions, setQuestions] = useState<ViewerQuestion[]>([]);
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>(
    {},
  );
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const revealedCount = questions.filter((question) => revealedCards[question.id]).length;

  useEffect(() => {
    if (!sessionLoaded || !params?.id) {
      return;
    }

    let active = true;

    if (!session) {
      return;
    }

    void fetchActiveRecallSheet(params.id)
      .then((nextRecord) => {
        if (!active) {
          return;
        }

        setRecord(nextRecord);
        setQuestions(nextRecord ? toViewerQuestions(nextRecord.sheet) : []);
        setLoaded(true);
      })
      .catch((loadError) => {
        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load active recall sheet.",
        );
        setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [params?.id, session, sessionLoaded]);

  function handleToggleCard(cardId: string) {
    setRevealedCards((current) => ({
      ...current,
      [cardId]: !current[cardId],
    }));
  }

  function handleRevealAll() {
    setRevealedCards(Object.fromEntries(questions.map((question) => [question.id, true])));
  }

  function handleHideAll() {
    setRevealedCards({});
  }

  function handleShuffle() {
    setQuestions((current) => shuffleQuestions(current));
    setStatus("Cards shuffled.");
    setError(null);
  }

  function handlePrint() {
    setRevealedCards(Object.fromEntries(questions.map((question) => [question.id, true])));
    window.print();
  }

  if (!sessionLoaded) {
    return (
      <div className="rounded-[30px] border border-black/10 bg-white/75 p-8 text-sm text-slate-500">
        Loading active recall sheet...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[30px] border border-dashed border-black/20 bg-white/75 p-8 text-sm text-slate-500">
        Sign in to open saved active recall sheets.
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="rounded-[30px] border border-black/10 bg-white/75 p-8 text-sm text-slate-500">
        Loading active recall sheet...
      </div>
    );
  }

  if (error && !record) {
    return (
      <div className="rounded-[30px] border border-dashed border-rose-200 bg-rose-50 p-8 text-sm text-rose-800">
        {error}
      </div>
    );
  }

  if (!record) {
    return (
      <div className="rounded-[30px] border border-dashed border-black/20 bg-white/75 p-8 text-sm text-slate-500">
        This active recall sheet was not found in backend storage.
      </div>
    );
  }

  return (
    <section className="min-h-[calc(100vh-7rem)] print:min-h-0">
      <div className="sticky top-0 z-20 -mx-4 border-b border-black/10 bg-[rgba(255,252,245,0.92)] px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 print:hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/active-recall" className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50">
              ← Back to sheets
            </Link>
            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-950">
              {revealedCount} / {questions.length} Revealed
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              {record.topic}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleRevealAll} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50">
              Show All
            </button>
            <button type="button" onClick={handleHideAll} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50">
              Hide All
            </button>
            <button type="button" onClick={handleShuffle} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50">
              Shuffle
            </button>
            <button type="button" onClick={handlePrint} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50">
              Print
            </button>
            <Link href="/studio/active-recall" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800">
              Manage In Studio
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-0 py-6 sm:py-8 print:max-w-none print:px-0 print:py-0">
        {status ? (
          <p className="mb-5 rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 print:hidden">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mb-5 rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 print:hidden">
            {error}
          </p>
        ) : null}

        <div className="mb-6 rounded-[24px] border border-black/10 bg-white/90 px-5 py-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] print:mb-4 print:break-inside-avoid print:rounded-[18px] print:border print:px-4 print:py-4 print:shadow-none">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-950">
              {record.subject}
            </span>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
              {normalizeQuestionCountLabel(questions.length)}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-semibold text-slate-950 print:text-2xl">
            {record.topic}
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-600 print:hidden">
            Attempt the saved recall sheet here. You can remove weak or outdated cards individually, or delete the whole sheet.
          </p>
        </div>

        <div className="columns-1 gap-4 md:columns-2 xl:columns-3 print:columns-2">
          {questions.map((question, index) => (
            <SavedRecallCard
              key={question.id}
              index={index}
              question={question}
              isRevealed={Boolean(revealedCards[question.id])}
              onToggle={() => handleToggleCard(question.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
