type StudioHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function StudioHeader({
  eyebrow,
  title,
  description,
}: StudioHeaderProps) {
  return (
    <header className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_20px_70px_rgba(15,23,42,0.06)] sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
        {description}
      </p>
    </header>
  );
}
