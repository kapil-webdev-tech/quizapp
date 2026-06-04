"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setHasRecoverySession(Boolean(data.session));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setHasRecoverySession(Boolean(session));
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        throw updateError;
      }

      setStatus("Password updated successfully. Redirecting to login...");
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (updatePasswordError) {
      setError(
        updatePasswordError instanceof Error
          ? updatePasswordError.message
          : "Unable to update password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[34px] border border-black/10 bg-white/85 p-7 shadow-[0_18px_80px_rgba(108,77,23,0.1)] sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
        Reset Password
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">
        Choose a new password for your account.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
        Open this page from the reset link in your email, then save your new
        password here.
      </p>

      {!hasRecoverySession ? (
        <div className="mt-8 rounded-2xl border border-dashed border-black/15 bg-stone-50 px-4 py-4 text-sm leading-7 text-slate-600">
          No active recovery session was detected. Open the latest reset link
          from your email, or go back and request a new one.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-8 max-w-xl space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            New Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            placeholder="Enter a new password"
            className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Confirm New Password
          </span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={6}
            placeholder="Re-enter the new password"
            className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!isConfigured || !hasRecoverySession || isSubmitting}
          >
            {isSubmitting ? "Updating Password..." : "Update Password"}
          </Button>
          <Link
            href="/login"
            className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-stone-100"
          >
            Back To Login
          </Link>
        </div>
      </form>

      {status ? (
        <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {status}
        </p>
      ) : null}
      {error ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}
