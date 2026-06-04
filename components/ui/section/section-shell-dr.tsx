import { ReactNode } from "react";
import { useRouter } from "next/navigation";

type SectionShellProps = {
  title: string;
  description: string;
  children: ReactNode;

  // common controls
  backHref?: string;
  backLabel?: string;

  draftAction?: {
    show: boolean;
    label: string;
    onClick: () => void;
  };

  badges?: string[];

  aside?: ReactNode;
};

export default function SectionShell({
  title,
  description,
  children,
  backHref,
  backLabel = "Back",
  draftAction,
  badges = [],
  aside,
}: SectionShellProps) {
  const router = useRouter();

  return (
    <section className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_70px_rgba(102,73,24,0.08)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">
              {title}
            </h2>

            {badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-black/10 bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700"
              >
                {badge}
              </span>
            ))}
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {backHref ? (
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-stone-100"
            >
              {backLabel}
            </button>
          ) : null}

          {draftAction?.show ? (
            <button
              type="button"
              onClick={draftAction.onClick}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
            >
              {draftAction.label}
            </button>
          ) : null}

          {aside}
        </div>
      </div>

      {children}
    </section>
  );
}