import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { CustomResultsView } from "@/components/custom/custom-results-view";

export default function CustomResultsPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="rounded-[30px] border border-black/10 bg-white/75 p-8 text-sm text-slate-500">
            Loading results...
          </div>
        }
      >
        <CustomResultsView />
      </Suspense>
    </AppShell>
  );
}
