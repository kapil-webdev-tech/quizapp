"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  deleteActiveRecallSheet,
  fetchActiveRecallSheet,
  fetchUserRecallProgress,
  upsertUserRecallProgress,
  updateActiveRecallSheet,
  updateActiveRecallSheetVisibility,
  type RecallStatus,
  type ActiveRecallSheetRecord,
  type UserRecallProgress,
  deleteUserRecallProgress,
} from "@/lib/active-recall-store";
import { normalizeRecallText } from "@/lib/active-recall/utils";
import { useSupabaseSession } from "@/lib/supabase";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { RecallCardTracker } from "./active-recall/recall-card/recall-card-tracker";
import RecallCardHeader from "./active-recall/recall-card/recall-card-header";
import { StickyPageHeader } from "@/components/ui/sticky-page-header";
import RecallCardEditForm from "./active-recall/recall-card/recall-card-editform";
import { Loader } from "./ui/loader";
import { ConfirmationModal } from "./ui/modal/confirmation-modal";

type ViewerQuestion = {
  id: string;
  question: string;
  answer: string;
};

function toViewerQuestions(sheet: ActiveRecallSheetRecord["sheet"]) {
  return sheet.questions.map((question) => ({
    id: question.id,
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

function getRecallStatusAccent(status?: RecallStatus) {
  switch (status) {
    case "mastered":
      return "bg-emerald-500";

    case "partial":
      return "bg-amber-400";

    case "forgot":
      return "bg-rose-500";

    default:
      return "bg-slate-300";
  }
}

function SavedRecallCard({
  mode,
  index,
  question,
  isRevealed,
  isEditing,
  draftQuestion,
  draftAnswer,
  isSaving,
  progress,
  canTrackProgress,
  onToggle,
  onStartEdit,
  onCancelEdit,
  onDraftQuestionChange,
  onDraftAnswerChange,
  onSaveEdit,
  onDelete,
  onTrackProgress,
}: {
  index: number;
  mode: "view" | "manage";
  question: ViewerQuestion;
  isRevealed: boolean;
  isEditing: boolean;
  draftQuestion: string;
  draftAnswer: string;
  isSaving: boolean;
  progress?: UserRecallProgress;
  canTrackProgress: boolean;
  onToggle: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onDraftQuestionChange: (value: string) => void;
  onDraftAnswerChange: (value: string) => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onTrackProgress: (
    input: {
      recallStatus: RecallStatus;
      recalledPoints: number;
      totalPoints: number;
    } | null,
  ) => void;
}) {
  const questionWrapClass =
    question.question.length <= 90 ? "" : "max-h-[320px] overflow-auto pr-1";
  const answerWrapClass =
    question.answer.length <= 90 ? "" : "max-h-[320px] overflow-auto pr-1";
  const accentColor = getRecallStatusAccent(progress?.recallStatus);
  if (isEditing) {
    return (
      <RecallCardEditForm
        index={index}
        draftQuestion={draftQuestion}
        draftAnswer={draftAnswer}
        isSaving={isSaving}
        onDraftQuestionChange={onDraftQuestionChange}
        onDraftAnswerChange={onDraftAnswerChange}
        onCancel={onCancelEdit}
        onSave={onSaveEdit}
      />
    );
  }

  return (
    <div className="group mb-4 break-inside-avoid rounded-[28px] [perspective:1600px] print:mb-3">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onToggle();
          }
        }}
        className="block w-full text-left"
      >
        <div className="grid rounded-[28px] [transform-style:preserve-3d]">
          {/* Front of card */}
          <div
            className={`relative col-start-1 row-start-1 rounded-[28px] border border-[#ece6d9] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(249,246,239,0.94))] p-5 shadow-[0_16px_44px_rgba(15,23,42,0.08)] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden sm:p-6 ${
              isRevealed
                ? "pointer-events-none opacity-0 [transform:rotateY(-180deg)_scale(0.985)]"
                : "opacity-100 [transform:rotateY(0deg)_scale(1)]"
            }`}
          >
            <div
              className={`absolute left-0 top-6 bottom-6 w-2 rounded-r-full ${accentColor}`}
            />
            <div className="flex flex-col justify-start gap-4">
              <RecallCardHeader
                mode={mode}
                side="question"
                index={index}
                badgeClassName="bg-[#17153a]"
                labelClassName="bg-slate-100 text-slate-500"
                isSaving={isSaving}
                onStartEdit={onStartEdit}
                onDelete={onDelete}
              />
              <div className={questionWrapClass}>
                <p className="break-words whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950 sm:text-lg">
                  {question.question}
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Click to reveal answer
              </p>
            </div>
          </div>
          {/* Back of card */}
          <div
            className={`col-start-1 row-start-1 rounded-[28px] border border-[#d9eadf] bg-[linear-gradient(180deg,rgba(245,251,247,0.98),rgba(236,247,241,0.95))] p-5 shadow-[0_18px_46px_rgba(31,58,47,0.1)] [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] print:hidden sm:p-6 ${
              isRevealed
                ? "opacity-100 [transform:rotateY(0deg)_scale(1)]"
                : "pointer-events-none opacity-0 [transform:rotateY(180deg)_scale(0.985)]"
            }`}
          >
            <div className="flex flex-col justify-start gap-4">
              <RecallCardHeader
                mode={mode}
                side="answer"
                index={index}
                badgeClassName="bg-emerald-900"
                labelClassName="bg-emerald-100 text-emerald-800"
                isSaving={isSaving}
                onStartEdit={onStartEdit}
                onDelete={onDelete}
              />

              <div className={answerWrapClass}>
                <p className="break-words whitespace-pre-wrap text-base font-semibold leading-7 text-slate-950 sm:text-lg">
                  {question.answer}
                </p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700/70">
                Click to flip back
              </p>
              <RecallCardTracker
                progress={progress}
                isSaving={isSaving}
                disabled={!canTrackProgress}
                onTrack={onTrackProgress}
              />
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
      </div>
    </div>
  );
}
type ActiveRecallSheetPlayerProps = {
  mode?: "view" | "manage";
};

export function ActiveRecallSheetPlayer({
  mode = "view",
}: ActiveRecallSheetPlayerProps) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, loaded: sessionLoaded } = useSupabaseSession();
  const [record, setRecord] = useState<ActiveRecallSheetRecord | null>(null);
  const [questions, setQuestions] = useState<ViewerQuestion[]>([]);
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>(
    {},
  );
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [draftQuestion, setDraftQuestion] = useState("");
  const [draftAnswer, setDraftAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [deleteCardId, setDeleteCardId] = useState<string | null>(null);

  const [progressByCardId, setProgressByCardId] = useState<
    Record<string, UserRecallProgress>
  >({});

  const revealedCount = questions.filter(
    (question) => revealedCards[question.id],
  ).length;
  const canManageSheet = Boolean(
    session &&
    record &&
    record.ownerId === session.user.id &&
    mode === "manage",
  );

  useEffect(() => {
    if (!sessionLoaded || !params?.id) {
      return;
    }

    let active = true;

    void fetchActiveRecallSheet(params.id)
      .then((nextRecord) => {
        if (!active) {
          return;
        }

        const nextQuestions = nextRecord
          ? toViewerQuestions(nextRecord.sheet)
          : [];

        setRecord(nextRecord);
        setQuestions(nextQuestions);
        setLoaded(true);

        if (session && nextQuestions.length > 0) {
          void fetchUserRecallProgress(
            nextQuestions.map((question) => question.id),
          )
            .then((nextProgress) => {
              if (!active) {
                return;
              }

              setProgressByCardId(
                Object.fromEntries(
                  nextProgress.map((progress) => [progress.cardId, progress]),
                ),
              );
            })
            .catch((progressError) => {
              if (!active) {
                return;
              }

              setError(
                progressError instanceof Error
                  ? progressError.message
                  : "Unable to load recall progress.",
              );
            });
        }
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
    setRevealedCards(
      Object.fromEntries(questions.map((question) => [question.id, true])),
    );
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
    setRevealedCards(
      Object.fromEntries(questions.map((question) => [question.id, true])),
    );
    window.print();
  }

  function toStoredSheet(nextQuestions: ViewerQuestion[]) {
    if (!record) {
      throw new Error("Saved sheet is not loaded.");
    }

    return {
      topic: record.topic,
      questions: nextQuestions.map((question) => ({
        id: question.id,
        question: question.question,
        answer: question.answer,
      })),
    };
  }

  async function persistQuestions(
    nextQuestions: ViewerQuestion[],
    nextStatus: string,
  ) {
    if (!record) {
      return;
    }

    setIsSaving(true);
    try {
      const nextSheet = toStoredSheet(nextQuestions);

      await updateActiveRecallSheet(record.id, {
        subject: record.subject,
        topic: record.topic,
        prompt: record.prompt,
        visibility: record.visibility,
        sheet: nextSheet,
      });

      setRecord({
        ...record,
        sheet: nextSheet,
        updatedAt: new Date().toISOString(),
      });
      setQuestions(nextQuestions);
      setStatus(nextStatus);
      setError(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to update this saved recall sheet.",
      );
      setStatus(null);
    } finally {
      setIsSaving(false);
    }
  }

  function handleStartEdit(question: ViewerQuestion) {
    if (!canManageSheet) {
      return;
    }

    setEditingCardId(question.id);
    setDraftQuestion(question.question);
    setDraftAnswer(question.answer);
    setStatus(null);
    setError(null);
  }

  function handleCancelEdit() {
    setEditingCardId(null);
    setDraftQuestion("");
    setDraftAnswer("");
  }

  async function handleSaveEdit(cardId: string) {
    if (!canManageSheet) {
      setError("Only the sheet owner can edit saved cards.");
      setStatus(null);
      return;
    }

    const nextQuestion = normalizeRecallText(draftQuestion);
    const nextAnswer = normalizeRecallText(draftAnswer);

    if (!nextQuestion || !nextAnswer) {
      setError("Question and answer cannot be empty.");
      setStatus(null);
      return;
    }

    const nextQuestions = questions.map((question) =>
      question.id === cardId
        ? {
            ...question,
            question: nextQuestion,
            answer: nextAnswer,
          }
        : question,
    );

    await persistQuestions(nextQuestions, "Card updated.");
    setEditingCardId(null);
    setDraftQuestion("");
    setDraftAnswer("");
  }

  async function handleDeleteCard(cardId: string) {
    if (!canManageSheet) {
      setError("Only the sheet owner can delete saved cards.");
      setStatus(null);
      return;
    }

    if (questions.length <= 1) {
      setError("A saved sheet must keep at least one card.");
      setStatus(null);
      return;
    }

    const nextQuestions = questions.filter(
      (question) => question.id !== cardId,
    );
    await persistQuestions(nextQuestions, "");
    toast.success("Card deleted successfully");

    setRevealedCards((current) => {
      const next = { ...current };
      delete next[cardId];
      return next;
    });
    if (editingCardId === cardId) {
      handleCancelEdit();
    }
  }

  async function handleTrackProgress(
    cardId: string,
    input: {
      recallStatus: RecallStatus;
      recalledPoints: number;
      totalPoints: number;
    } | null,
  ) {
    if (!session) {
      setError("Sign in to track memory for this card.");
      setStatus(null);
      return;
    }

    const now = new Date().toISOString();
    const previousProgress = progressByCardId[cardId];
    if (!input) {
      setProgressByCardId((current) => {
        const next = { ...current };
        delete next[cardId];
        return next;
      });

      try {
        await deleteUserRecallProgress(cardId);

        setStatus("Memory state cleared.");
        setError(null);
      } catch (progressError) {
        if (previousProgress) {
          setProgressByCardId((current) => ({
            ...current,
            [cardId]: previousProgress,
          }));
        }

        setError(
          progressError instanceof Error
            ? progressError.message
            : "Unable to clear memory state.",
        );
      }

      return;
    }
    const optimisticProgress: UserRecallProgress = {
      id: previousProgress?.id ?? `optimistic-${cardId}`,
      userId: session.user.id,
      cardId,
      recallStatus: input.recallStatus,
      recalledPoints: input.recalledPoints,
      totalPoints: input.totalPoints,
      reviewCount: (previousProgress?.reviewCount ?? 0) + 1,
      lastReviewedAt: now,
      createdAt: previousProgress?.createdAt ?? now,
      updatedAt: now,
    };

    setProgressByCardId((current) => ({
      ...current,
      [cardId]: optimisticProgress,
    }));

    try {
      await upsertUserRecallProgress({
        cardId,
        recallStatus: input.recallStatus,
        recalledPoints: input.recalledPoints,
        totalPoints: input.totalPoints,
      });
      setStatus("Memory state updated.");
      setError(null);
    } catch (progressError) {
      setProgressByCardId((current) => {
        const next = { ...current };
        if (previousProgress) {
          next[cardId] = previousProgress;
        } else {
          delete next[cardId];
        }
        return next;
      });
      setError(
        progressError instanceof Error
          ? progressError.message
          : "Unable to update memory state.",
      );
      setStatus(null);
    }
  }

  async function handleDeleteSheet() {
    if (!record) {
      return;
    }

    if (!canManageSheet) {
      setError("Only the sheet owner can delete this saved sheet.");
      setStatus(null);
      return;
    }

    setIsSaving(true);
    try {
      await deleteActiveRecallSheet(record.id);
      router.push("/active-recall");
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete this saved recall sheet.",
      );
      setStatus(null);
      setIsSaving(false);
    }
  }

  async function handleToggleVisibility() {
    if (!record || !canManageSheet) {
      return;
    }

    const nextVisibility =
      record.visibility === "public" ? "private" : "public";

    setIsSaving(true);
    try {
      await updateActiveRecallSheetVisibility(record.id, nextVisibility);
      setRecord({
        ...record,
        visibility: nextVisibility,
        updatedAt: new Date().toISOString(),
      });
      setStatus(
        nextVisibility === "public"
          ? "Sheet published publicly."
          : "Sheet moved back to private.",
      );
      setError(null);
    } catch (visibilityError) {
      setError(
        visibilityError instanceof Error
          ? visibilityError.message
          : "Unable to update sheet visibility.",
      );
      setStatus(null);
    } finally {
      setIsSaving(false);
    }
  }

  if (!sessionLoaded) {
    return <Loader message="Loading active recall sheets..." />;
  }

  if (!loaded) {
    return <Loader message="Loading active recall sheets..." />;
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
      <StickyPageHeader
        leftContent={
          <>
            <Link
              href="/active-recall"
              className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-stone-50"
            >
              ← Back to sheets
            </Link>

            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-950">
              {revealedCount} / {questions.length} Revealed
            </div>

            <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              {record.topic}
            </div>
          </>
        }
        rightContent={
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleRevealAll}
              className="gap-1.5"
            >
              Show All
            </Button>

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

            {canManageSheet && (
              <button
                type="button"
                onClick={() => void handleToggleVisibility()}
                disabled={isSaving}
                className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {record.visibility === "public"
                  ? "Make Private"
                  : "Publish Public"}
              </button>
            )}

            {canManageSheet && (
              <button
                type="button"
                // onClick={() => void handleDeleteSheet()}
                onClick={() => setDeleteSheetOpen(true)}
                disabled={isSaving}
                className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Delete Sheet"}
              </button>
            )}
          </>
        }
      />
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
            Attempt the saved recall sheet here. Signed-in users can track
            memory state per card; owners can manage cards from manage mode.
          </p>
        </div>

        <div className="columns-1 gap-4 md:columns-2 xl:columns-3 print:columns-2">
          {questions.map((question, index) => (
            <SavedRecallCard
              key={question.id}
              mode={canManageSheet ? "manage" : "view"}
              index={index}
              question={question}
              isRevealed={Boolean(revealedCards[question.id])}
              isEditing={editingCardId === question.id}
              draftQuestion={draftQuestion}
              draftAnswer={draftAnswer}
              isSaving={isSaving}
              progress={progressByCardId[question.id]}
              canTrackProgress={Boolean(session)}
              onToggle={() => handleToggleCard(question.id)}
              onStartEdit={() => handleStartEdit(question)}
              onCancelEdit={handleCancelEdit}
              onDraftQuestionChange={setDraftQuestion}
              onDraftAnswerChange={setDraftAnswer}
              onSaveEdit={() => void handleSaveEdit(question.id)}
              // onDelete={() => void handleDeleteCard(question.id)}
              onDelete={() => setDeleteCardId(question.id)}
              onTrackProgress={(input) =>
                void handleTrackProgress(question.id, input)
              }
            />
          ))}
        </div>
      </div>
      <ConfirmationModal
        isOpen={deleteSheetOpen}
        onClose={() => setDeleteSheetOpen(false)}
        onConfirm={() => void handleDeleteSheet()}
        title="Delete Recall Sheet?"
        description="This will permanently delete this sheet and all its cards. This action cannot be undone."
        confirmLabel="Delete Sheet"
        cancelLabel="Keep Sheet"
        isLoading={isSaving}
      />
      <ConfirmationModal
        isOpen={Boolean(deleteCardId)}
        onClose={() => setDeleteCardId(null)}
        onConfirm={() => {
          if (!deleteCardId) return;

          void handleDeleteCard(deleteCardId);
          setDeleteCardId(null);
        }}
        title="Delete Card?"
        description="This card will be removed from the recall sheet permanently."
        confirmLabel="Delete Card"
        cancelLabel="Keep Card"
      />
    </section>
  );
}
