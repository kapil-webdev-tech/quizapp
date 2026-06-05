"use client";

import Link from "next/link";
import type { ActiveRecallSheetRecord } from "@/lib/active-recall-store";
import { formatIndianDate } from "@/lib/utils";

type ActiveRecallSheetCardProps = {
  sheet: ActiveRecallSheetRecord;
};

export function ActiveRecallSheetCard({
  sheet,
}: ActiveRecallSheetCardProps) {
  return (
    <article className="rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_14px_50px_rgba(108,78,26,0.08)]">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-950">
          {sheet.subject}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
          {sheet.sheet.questions.length} Cards
        </span>

        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800">
          {sheet.visibility}
        </span>
      </div>

      <h2 className="mt-4 text-2xl font-semibold text-slate-900">
        {sheet.topic}
      </h2>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        Published {formatIndianDate(sheet.createdAt)}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/active-recall/${sheet.id}`}
          className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
        >
          Open Sheet
        </Link>

        <Link
          href={`/active-recall/${sheet.id}/manage`}
          className="rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
        >
          Manage Sheet
        </Link>
      </div>
    </article>
  );
}