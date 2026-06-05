"use client";

export function RecallStats({
  publishedCount,
  lastPreviewCount,
  editorCount,
  isDirty,
}: {
  publishedCount: number;
  lastPreviewCount: number;
  editorCount: number;
  isDirty: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[460px]">
      <div className="rounded-[24px] border border-white/60 bg-white/75 px-4 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Published
        </p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">
          {publishedCount}
        </p>
      </div>
      <div className="rounded-[24px] border border-white/60 bg-white/75 px-4 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Editor Cards
        </p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">
          {editorCount}
        </p>
      </div>
      <div className="rounded-[24px] border border-white/60 bg-white/75 px-4 py-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
          Last Preview
        </p>
        <p className="mt-2 text-3xl font-semibold text-slate-950">
          {lastPreviewCount}
        </p>
        <p className="mt-1 text-xs font-semibold text-amber-700">
          {isDirty ? "Unsaved edits" : "Synced"}
        </p>
      </div>
    </div>
  );
}
