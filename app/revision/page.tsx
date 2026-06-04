import { AppShell } from "@/components/app-shell";
import { RevisionLog } from "@/components/revision-log";

export default function RevisionPage() {
  return (
    <AppShell>
      <section className="mb-6 rounded-[24px] border border-black/10 bg-[#1f3a2f] p-5 text-stone-50 shadow-[0_24px_100px_rgba(31,58,47,0.18)] sm:mb-8 sm:rounded-[34px] sm:p-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200 sm:text-xs sm:tracking-[0.3em]">Revision Log</p>
        <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight sm:text-4xl">Track recent attempts and revisit weak zones immediately.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-200/85">
          Attempt history is now stored in the backend for the signed-in user, so revision data is not kept in local browser storage.
        </p>
      </section>
      <RevisionLog />
    </AppShell>
  );
}
