import { ReactNode } from "react";

export default function SectionShell({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_18px_70px_rgba(102,73,24,0.08)] sm:p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
