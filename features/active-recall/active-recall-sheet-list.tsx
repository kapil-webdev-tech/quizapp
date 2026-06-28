"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchActiveRecallSheets,
  type ActiveRecallSheetRecord,
} from "@/lib/active-recall-store";
import { useSupabaseSession } from "@/lib/supabase";
import { Loader } from "@/components/ui/loader";
import { ActiveRecallSheetCard } from "./active-recall-sheet-card";
import { AuthRequired } from "@/components/ui/auth-required";

export function ActiveRecallSheetList() {
  const { session, loaded: sessionLoaded } = useSupabaseSession();
  const [sheets, setSheets] = useState<ActiveRecallSheetRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("effect", {
      sessionLoaded,
      hasSession: !!session,
    });
    if (!sessionLoaded || !session) {
      return;
    }

    let active = true;

    // if (!session) {
    //   return;
    // }

    void fetchActiveRecallSheets()
      .then((nextSheets) => {
        if (!active) return;
        setSheets(nextSheets);
        setLoaded(true);
      })
      .catch((loadError) => {
        if (!active) return;
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
    return <Loader message=" Loading saved active recall sheets..." />;
  }

  if (!session) {
    return (
      <AuthRequired description="Sign in to open and attempt the sheets you publish from the studio." />
    );
  }

  if (!loaded) {
    return <Loader message="Loading saved active recall sheets..." />;
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
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          No Recall Sheets Yet
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-slate-900">
          Publish your first sheet from the active recall studio.
        </h2>
        <Link
          href="/studio/active-recall"
          className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Open Recall Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {sheets.map((sheet) => (
          <ActiveRecallSheetCard key={sheet.id} sheet={sheet} />
        ))}
      </div>
    </div>
  );
}
