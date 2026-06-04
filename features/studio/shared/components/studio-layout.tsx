"use client";

import type { ReactNode } from "react";
import { StudioStatusBar } from "@/components/studio/layout/studio-status-bar";
import type { StudioView } from "../types";

type StudioLayoutProps = {
  title: string;
  description: string;
  activeView: StudioView;
  stats: Array<{ label: string; value: string }> | null;
  providerLabel?: string;
  message: string | null;
  error: string | null;
  sessionLoaded: boolean;
  hasSession: boolean;
  hasEditorQuiz: boolean;
  hasDraftData: boolean;
  editingSlug: string | null;
  isClearingDraft: boolean;
  onClearDraft: () => void;
  onNavigateSetup: () => void;
  onNavigateEditor: () => void;
  onNavigatePreview: () => void;
  children: ReactNode;
};

export function StudioLayout({
  title,
  description,
  activeView,
  stats,
  providerLabel = "Not Needed",
  message,
  error,
  sessionLoaded,
  hasSession,
  hasEditorQuiz,
  hasDraftData,
  editingSlug,
  isClearingDraft,
  onClearDraft,
  onNavigateSetup,
  onNavigateEditor,
  onNavigatePreview,
  children,
}: StudioLayoutProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <aside className="rounded-[28px] border border-black/10 bg-[#1f3a2f] p-5 text-stone-50 shadow-[0_24px_100px_rgba(31,58,47,0.22)] sm:p-6 xl:sticky xl:top-6 xl:h-fit">
        <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200">
          AI Question Studio
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-stone-200/85">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <StepChip
            label="1. Setup"
            active={activeView === "setup"}
            onClick={onNavigateSetup}
          />
          <StepChip
            label="2. Editor"
            active={activeView === "editor"}
            disabled={!hasEditorQuiz}
            onClick={onNavigateEditor}
          />
          <StepChip
            label="3. Preview"
            active={activeView === "preview"}
            disabled={!hasEditorQuiz}
            onClick={onNavigatePreview}
          />
        </div>

        <div className="mt-6 grid gap-3">
          <StatPill label="Provider" value={providerLabel} />
          <StatPill
            label="Draft Size"
            value={hasEditorQuiz ? "Editable draft" : "No draft"}
          />
        </div>

        {stats ? (
          <div className="mt-6 grid gap-3">
            {stats.map((stat) => (
              <StatPill key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </div>
        ) : null}
      </aside>

      <div className="space-y-4">
        <StudioStatusBar
          message={message}
          error={error}
          sessionLoaded={sessionLoaded}
          hasSession={hasSession}
          hasEditorQuiz={hasEditorQuiz}
          hasDraftData={hasDraftData}
          editingSlug={editingSlug}
          isClearingDraft={isClearingDraft}
          onClearDraft={onClearDraft}
        />
        {children}
      </div>
    </div>
  );
}

function StepChip({
  label,
  active,
  disabled,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active
          ? "bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]"
          : "border border-black/10 bg-white text-slate-500"
      } ${disabled ? "cursor-not-allowed opacity-45" : "transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white"}`}
      aria-current={active ? "step" : undefined}
    >
      {label}
    </button>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
