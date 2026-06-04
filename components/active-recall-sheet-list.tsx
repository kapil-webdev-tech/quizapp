"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchActiveRecallSheets,
  type ActiveRecallSheetRecord,
} from "@/lib/active-recall-store";
import { useSupabaseSession } from "@/lib/supabase";

export function ActiveRecallSheetList() {
  const { session, loaded: sessionLoaded } = useSupabaseSession();
  const [sheets, setSheets] = useState<ActiveRecallSheetRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoaded) {
      return;
    }

    let active = true;

    if (!session) {
      return;
    }

    void fetchActiveRecallSheets()
      .then((nextSheets) => {
        if (!active) {
          return;
        }

        setSheets(nextSheets);
        setLoaded(true);
      })
      .catch((loadError) => {
        if (!active) {
          return;
        }

        setSheets([]);
        setLoaded(true);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load active recall sheets.",
        );
      });

    return () => {
      active = false;
    };
  }, [session, sessionLoaded]);

  if (!sessionLoaded) {
    return (
      <div className="rounded-[30px] border border-black/10 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
        <p className="text-sm text-slate-500">Loading saved active recall sheets...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-[30px] border border-dashed border-black/20 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Sign In Required</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">Saved recall sheets live in the backend.</h2>
        <p className="mt-4 text-sm leading-7 text-slate-600">Sign in to open and attempt the sheets you publish from the studio.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
          Sign In
        </Link>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="rounded-[30px] border border-black/10 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
        <p className="text-sm text-slate-500">Loading saved active recall sheets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[30px] border border-dashed border-rose-200 bg-rose-50 p-8 text-center">
        <p className="text-sm text-rose-800">{error}</p>
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <div className="rounded-[30px] border border-dashed border-black/20 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">No Recall Sheets Yet</p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">Publish your first sheet from the active recall studio.</h2>
        <Link href="/studio/active-recall" className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
          Open Recall Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {sheets.map((sheet) => (
          <article key={sheet.id} className="rounded-[28px] border border-black/10 bg-white/85 p-6 shadow-[0_14px_50px_rgba(108,78,26,0.08)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-950">
                {sheet.subject}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                {sheet.sheet.questions.length} Cards
              </span>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900">{sheet.topic}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Published {new Date(sheet.createdAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Kolkata",
              })}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={`/active-recall/${sheet.id}`} className="rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
                Open Sheet
              </Link>
              <Link href="/studio/active-recall" className="rounded-full border border-black/10 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100">
                Manage In Studio
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
