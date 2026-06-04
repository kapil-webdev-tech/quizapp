"use client";

import { FormEvent, useState } from "react";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
  useSupabaseSession,
} from "@/lib/supabase";
import { Button } from "@/components/ui/button";

type AuthMode = "sign-in" | "sign-up";
const ADMIN_LOGIN_ALIAS = "admin";
const ADMIN_LOGIN_EMAIL = "admin@quizlab.local";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeAuthIdentifier(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === ADMIN_LOGIN_ALIAS) {
    return ADMIN_LOGIN_EMAIL;
  }

  return normalizedValue;
}

function getDisplayName(email: string | undefined, metadata: Record<string, unknown> | undefined) {
  const candidate =
    typeof metadata?.full_name === "string"
      ? metadata.full_name
      : typeof metadata?.name === "string"
        ? metadata.name
        : typeof metadata?.user_name === "string"
          ? metadata.user_name
          : typeof metadata?.preferred_username === "string"
            ? metadata.preferred_username
            : null;

  if (candidate && candidate.trim()) {
    return candidate.trim();
  }

  if (!email) {
    return "Quiz Lab User";
  }

  const localPart = email.split("@")[0] ?? "user";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [isStartingGoogleSignIn, setIsStartingGoogleSignIn] = useState(false);
  const isConfigured = isSupabaseConfigured();
  const { session, loaded } = useSupabaseSession();

  const displayName = getDisplayName(
    session?.user.email,
    session?.user.user_metadata as Record<string, unknown> | undefined,
  );
  const authProvider =
    typeof session?.user.app_metadata?.provider === "string"
      ? session.user.app_metadata.provider
      : "email";

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
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

    setIsSubmitting(true);

    try {
      if (mode === "sign-in") {
        const normalizedEmail = normalizeAuthIdentifier(email);

        if (!isEmail(normalizedEmail)) {
          throw new Error("Enter a valid email address.");
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (signInError) {
          throw signInError;
        }

        setStatus("Signed in successfully. Your quizzes and drafts are now synced.");
        setEmail("");
        setPassword("");
        return;
      }

      const normalizedEmail = normalizeAuthIdentifier(email);

      if (!isEmail(normalizedEmail)) {
        throw new Error("Enter a valid email address.");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/subjects`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      setStatus(
        "Account created. If email confirmation is enabled in Supabase, confirm your email before signing in.",
      );
      setEmail("");
      setPassword("");
      setMode("sign-in");
      setEmail(normalizedEmail);
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Authentication failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMagicLink() {
    setError(null);
    setStatus(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    const fallbackEmail = normalizeAuthIdentifier(email);

    if (!isEmail(fallbackEmail)) {
      setError("Enter a valid email to receive a magic link.");
      return;
    }

    setIsSendingMagicLink(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: fallbackEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/subjects`,
        },
      });

      if (signInError) {
        throw signInError;
      }

      setStatus("Magic link sent. Open it from your email to sign in.");
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Unable to send magic link.",
      );
    } finally {
      setIsSendingMagicLink(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setStatus(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    setIsStartingGoogleSignIn(true);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/subjects`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (oauthError) {
        throw oauthError;
      }
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Unable to start Google sign in.",
      );
      setIsStartingGoogleSignIn(false);
    }
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    setError(null);
    setStatus(null);
    await supabase.auth.signOut();
  }

  async function handleForgotPassword() {
    setError(null);
    setStatus(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      );
      return;
    }

    const normalizedEmail = normalizeAuthIdentifier(email);

    if (!isEmail(normalizedEmail)) {
      setError("Enter your account email first to receive a password reset link.");
      return;
    }

    setIsSendingResetLink(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        },
      );

      if (resetError) {
        throw resetError;
      }

      setStatus("Password reset link sent. Open the email and choose a new password.");
    } catch (authError) {
      setError(
        authError instanceof Error
          ? authError.message
          : "Unable to send password reset link.",
      );
    } finally {
      setIsSendingResetLink(false);
    }
  }

  if (!loaded) {
    return (
      <div className="rounded-[34px] border border-black/10 bg-white/85 p-7 text-sm text-slate-500 shadow-[0_18px_80px_rgba(108,77,23,0.1)] sm:p-9">
        Loading account details...
      </div>
    );
  }

  if (session) {
    return (
      <div className="rounded-[34px] border border-black/10 bg-white/85 p-7 shadow-[0_18px_80px_rgba(108,77,23,0.1)] sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
          Account
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-900">
          Profile
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
          Basic details from your signed-in account are shown below.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-black/10 bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Name
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{displayName}</p>
          </div>
          <div className="rounded-[24px] border border-black/10 bg-white px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Email
            </p>
            <p className="mt-3 break-all text-lg font-semibold text-slate-900">
              {session.user.email ?? "No email available"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-black/10 bg-stone-50 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Sign-in Method
          </p>
          <p className="mt-3 text-sm font-medium capitalize text-slate-700">
            {authProvider}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => void handleSignOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[34px] border border-black/10 bg-white/85 p-7 shadow-[0_18px_80px_rgba(108,77,23,0.1)] sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
        Account
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">
        Sign in with Google, password, or magic link.
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
        Saved quizzes, studio drafts, and revision history are stored in
        Supabase for the signed-in user instead of local browser storage.
      </p>

      <div className="mt-8 max-w-xl">
        <Button
          type="button"
          variant="secondary"
          fullWidth
          className="rounded-2xl text-slate-900 hover:bg-stone-50"
          onClick={() => void handleGoogleSignIn()}
          disabled={!isConfigured || isStartingGoogleSignIn}
        >
          {isStartingGoogleSignIn ? "Redirecting To Google..." : "Continue With Google"}
        </Button>
        <p className="mt-3 text-xs leading-6 text-slate-500">
          Enable the Google provider in Supabase Auth and add your app URL to the allowed redirect URLs.
        </p>
      </div>

      <div className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        <span className="h-px flex-1 bg-black/10" />
        <span>Or use email</span>
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <div className="mt-8 inline-flex rounded-full border border-black/10 bg-stone-100 p-1">
        <button
          type="button"
          onClick={() => {
            setMode("sign-in");
            setError(null);
            setStatus(null);
          }}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "sign-in"
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-white"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("sign-up");
            setError(null);
            setStatus(null);
          }}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            mode === "sign-up"
              ? "bg-slate-900 text-white"
              : "text-slate-700 hover:bg-white"
          }`}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handlePasswordSubmit} className="mt-6 max-w-xl space-y-4">
        {mode === "sign-in" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="aspirant@example.com"
              className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
            <p className="mt-2 text-xs leading-6 text-slate-500">
              Use the same email for both sign up and password sign in.
            </p>
          </label>
        ) : (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="aspirant@example.com"
              className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-black/10 bg-stone-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!isConfigured || isSubmitting}
          >
            {isSubmitting
              ? mode === "sign-in"
                ? "Signing In..."
                : "Creating Account..."
              : mode === "sign-in"
                ? "Sign In With Password"
                : "Create Account"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleMagicLink()}
            disabled={!isConfigured || isSendingMagicLink}
          >
            {isSendingMagicLink ? "Sending Link..." : "Use Magic Link Instead"}
          </Button>
          {mode === "sign-in" ? (
            <button
              type="button"
              onClick={() => void handleForgotPassword()}
              disabled={!isConfigured || isSendingResetLink}
              className="text-sm font-semibold text-slate-700 transition hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSendingResetLink ? "Sending Reset Link..." : "Forgot Password?"}
            </button>
          ) : null}
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
