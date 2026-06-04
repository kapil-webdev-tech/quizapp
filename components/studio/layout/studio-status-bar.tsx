type StudioStatusBarProps = {
  message: string | null;
  error: string | null;
  sessionLoaded: boolean;
  hasSession: boolean;
  hasEditorQuiz: boolean;
  hasDraftData: boolean;
  editingSlug: string | null;
  isClearingDraft: boolean;
  onClearDraft: () => void;
};

export function StudioStatusBar({
  message,
  error,
  sessionLoaded,
  hasSession,
  hasEditorQuiz,
  hasDraftData,
  editingSlug,
  isClearingDraft,
  onClearDraft,
}: StudioStatusBarProps) {
  return (
    <>
      {message ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      {!sessionLoaded ? (
        <p className="rounded-2xl bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
          Checking account session...
        </p>
      ) : null}
      {sessionLoaded && !hasSession ? (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Sign in to save drafts, quizzes, and attempt history in the backend.
          API keys are never stored in local storage.
        </p>
      ) : null}
      {hasSession && hasEditorQuiz ? (
        <DraftStatus
          label={
            editingSlug
              ? "You are editing a saved backend quiz set. Save will update the existing set."
              : "Draft autosaves to your backend workspace while you edit."
          }
          hasDraftData={hasDraftData}
          isClearingDraft={isClearingDraft}
          onClearDraft={onClearDraft}
        />
      ) : hasDraftData ? (
        <DraftStatus
          label="Draft data is active in this browser session."
          hasDraftData={hasDraftData}
          isClearingDraft={isClearingDraft}
          onClearDraft={onClearDraft}
        />
      ) : null}
    </>
  );
}

function DraftStatus({
  label,
  hasDraftData,
  isClearingDraft,
  onClearDraft,
}: {
  label: string;
  hasDraftData: boolean;
  isClearingDraft: boolean;
  onClearDraft: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
      <span>{label}</span>
      <button
        type="button"
        onClick={onClearDraft}
        disabled={!hasDraftData || isClearingDraft}
        className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold normal-case tracking-normal text-slate-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isClearingDraft ? "Clearing..." : "Clear Draft"}
      </button>
    </div>
  );
}
