import { AppShell } from "@/components/app-shell";
import { ActiveRecallSheetList } from "@/components/active-recall-sheet-list";

export default function ActiveRecallSheetsPage() {
  return (
    <AppShell>
      <section className="mb-8 rounded-[30px] border border-black/10 bg-[#1f3a2f] p-6 text-stone-50 shadow-[0_24px_100px_rgba(31,58,47,0.18)] sm:p-9">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-200 sm:text-xs sm:tracking-[0.3em]">
          Active Recall Sheets
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl">
          Open, attempt, and manage the sheets you published from the recall studio.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-200/85">
          Saved sheets now have their own backend-backed route. Use them as a focused revision flow, then prune individual cards or delete the full sheet when needed.
        </p>
      </section>
      <ActiveRecallSheetList />
    </AppShell>
  );
}
