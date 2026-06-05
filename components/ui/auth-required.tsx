"use client";

import Link from "next/link";

type AuthRequiredProps = {
  title?: string;
  description?: string;
  loginHref?: string;
  buttonLabel?: string;
};

export function AuthRequired({
  title = "Sign In Required",
  description = "Please sign in to access this feature.",
  loginHref = "/login",
  buttonLabel = "Sign In",
}: AuthRequiredProps) {
  return (
    <div className="rounded-[30px] border border-dashed border-black/20 bg-white/70 p-8 text-center shadow-[0_16px_60px_rgba(92,67,23,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
        {title}
      </p>

      <p className="mt-4 text-sm leading-7 text-slate-600">{description}</p>

      <Link
        href={loginHref}
        className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
      >
        {buttonLabel}
      </Link>
    </div>
  );
}
