import type { ReactNode } from "react";

type ActionCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
};

export function ActionCard({
  eyebrow,
  title,
  description,
  onClick,
  children,
  className,
}: ActionCardProps) {
  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-2xl font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      {children}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={
          className ??
          "rounded-[24px] border border-black/10 bg-stone-50 p-6 text-left transition hover:bg-white hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)]"
        }
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={
        className ??
        "rounded-[24px] border border-black/10 bg-stone-50 p-6"
      }
    >
      {content}
    </div>
  );
}
