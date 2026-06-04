"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export function AuthStatus() {
  const [session, setSession] = useState<Session | null>(null);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  }

  if (!isConfigured) {
    return (
      <div className="rounded-full border border-dashed border-black/15 bg-white px-4 py-2 text-xs font-medium text-slate-500">
        Guest mode
      </div>
    );
  }

  if (!session) {
    return (
      <Link href="/login" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-slate-600">
        {session.user.email}
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={handleSignOut}>
        Sign Out
      </Button>
    </div>
  );
}
