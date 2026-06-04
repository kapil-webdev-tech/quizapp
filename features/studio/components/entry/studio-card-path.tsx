import Link from "next/link";

type StudioPathCardProps = {
  label: string;
  title: string;
  description: string;
  onClick?: () => void;
  href?: string;
};

export function StudioPathCard({
  label,
  title,
  description,
  onClick,
  href,
}: StudioPathCardProps) {
  const classes =
    "rounded-[28px] border border-black/10 bg-stone-50 p-6 text-left transition hover:bg-white hover:shadow-[0_16px_48px_rgba(15,23,42,0.08)]";

  const content = (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>

      <h3 className="mt-4 text-2xl font-semibold text-slate-950">{title}</h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
