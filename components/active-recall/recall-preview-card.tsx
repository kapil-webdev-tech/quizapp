"use client";

import type { RecallCard } from "@/lib/active-recall/types";
import { normalizeRecallText } from "@/lib/active-recall/utils";

function getTextBucket(value: string) {
  const length = normalizeRecallText(value).length;

  if (length <= 90) {
    return "short";
  }

  if (length <= 240) {
    return "medium";
  }

  return "long";
}

export function RecallPreviewCard({
  index,
  question,
  isRevealed,
  onToggle,
}: {
  index: number;
  question: RecallCard;
  isRevealed: boolean;
  onToggle: () => void;
}) {
  const questionWrapClass =
    getTextBucket(question.question) === "short"
      ? ""
      : "max-h-[320px] overflow-auto pr-1";
  const answerWrapClass =
    getTextBucket(question.answer) === "short"
      ? ""
      : "max-h-[320px] overflow-auto pr-1";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="group mb-4 block w-full break-inside-avoid rounded-[28px] text-left [perspective:1600px] print:mb-3"
    >
      <div className="grid rounded-[28px] [transform-style:preserve-3d]">
        <div
          className={`col-start-1 row-start-1 rounded-[28px] border border-[#ece6d9] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,246,239,0.94))] shadow-[0_16px_44px_rgba(15,23,42,0.08)] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden ${
            isRevealed
              ? "pointer-events-none opacity-0 [transform:rotateY(-180deg)_scale(0.985)]"
              : "opacity-100 [transform:rotateY(0deg)_scale(1)]"
          }`}
        >
          <div className="flex flex-col justify-start gap-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#17153a] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                Card {index + 1}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Question
              </span>
            </div>

            <div className={`flex-1 ${questionWrapClass}`}>
              <p className="break-words whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950 sm:text-lg">
                {question.question}
              </p>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Click to reveal answer
            </p>
          </div>
        </div>

        <div
          className={`col-start-1 row-start-1 rounded-[28px] border border-[#d9eadf] bg-[linear-gradient(180deg,rgba(245,251,247,0.98),rgba(236,247,241,0.95))] shadow-[0_18px_46px_rgba(31,58,47,0.1)] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden ${
            isRevealed
              ? "opacity-100 [transform:rotateY(0deg)_scale(1)]"
              : "pointer-events-none opacity-0 [transform:rotateY(180deg)_scale(0.985)]"
          }`}
        >
          <div className="flex flex-col justify-start gap-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-900 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-50">
                Card {index + 1}
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800">
                Answer
              </span>
            </div>

            <div className={`flex-1 ${answerWrapClass}`}>
              <p className="break-words whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950 sm:text-lg">
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
              <p className="break-words whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950">
                {question.question}
              </p>
            </div>

            <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-800">
                Answer
              </p>
              <div className={answerWrapClass}>
                <p className="break-words whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950">
                  {question.answer}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
