"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchActiveRecallSheetCount,
  saveActiveRecallSheet,
} from "@/lib/active-recall-store";
import type {
  GenerationMode,
  RecallSheet,
} from "@/lib/active-recall/types";
import {
  cleanRecallSheetForPreview,
  createEmptyRecallCard,
  createEmptyRecallCards,
  generateRecallPrompt,
  normalizeRecallText,
  parseRecallSheet,
  shuffleQuestions,
} from "@/lib/active-recall/utils";
import { useSupabaseSession } from "@/lib/supabase";
import { AiPromptSection } from "./ai-prompt-section";
import { GenerationModeSwitch } from "./generation-mode-switch";
import { JsonInputSection } from "./json-input-section";
import { ManualSetupSection } from "./manual-setup-section";
import { RecallEditor } from "./recall-editor";
import { RecallPreviewCard } from "./recall-preview-card";
import { RecallStats } from "./recall-stats";

function normalizeCount(value: number) {
  if (!Number.isFinite(value)) {
    return 1;
  }

  return Math.min(80, Math.max(1, Math.floor(value)));
}

export function ActiveRecallGenerator() {
  const { session, loaded: sessionLoaded } = useSupabaseSession();
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [generationMode, setGenerationMode] = useState<GenerationMode>("ai");
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [editorSheet, setEditorSheet] = useState<RecallSheet | null>(null);
  const [previewSheet, setPreviewSheet] = useState<RecallSheet | null>(null);
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>(
    {},
  );
  const [isDirty, setIsDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [publishedCount, setPublishedCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  const revealedCount = previewSheet
    ? previewSheet.questions.filter((question) => revealedCards[question.id])
        .length
    : 0;

  useEffect(() => {
    if (!sessionLoaded) {
      return;
    }

    let active = true;

    void Promise.resolve(session ? fetchActiveRecallSheetCount() : 0)
      .then((count) => {
        if (active) {
          setPublishedCount(count);
        }
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

  function markEditorChanged(nextSheet: RecallSheet) {
    setEditorSheet(nextSheet);
    setIsDirty(true);
  }

  function handleGenerationModeChange(nextMode: GenerationMode) {
    setGenerationMode(nextMode);
    setError(null);
    setStatus(null);
  }

  async function handleCopyPrompt() {
    if (!generatedPrompt) {
      return;
    }

    await navigator.clipboard.writeText(generatedPrompt);
    setCopyState("copied");
    setStatus(
      "Prompt copied. Run it in your AI tool and paste the JSON below.",
    );
    setError(null);
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  function handleGeneratePrompt() {
    const nextSubject = normalizeRecallText(subject);
    const nextTopic = normalizeRecallText(topic);
    const nextCount = normalizeCount(questionCount);

    if (!nextSubject || !nextTopic) {
      setError(
        "Enter both subject and topic before generating the recall prompt.",
      );
      setStatus(null);
      return;
    }

    setSubject(nextSubject);
    setTopic(nextTopic);
    setQuestionCount(nextCount);
    setGeneratedPrompt(
      generateRecallPrompt(nextSubject, nextTopic, nextCount),
    );
    setError(null);
    setStatus(
      `Prompt generated for exactly ${nextCount} recall cards. Copy it, run it in AI, then validate the JSON into the editor.`,
    );
  }

  function handleValidateJsonToEditor() {
    try {
      const parsed = parseRecallSheet(jsonInput);
      setEditorSheet(parsed);
      setTopic(parsed.topic);
      setQuestionCount(parsed.questions.length);
      setPreviewSheet(null);
      setRevealedCards({});
      setViewMode("edit");
      setIsDirty(true);
      setError(null);
      setStatus(
        `AI JSON loaded into the shared editor with ${parsed.questions.length} editable cards.`,
      );
    } catch (previewError) {
      setEditorSheet(null);
      setPreviewSheet(null);
      setRevealedCards({});
      setViewMode("edit");
      setError(
        previewError instanceof Error
          ? previewError.message
          : "The JSON could not be parsed.",
      );
      setStatus(null);
    }
  }

  function handleCreateManualSheet() {
    const nextSubject = normalizeRecallText(subject);
    const nextTopic = normalizeRecallText(topic);
    const nextCount = normalizeCount(questionCount);

    if (!nextSubject || !nextTopic) {
      setError("Enter subject and topic before opening the manual editor.");
      setStatus(null);
      return;
    }

    setSubject(nextSubject);
    setTopic(nextTopic);
    setQuestionCount(nextCount);
    setEditorSheet({
      topic: nextTopic,
      questions: createEmptyRecallCards(nextCount),
    });
    setPreviewSheet(null);
    setRevealedCards({});
    setViewMode("edit");
    setIsDirty(true);
    setError(null);
    setStatus(`Manual editor opened with ${nextCount} empty cards.`);
  }

  function handleAddCard() {
    const baseSheet = editorSheet ?? {
      topic: normalizeRecallText(topic) || "Untitled Recall Sheet",
      questions: [],
    };

    markEditorChanged({
      ...baseSheet,
      questions: [...baseSheet.questions, createEmptyRecallCard()],
    });
    setStatus("Card added.");
    setError(null);
  }

  function handleDeleteCard(id: string) {
    if (!editorSheet || editorSheet.questions.length <= 1) {
      return;
    }

    markEditorChanged({
      ...editorSheet,
      questions: editorSheet.questions.filter((card) => card.id !== id),
    });
    setStatus("Card removed.");
    setError(null);
  }

  function handleUpdateCard(
    id: string,
    field: "question" | "answer",
    value: string,
  ) {
    if (!editorSheet) {
      return;
    }

    markEditorChanged({
      ...editorSheet,
      questions: editorSheet.questions.map((card) =>
        card.id === id
          ? {
              ...card,
              [field]: value,
            }
          : card,
      ),
    });
  }

  function handleResetEditor() {
    if (generationMode === "manual") {
      handleCreateManualSheet();
      return;
    }

    setEditorSheet(null);
    setPreviewSheet(null);
    setRevealedCards({});
    setIsDirty(false);
    setStatus("Editor cleared. Validate AI JSON again to continue.");
    setError(null);
  }

  function handlePreviewFromEditor() {
    if (!editorSheet) {
      setError("Load cards into the editor before preview.");
      setStatus(null);
      return;
    }

    try {
      const cleanedSheet = cleanRecallSheetForPreview({
        ...editorSheet,
        topic: normalizeRecallText(topic) || editorSheet.topic,
      });

      setEditorSheet(cleanedSheet);
      setPreviewSheet(cleanedSheet);
      setRevealedCards({});
      setViewMode("preview");
      setIsDirty(false);
      setError(null);
      setStatus(
        `Preview ready for ${cleanedSheet.questions.length} active recall cards.`,
      );
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "The sheet could not be previewed.",
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
    if (!previewSheet) {
      return;
    }

    setRevealedCards(
      Object.fromEntries(
        previewSheet.questions.map((question) => [question.id, true]),
      ),
    );
  }

  function handleHideAll() {
    setRevealedCards({});
  }

  function handleShuffle() {
    if (!previewSheet) {
      return;
    }

    const shuffled = {
      ...previewSheet,
      questions: shuffleQuestions(previewSheet.questions),
    };

    setPreviewSheet(shuffled);
    setEditorSheet(shuffled);
    setRevealedCards({});
    setStatus("Cards shuffled.");
    setError(null);
  }

  function handlePrint() {
    if (!previewSheet) {
      return;
    }

    setRevealedCards(
      Object.fromEntries(
        previewSheet.questions.map((question) => [question.id, true]),
      ),
    );
    window.print();
  }

  async function handlePublish() {
    if (!previewSheet) {
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
        topic: previewSheet.topic,
        prompt: generationMode === "ai" ? generatedPrompt : "",
        sheet: {
          topic: previewSheet.topic,
          questions: previewSheet.questions.map((question) => ({
            id: question.id,
            question: question.question,
            answer: question.answer,
          })),
        },
      });
      setPublishedCount((current) => current + 1);
      setStatus(`Published "${previewSheet.topic}" to the backend.`);
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

  if (viewMode === "preview" && previewSheet) {
    return (
      <section className="min-h-[calc(100vh-7rem)] print:min-h-0">
        <div className="sticky top-0 z-20 -mx-4 border-b border-black/10 bg-[rgba(255,252,245,0.92)] px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 print:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50"
              >
                Back to editor
              </button>
              <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-950">
                {revealedCount} / {previewSheet.questions.length} Revealed
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                {previewSheet.topic}
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
                {previewSheet.questions.length} Cards
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950 print:text-2xl">
              {previewSheet.topic}
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600 print:hidden">
              Click any card to toggle between the question and the answer. Long
              text scrolls inside the card instead of breaking the layout.
            </p>
          </div>

          <div className="columns-1 gap-4 md:columns-2 xl:columns-3 print:columns-2">
            {previewSheet.questions.map((question, index) => (
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

      <div className="relative space-y-8">
        <GenerationModeSwitch
          value={generationMode}
          onChange={handleGenerationModeChange}
        />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex rounded-full border border-emerald-900/10 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-900">
              Create Active Recall Sheets
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
              Build AI-assisted or manual recall cards in one editable
              workflow.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Generate a prompt, validate JSON into the editor, or pre-create
              manual cards. Preview, shuffle, print, and publish stay in the
              same polished workspace.
            </p>
          </div>

          <RecallStats
            publishedCount={session ? publishedCount : 0}
            lastPreviewCount={previewSheet ? previewSheet.questions.length : 0}
            editorCount={editorSheet ? editorSheet.questions.length : 0}
            isDirty={isDirty}
          />
        </div>

        {status ? (
          <p className="rounded-[20px] border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-[20px] border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-800">
            {error}
          </p>
        ) : null}
        {!session ? (
          <p className="rounded-[20px] border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
            Sign in to publish active recall sheets to the backend after
            preview.
          </p>
        ) : null}

        {generationMode === "ai" ? (
          <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
            <AiPromptSection
              subject={subject}
              topic={topic}
              questionCount={questionCount}
              generatedPrompt={generatedPrompt}
              copyState={copyState}
              onSubjectChange={setSubject}
              onTopicChange={setTopic}
              onQuestionCountChange={(value) =>
                setQuestionCount(normalizeCount(value))
              }
              onGeneratePrompt={handleGeneratePrompt}
              onCopyPrompt={() => void handleCopyPrompt()}
            />
            <div className="space-y-5">
              <JsonInputSection
                jsonInput={jsonInput}
                onJsonInputChange={setJsonInput}
                onValidate={handleValidateJsonToEditor}
              />
              <RecallEditor
                sheet={editorSheet}
                isDirty={isDirty}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
                onUpdateCard={handleUpdateCard}
                onPreview={handlePreviewFromEditor}
                onReset={handleResetEditor}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <ManualSetupSection
              subject={subject}
              topic={topic}
              cardCount={questionCount}
              onSubjectChange={setSubject}
              onTopicChange={setTopic}
              onCardCountChange={(value) =>
                setQuestionCount(normalizeCount(value))
              }
              onCreateSheet={handleCreateManualSheet}
            />
            <RecallEditor
              sheet={editorSheet}
              isDirty={isDirty}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onUpdateCard={handleUpdateCard}
              onPreview={handlePreviewFromEditor}
              onReset={handleResetEditor}
            />
          </div>
        )}
      </div>
    </section>
  );
}
