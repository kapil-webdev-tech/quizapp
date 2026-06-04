"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuizSet } from "@/lib/quiz-types";
import { QuizPrompt } from "@/components/quiz/quiz-prompt";

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getOptionText(
  question: QuizSet["questions"][number],
  optionId: string | null,
) {
  if (!optionId) {
    return null;
  }

  return question.options.find((option) => option.id === optionId)?.text ?? null;
}

export function QuizSession({
  quiz,
  resultsBasePath = "/results",
  attemptMode = "exam",
}: {
  quiz: QuizSet;
  resultsBasePath?: string;
  attemptMode?: "exam" | "practice";
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(quiz.durationMinutes * 60);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>(
    {},
  );
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const isPracticeMode = attemptMode === "practice";

  useEffect(() => {
    if (isPracticeMode) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPracticeMode]);

  const navigateToResults = useCallback(() => {
    const params = new URLSearchParams(answers);
    router.push(`${resultsBasePath}/${quiz.slug}?${params.toString()}`);
  }, [answers, quiz.slug, resultsBasePath, router]);

  useEffect(() => {
    if (isPracticeMode) {
      return;
    }

    if (secondsLeft === 0) {
      navigateToResults();
    }
  }, [isPracticeMode, navigateToResults, secondsLeft]);

  const currentQuestion = quiz.questions[currentIndex];
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const reviewedCount = useMemo(
    () => Object.keys(revealedAnswers).length,
    [revealedAnswers],
  );
  const practiceCorrectCount = useMemo(
    () =>
      quiz.questions.filter(
        (question) =>
          revealedAnswers[question.id] && answers[question.id] === question.answer,
      ).length,
    [answers, quiz.questions, revealedAnswers],
  );
  const isCurrentQuestionRevealed = Boolean(revealedAnswers[currentQuestion.id]);
  const selectedOptionId = answers[currentQuestion.id] ?? null;
  const selectedOptionText = getOptionText(currentQuestion, selectedOptionId);
  const correctOptionText = getOptionText(currentQuestion, currentQuestion.answer);

  function goNext() {
    setCurrentIndex((value) => Math.min(value + 1, quiz.questions.length - 1));
  }

  function goPrevious() {
    setCurrentIndex((value) => Math.max(value - 1, 0));
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
    touchEndX.current = null;
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    touchEndX.current = event.changedTouches[0]?.clientX ?? null;

    if (touchStartX.current === null || touchEndX.current === null) {
      return;
    }

    const delta = touchEndX.current - touchStartX.current;
    if (Math.abs(delta) < 50) {
      return;
    }

    if (delta < 0) {
      goNext();
      return;
    }

    goPrevious();
  }

  function handleCheckAnswer() {
    if (!selectedOptionId) {
      return;
    }

    setRevealedAnswers((value) => ({
      ...value,
      [currentQuestion.id]: true,
    }));
  }

  return (
    <section className="grid min-w-0 max-w-full gap-4 overflow-x-hidden pb-24 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6 lg:pb-0">
      <aside className="min-w-0 max-w-full rounded-[24px] border border-black/10 bg-[#1f3a2f] p-4 text-stone-50 shadow-[0_18px_80px_rgba(31,58,47,0.25)] sm:rounded-[30px] sm:p-5 lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100vh-3rem)] lg:flex-col lg:overflow-hidden">
        <div className="flex items-start justify-between gap-3 lg:block">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200 sm:text-xs sm:tracking-[0.3em]">
              {isPracticeMode ? "Practice Mode" : "Live Attempt"}
            </p>
            <h2 className="mt-3 line-clamp-2 text-lg font-semibold leading-tight sm:text-2xl">{quiz.title}</h2>
          </div>
          {!isPracticeMode ? (
            <div className="shrink-0 rounded-2xl bg-white/10 px-3 py-2 text-right lg:hidden">
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-300">Time</p>
              <p className="mt-1 text-xl font-semibold">{formatTime(secondsLeft)}</p>
            </div>
          ) : null}
        </div>
        {!isPracticeMode ? (
          <div className="mt-5 hidden rounded-3xl bg-white/10 p-4 lg:block">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Time Left</p>
            <p className="mt-2 text-4xl font-semibold">{formatTime(secondsLeft)}</p>
          </div>
        ) : (
          <div className="mt-5 hidden rounded-3xl bg-white/10 p-4 lg:block">
            <p className="text-xs uppercase tracking-[0.2em] text-stone-300">Reviewed</p>
            <p className="mt-2 text-4xl font-semibold">{reviewedCount}</p>
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:gap-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-stone-300">{isPracticeMode ? "Correct" : "Answered"}</p>
            <p className="mt-1 text-lg font-semibold sm:text-xl">
              {isPracticeMode ? practiceCorrectCount : answeredCount}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-stone-300">Remaining</p>
            <p className="mt-1 text-lg font-semibold sm:text-xl">
              {quiz.questions.length - (isPracticeMode ? reviewedCount : answeredCount)}
            </p>
          </div>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-6 lg:min-h-0 lg:flex-1 lg:flex-wrap lg:content-start lg:gap-3 lg:overflow-y-auto lg:overflow-x-hidden lg:pb-2">
          {quiz.questions.map((question, index) => {
            const isAnswered = Boolean(answers[question.id]);
            const isActive = index === currentIndex;
            const isRevealed = Boolean(revealedAnswers[question.id]);
            const isCorrect =
              isRevealed && answers[question.id] === question.answer;

            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-10 w-10 shrink-0 rounded-full border text-sm font-semibold transition active:scale-95 sm:h-11 sm:w-11 ${
                  isActive
                    ? "border-amber-200 bg-amber-300 text-slate-900"
                    : isPracticeMode && isRevealed
                      ? isCorrect
                        ? "border-emerald-200 bg-emerald-100 text-emerald-950"
                        : "border-rose-200 bg-rose-100 text-rose-950"
                      : isAnswered
                      ? "border-emerald-200 bg-emerald-100 text-emerald-950"
                      : "border-white/20 bg-white/5 text-white"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="min-w-0 w-full max-w-full overflow-x-hidden rounded-[28px] border border-black/10 bg-white/85 p-4 shadow-[0_18px_80px_rgba(102,77,28,0.12)] sm:rounded-[34px] sm:p-8">
        <div className="flex flex-col gap-3 border-b border-black/10 pb-4 sm:pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700 sm:text-xs sm:tracking-[0.28em]">
              Question {currentIndex + 1} of {quiz.questions.length}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {currentQuestion.topic} • {currentQuestion.difficulty}
            </p>
          </div>
          <div className="hidden gap-3 sm:flex sm:flex-wrap">
            {!isPracticeMode ? (
              <button
                type="button"
                onClick={navigateToResults}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.99] hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                type="button"
                onClick={navigateToResults}
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.99] hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Open Results
              </button>
            )}
          </div>
        </div>

        <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} className="min-w-0 max-w-full touch-pan-y overflow-x-hidden">
          <div className="min-w-0 max-w-full border-b border-black/8 bg-white/95 pb-3 pt-4 sm:border-b-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0">
            <QuizPrompt prompt={currentQuestion.prompt} />
            <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400 lg:hidden">Swipe left or right to move between questions</p>
          </div>
          <div className="mt-5 grid gap-3 sm:mt-6">
            {currentQuestion.options.map((option) => {
              const isSelected = answers[currentQuestion.id] === option.id;
              const isCorrectOption =
                isPracticeMode &&
                isCurrentQuestionRevealed &&
                option.id === currentQuestion.answer;
              const isWrongSelected =
                isPracticeMode &&
                isCurrentQuestionRevealed &&
                isSelected &&
                option.id !== currentQuestion.answer;

              return (
                <button
                  key={option.id}
                  type="button"
                  disabled={isPracticeMode && isCurrentQuestionRevealed}
                  onClick={() => setAnswers((value) => ({ ...value, [currentQuestion.id]: option.id }))}
                  className={`w-full max-w-full break-words [overflow-wrap:anywhere] rounded-[20px] border px-4 py-4 text-left text-sm leading-6 transition active:scale-[0.99] sm:rounded-[24px] sm:px-5 ${
                    isCorrectOption
                      ? "border-emerald-300 bg-emerald-50 text-emerald-950 shadow-[0_10px_24px_rgba(16,185,129,0.12)]"
                      : isWrongSelected
                        ? "border-rose-300 bg-rose-50 text-rose-950 shadow-[0_10px_24px_rgba(244,63,94,0.12)]"
                      : isSelected
                      ? "border-slate-900 bg-amber-100 text-slate-950 shadow-[0_10px_24px_rgba(245,158,11,0.18)]"
                      : "border-black/10 bg-stone-50 text-slate-700 hover:border-amber-300 hover:bg-amber-50"
                  } ${isPracticeMode && isCurrentQuestionRevealed ? "cursor-default" : ""}`}
                >
                  <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-semibold uppercase text-slate-500 sm:h-8 sm:w-8 sm:text-xs">
                    {option.id}
                  </span>
                  {option.text}
                </button>
              );
            })}
          </div>

          {isPracticeMode && isCurrentQuestionRevealed ? (
            <div className="mt-6 space-y-3 rounded-[24px] border border-black/10 bg-stone-50 p-4 sm:mt-7 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Your Answer</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {selectedOptionText ?? "Not answered"}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-700">Correct Answer</p>
                  <p className="mt-2 text-sm font-medium text-emerald-900">
                    {correctOptionText}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Explanation</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {currentQuestion.explanation}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-6 hidden grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-wrap lg:flex">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={goPrevious}
            className="inline-flex w-full items-center justify-center rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-slate-700 transition active:scale-[0.99] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            Previous
          </button>
          {isPracticeMode ? (
            <>
              <button
                type="button"
                disabled={!selectedOptionId || isCurrentQuestionRevealed}
                onClick={handleCheckAnswer}
                className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.99] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Check Answer
              </button>
              <button
                type="button"
                disabled={
                  currentIndex === quiz.questions.length - 1 ||
                  !isCurrentQuestionRevealed
                }
                onClick={goNext}
                className="inline-flex w-full items-center justify-center rounded-full bg-[#9f2f1f] px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.99] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                Next
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={currentIndex === quiz.questions.length - 1}
              onClick={goNext}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#9f2f1f] px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.99] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/92 px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3">
          <div className="flex items-center justify-between rounded-full bg-stone-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            <span>{currentIndex + 1}/{quiz.questions.length}</span>
            <span>
              {isPracticeMode ? `${reviewedCount} reviewed` : `${answeredCount} answered`}
            </span>
            <span>{isPracticeMode ? "Practice" : formatTime(secondsLeft)}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={goPrevious}
              className="inline-flex min-w-0 flex-1 items-center justify-center rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-slate-700 transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={isPracticeMode ? (isCurrentQuestionRevealed ? navigateToResults : handleCheckAnswer) : navigateToResults}
              disabled={isPracticeMode ? (!selectedOptionId && !isCurrentQuestionRevealed) : false}
              className="inline-flex min-w-0 flex-1 items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99]"
            >
              {isPracticeMode ? (isCurrentQuestionRevealed ? "Results" : "Check") : "Submit"}
            </button>
            <button
              type="button"
              disabled={
                currentIndex === quiz.questions.length - 1 ||
                (isPracticeMode && !isCurrentQuestionRevealed)
              }
              onClick={goNext}
              className="inline-flex min-w-0 flex-1 items-center justify-center rounded-full bg-[#9f2f1f] px-4 py-3 text-sm font-semibold text-white transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
