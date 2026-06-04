import { createClient, type Session, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

let browserClient: SupabaseClient | null | undefined;

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (browserClient !== undefined) {
    return browserClient;
  }

  browserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
  );

  return browserClient;
}

export async function getSupabaseSession() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}

export function requireSupabaseBrowserClient(message = "Supabase is not configured.") {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(message);
  }

  return supabase;
}

export async function getSupabaseUserId() {
  const session = await getSupabaseSession();
  return session?.user.id ?? null;
}

export async function requireSupabaseUserId(message: string) {
  const userId = await getSupabaseUserId();
  if (!userId) {
    throw new Error(message);
  }

  return userId;
}

export function emitBrowserEvent(name: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(name));
}

export function useSupabaseSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(!isSupabaseConfigured());

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setSession(data.session);
      setLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoaded(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loaded };
}
