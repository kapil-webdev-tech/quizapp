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
import { cn } from "@/lib/cn";
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
  const questionWrapClass = cn(
    "relative transition-all duration-300",
    question.question.length > 250 && "max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
  );
  const answerWrapClass = cn(
    "relative transition-all duration-300",
    question.answer.length > 250 && "max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
  );
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
    <div className="group mb-5 break-inside-avoid rounded-[32px] [perspective:2000px] print:mb-3">
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
        <div className="grid rounded-[32px] [transform-style:preserve-3d]">
          {/* Front of card */}
          <div
            className={`relative col-start-1 row-start-1 rounded-[32px] border border-white/40 bg-white/60 p-5 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.12)] backdrop-blur-2xl [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] print:hidden sm:p-6 ${
              isRevealed
                ? "pointer-events-none opacity-0 [transform:rotateY(-180deg)_scale(0.95)]"
                : "opacity-100 [transform:rotateY(0deg)_scale(1)] group-hover:shadow-[0_48px_80px_-20px_rgba(15,23,42,0.18)] group-hover:[transform:translateY(-4px)]"
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.5),transparent)] rounded-[32px] pointer-events-none" />
            <div
              className={`absolute left-0 top-10 bottom-10 w-1 rounded-r-full transition-all duration-500 shadow-[0_0_12px_rgba(0,0,0,0.05)] ${accentColor}`}
            />
            <div className="relative flex flex-col justify-start gap-5 sm:gap-6">
              <RecallCardHeader
                mode={mode}
                side="question"
                index={index}
                badgeClassName="bg-slate-900 shadow-xl shadow-slate-900/10"
                labelClassName="bg-white/50 text-slate-500 border border-black/[0.03] backdrop-blur-md"
                isSaving={isSaving}
                onStartEdit={onStartEdit}
                onDelete={onDelete}
              />
              <div className={questionWrapClass}>
                <p className="break-words whitespace-pre-wrap text-lg font-extrabold leading-relaxed text-slate-950 tracking-tight sm:text-2xl">
                  {question.question}
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400/60 sm:tracking-[0.3em]">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <span className="shrink-0">Tap to reveal</span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              </div>
            </div>
          </div>
          {/* Back of card */}
          <div
            className={`col-start-1 row-start-1 rounded-[32px] border border-white/60 bg-emerald-50/50 p-5 shadow-[0_40px_80px_-20px_rgba(16,185,129,0.15)] backdrop-blur-3xl [backface-visibility:hidden] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] print:hidden sm:p-6 ${
              isRevealed
                ? "opacity-100 [transform:rotateY(0deg)_scale(1)]"
                : "pointer-events-none opacity-0 [transform:rotateY(180deg)_scale(0.95)]"
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.6),transparent)] rounded-[32px] pointer-events-none" />
            <div className="relative flex flex-col justify-start gap-5 sm:gap-6">
              <RecallCardHeader
                mode={mode}
                side="answer"
                index={index}
                badgeClassName="bg-emerald-900 shadow-xl shadow-emerald-900/20"
                labelClassName="bg-emerald-100/60 text-emerald-800 border border-emerald-200/50 backdrop-blur-md"
                isSaving={isSaving}
                onStartEdit={onStartEdit}
                onDelete={onDelete}
              />

              <div className={answerWrapClass}>
                <p className="break-words whitespace-pre-wrap text-lg font-extrabold leading-relaxed text-slate-950 tracking-tight sm:text-2xl">
                  {question.answer}
                </p>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-700/50 sm:tracking-[0.3em]">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />
                <span className="shrink-0">Tap to flip</span>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />
              </div>

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
              className="rounded-full border border-black/10 bg-white/80 backdrop-blur-md px-4 py-2 text-sm font-bold text-slate-800 transition-all hover:bg-white hover:shadow-lg"
            >
              ← Back
            </Link>

            <div className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-700 backdrop-blur-md">
              {revealedCount} / {questions.length} Revealed
            </div>

            <div className="hidden sm:block rounded-full bg-white/80 border border-black/5 px-4 py-2 text-sm font-bold text-slate-700 backdrop-blur-md">
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
              className="rounded-full font-bold shadow-sm whitespace-nowrap px-3 sm:px-4"
            >
              Show All
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleHideAll}
              className="rounded-full font-bold bg-white/80 backdrop-blur-sm whitespace-nowrap px-3 sm:px-4"
            >
              Hide All
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleShuffle}
              className="rounded-full font-bold bg-white/80 backdrop-blur-sm whitespace-nowrap px-3 sm:px-4"
            >
              Shuffle
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              className="rounded-full font-bold bg-white/80 backdrop-blur-sm whitespace-nowrap px-3 sm:px-4"
            >
              Print
            </Button>

            {canManageSheet && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => void handleToggleVisibility()}
                disabled={isSaving}
                className="rounded-full font-bold border-emerald-200 bg-emerald-50 text-emerald-800 transition hover:bg-emerald-100 whitespace-nowrap px-3 sm:px-4"
              >
                {record.visibility === "public"
                  ? "Make Private"
                  : "Publish"}
              </Button>
            )}

            {canManageSheet && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => setDeleteSheetOpen(true)}
                disabled={isSaving}
                className="rounded-full font-bold whitespace-nowrap px-3 sm:px-4"
              >
                Delete
              </Button>
            )}
          </>
        }
      />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8 print:max-w-none print:px-0 print:py-0">
        {status ? (
          <p className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-2 print:hidden">
            {status}
          </p>
        ) : null}
        {error ? (
          <p className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800 shadow-sm animate-in fade-in slide-in-from-top-2 print:hidden">
            {error}
          </p>
        ) : null}

        <div className="relative mb-8 overflow-hidden rounded-[32px] border border-black/5 bg-white p-6 shadow-[0_32px_64px_-16px_rgba(15,23,42,0.08)] print:mb-4 print:break-inside-avoid print:rounded-[18px] print:border print:px-4 print:py-4 print:shadow-none sm:p-8">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
          
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">
                {record.subject}
              </span>
              <span className="rounded-full bg-slate-100/80 border border-black/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                {normalizeQuestionCountLabel(questions.length)}
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-extrabold text-slate-950 tracking-tight sm:text-5xl print:text-2xl">
              {record.topic}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-500 print:hidden">
              Master your knowledge with active recall. Owners can manage cards, 
              while everyone can track memory progress per card.
            </p>
          </div>
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
