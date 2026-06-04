"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchActiveRecallSheetCount,
  saveActiveRecallSheet,
} from "@/lib/active-recall-store";
import { useSupabaseSession } from "@/lib/supabase";

type RecallQuestion = {
  id: string;
  question: string;
  answer: string;
};

type RecallSheet = {
  topic: string;
  questions: RecallQuestion[];
};

function normalizeRecallText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function buildRecallPrompt(subject: string, topic: string) {
  return `You are a UPSC Prelims expert.

Create a HIGH-YIELD Active Recall Sheet for:

Subject: ${subject}
Topic: ${topic}

Rules:
- Only include exam-relevant questions
- Focus on traps, acts, bodies, authority confusion
- Max 8–10 questions
- Include at least 1 statement-based question
- Answers must be 1-line crisp
- No explanations

Return ONLY JSON:

{
  "topic": "${topic}",
  "questions": [
    {
      "question": "",
      "answer": ""
    }
  ]
}`;
}

function parseRecallSheet(input: string) {
  const parsed = JSON.parse(input) as {
    topic?: unknown;
    questions?: unknown;
  };

  if (typeof parsed.topic !== "string") {
    throw new Error("JSON must include a topic string.");
  }

  const topic = normalizeRecallText(parsed.topic);
  if (!topic) {
    throw new Error("Topic cannot be empty.");
  }

  if (!Array.isArray(parsed.questions)) {
    throw new Error("JSON must include a questions array.");
  }

  if (parsed.questions.length === 0) {
    throw new Error("At least one question is required before preview.");
  }

  const questions = parsed.questions.map((item, index) => {
    if (
      !item ||
      typeof item !== "object" ||
      typeof item.question !== "string" ||
      typeof item.answer !== "string"
    ) {
      throw new Error(
        `Question ${index + 1} must include string values for question and answer.`,
      );
    }

    const question = normalizeRecallText(item.question);
    const answer = normalizeRecallText(item.answer);

    if (!question || !answer) {
      throw new Error(
        `Question ${index + 1} must include non-empty question and answer values.`,
      );
    }

    return {
      id: `recall-${index}-${question.slice(0, 20)}-${answer.slice(0, 20)}`,
      question,
      answer,
    };
  });

  return {
    topic,
    questions,
  } satisfies RecallSheet;
}

function shuffleQuestions(questions: RecallQuestion[]) {
  const next = [...questions];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = next[index];
    next[index] = next[swapIndex] as RecallQuestion;
    next[swapIndex] = current as RecallQuestion;
  }

  return next;
}

function getTextBucket(value: string) {
  const normalized = normalizeRecallText(value);
  const length = normalized.length;

  if (length <= 90) {
    return "short";
  }

  if (length <= 240) {
    return "medium";
  }

  return "long";
}

function RecallPreviewCard({
  index,
  question,
  isRevealed,
  onToggle,
}: {
  index: number;
  question: RecallQuestion;
  isRevealed: boolean;
  onToggle: () => void;
}) {
  const questionWrapClass =
    getTextBucket(question.question) === "short"
      ? ""
      : "max-h-[260px] overflow-auto pr-1";
  const answerWrapClass =
    getTextBucket(question.answer) === "short"
      ? ""
      : "max-h-[260px] overflow-auto pr-1";

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
  );
}

export function ActiveRecallGenerator() {
  const { session, loaded: sessionLoaded } = useSupabaseSession();
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [sheet, setSheet] = useState<RecallSheet | null>(null);
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [publishedCount, setPublishedCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const revealedCount = sheet
    ? sheet.questions.filter((question) => revealedCards[question.id]).length
    : 0;

  useEffect(() => {
    if (!sessionLoaded) {
      return;
    }

    let active = true;

    void Promise.resolve(session ? fetchActiveRecallSheetCount() : 0)
      .then((count) => {
        if (!active) {
          return;
        }

        setPublishedCount(count);
      })
      .catch((countError) => {
        if (!active) {
          return;
        }

        setError(
          countError instanceof Error
            ? countError.message
            : "Unable to load published recall sheets.",
        );
      });

    return () => {
      active = false;
    };
  }, [session, sessionLoaded]);

  async function handleCopyPrompt() {
    if (!generatedPrompt) {
      return;
    }

    await navigator.clipboard.writeText(generatedPrompt);
    setCopyState("copied");
    setStatus("Prompt copied. Run it in your AI tool and paste the JSON below.");
    setError(null);
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  function handleGeneratePrompt() {
    const nextSubject = normalizeRecallText(subject);
    const nextTopic = normalizeRecallText(topic);

    if (!nextSubject || !nextTopic) {
      setError("Enter both subject and topic before generating the recall prompt.");
      setStatus(null);
      return;
    }

    setGeneratedPrompt(buildRecallPrompt(nextSubject, nextTopic));
    setSubject(nextSubject);
    setTopic(nextTopic);
    setError(null);
    setStatus("Prompt generated. Copy it, run it in AI, then paste the JSON response.");
  }

  function handlePreviewSheet() {
    try {
      const parsed = parseRecallSheet(jsonInput);
      setSheet(parsed);
      setRevealedCards({});
      setMode("preview");
      setError(null);
      setStatus(`Preview ready for ${parsed.questions.length} active recall cards.`);
    } catch (previewError) {
      setSheet(null);
      setRevealedCards({});
      setMode("edit");
      setError(
        previewError instanceof Error
          ? previewError.message
          : "The JSON could not be parsed.",
      );
      setStatus(null);
    }
  }

  function handleToggleCard(cardId: string) {
    setRevealedCards((current) => ({
      ...current,
      [cardId]: !current[cardId],
    }));
  }

  function handleRevealAll() {
    if (!sheet) {
      return;
    }

    setRevealedCards(
      Object.fromEntries(sheet.questions.map((question) => [question.id, true])),
    );
  }

  function handleHideAll() {
    setRevealedCards({});
  }

  function handleShuffle() {
    if (!sheet) {
      return;
    }

    setSheet({
      ...sheet,
      questions: shuffleQuestions(sheet.questions),
    });
    setStatus("Cards shuffled.");
    setError(null);
  }

  function handlePrint() {
    if (!sheet) {
      return;
    }

    setRevealedCards(
      Object.fromEntries(sheet.questions.map((question) => [question.id, true])),
    );
    window.print();
  }

  async function handlePublish() {
    if (!sheet) {
      setError("Preview a valid recall sheet before publishing.");
      setStatus(null);
      return;
    }

    if (!session) {
      setError("Sign in to publish active recall sheets to the backend.");
      setStatus(null);
      return;
    }

    try {
      setIsPublishing(true);
      await saveActiveRecallSheet({
        subject: normalizeRecallText(subject) || "UPSC Recall",
        topic: sheet.topic,
        prompt: generatedPrompt,
        sheet: {
          topic: sheet.topic,
          questions: sheet.questions.map((question) => ({
            question: question.question,
            answer: question.answer,
          })),
        },
      });
      setPublishedCount((current) => current + 1);
      setStatus(`Published "${sheet.topic}" to the backend.`);
      setError(null);
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "The sheet could not be published to the backend.",
      );
      setStatus(null);
    } finally {
      setIsPublishing(false);
    }
  }

  if (!sessionLoaded) {
    return (
      <section className="rounded-[28px] border border-black/10 bg-white/80 p-6 text-sm text-slate-500 shadow-[0_18px_70px_rgba(102,73,24,0.08)]">
        Loading active recall workspace...
      </section>
    );
  }

  if (mode === "preview" && sheet) {
    return (
      <section className="min-h-[calc(100vh-7rem)] print:min-h-0">
        <div className="sticky top-0 z-20 -mx-4 border-b border-black/10 bg-[rgba(255,252,245,0.92)] px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 print:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50"
              >
                ← Back to editor
              </button>
              <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-950">
                {revealedCount} / {sheet.questions.length} Revealed
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                {sheet.topic}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/active-recall"
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50"
              >
                Saved Sheets
              </Link>
              <button
                type="button"
                onClick={handleRevealAll}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50"
              >
                Show All
              </button>
              <button
                type="button"
                onClick={handleHideAll}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50"
              >
                Hide All
              </button>
              <button
                type="button"
                onClick={handleShuffle}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50"
              >
                Shuffle
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50"
              >
                Print
              </button>
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={!session || isPublishing}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPublishing ? "Publishing..." : "Publish Sheet"}
              </button>
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
          {!session ? (
            <p className="mb-5 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 print:hidden">
              Sign in to publish active recall sheets to the backend.
            </p>
          ) : null}

          <div className="mb-6 rounded-[24px] border border-black/10 bg-white/90 px-5 py-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] print:mb-4 print:break-inside-avoid print:rounded-[18px] print:border print:px-4 print:py-4 print:shadow-none">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-950">
                {normalizeRecallText(subject) || "UPSC Recall"}
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                {sheet.questions.length} Cards
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950 print:text-2xl">
              {sheet.topic}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600 print:hidden">
              Click any card to toggle between the question and the answer. Long text will scroll
              inside the card instead of breaking the layout.
            </p>
          </div>

          <div className="columns-1 gap-4 md:columns-2 xl:columns-3 print:columns-2">
            {sheet.questions.map((question, index) => (
              <RecallPreviewCard
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

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.86),rgba(255,248,236,0.7)),radial-gradient(circle_at_top_left,rgba(255,255,255,0.75),transparent_38%)] p-5 shadow-[0_28px_90px_rgba(120,90,34,0.16)] backdrop-blur-xl sm:p-8 print:hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(31,58,47,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_28%)]" />

      <div className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-emerald-900/10 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-900">
              Create Active Recall Sheets
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Generate crisp revision cards with a cleaner full-screen preview workflow.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Build the prompt, paste the AI JSON, then open a dedicated preview page to review,
              shuffle, print, and publish the sheet.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
            <div className="rounded-[24px] border border-white/60 bg-white/75 px-4 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Published
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {session ? publishedCount : 0}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/60 bg-white/75 px-4 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Last Preview
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">
                {sheet ? sheet.questions.length : 0}
              </p>
            </div>
          </div>
        </div>

        {status ? (
          <p className="mt-6 rounded-[20px] border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mt-6 rounded-[20px] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        ) : null}
        {!session ? (
          <p className="mt-6 rounded-[20px] border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
            Sign in to publish active recall sheets to the backend after preview.
          </p>
        ) : null}

        <div className="mt-8 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Step 1
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                    Recall Setup
                  </h3>
                </div>
                <span className="rounded-full bg-[#1f3a2f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-50">
                  Input Form
                </span>
              </div>

              <div className="mt-5 grid gap-4">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Subject
                  </span>
                  <input
                    type="text"
                    value={subject}
                    onChange={(event) => setSubject(event.target.value)}
                    placeholder="Polity, Economy, Environment..."
                    className="w-full rounded-[20px] border border-black/10 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Topic
                  </span>
                  <input
                    type="text"
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    placeholder="Constitutional Bodies, National Parks, Governor Powers..."
                    className="w-full rounded-[20px] border border-black/10 bg-white/85 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleGeneratePrompt}
                  className="inline-flex items-center justify-center rounded-[20px] bg-[#1f3a2f] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(31,58,47,0.22)] transition hover:-translate-y-0.5 hover:bg-[#163024]"
                >
                  Generate Active Recall
                </button>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Step 2
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                    AI Prompt Box
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => void handleCopyPrompt()}
                  disabled={!generatedPrompt}
                  className="inline-flex items-center justify-center rounded-[18px] border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {copyState === "copied" ? "Copied" : "Copy Prompt"}
                </button>
              </div>

              <textarea
                value={generatedPrompt}
                readOnly
                placeholder="Your dynamic Active Recall AI prompt appears here after generation."
                className="mt-5 min-h-[260px] w-full rounded-[22px] border border-black/10 bg-[#f8f5ee] px-4 py-4 font-mono text-[13px] leading-6 text-slate-800 outline-none"
              />
            </section>
          </div>

          <div className="space-y-5">
            <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Step 3
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                    Paste AI Output
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handlePreviewSheet}
                  className="inline-flex items-center justify-center rounded-[18px] bg-[#9f2f1f] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_36px_rgba(159,47,31,0.18)] transition hover:-translate-y-0.5 hover:bg-[#882617]"
                >
                  Open Preview
                </button>
              </div>

              <textarea
                value={jsonInput}
                onChange={(event) => setJsonInput(event.target.value)}
                placeholder={`{\n  "topic": "Fundamental Rights",\n  "questions": [\n    {\n      "question": "Which writ can only be issued against a public office?",\n      "answer": "Quo warranto."\n    }\n  ]\n}`}
                className="mt-5 min-h-[320px] w-full rounded-[22px] border border-black/10 bg-[#f8f5ee] px-4 py-4 font-mono text-[13px] leading-6 text-slate-800 outline-none transition focus:border-amber-400 focus:bg-white"
              />
            </section>

            <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Step 4
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                    Preview Mode
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Preview now opens in a dedicated full-screen mode with cleaner reading space and better text handling.
                  </p>
                </div>
                <div className="rounded-[20px] border border-dashed border-black/15 bg-white/70 px-4 py-3 text-sm text-slate-600">
                  {sheet
                    ? `${sheet.questions.length} cards ready for full-screen review`
                    : "No preview open yet"}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/65 bg-white/72 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Step 5
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                    Publish Sheet
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Publishing stays available after preview. The sheet is saved to Supabase for the signed-in user.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/active-recall"
                    className="inline-flex items-center justify-center rounded-[18px] border border-black/10 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
                  >
                    Open Saved Sheets
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handlePublish()}
                    disabled={!sheet || !session || isPublishing}
                    className="inline-flex items-center justify-center rounded-[18px] bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPublishing ? "Publishing..." : "Publish Sheet"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
