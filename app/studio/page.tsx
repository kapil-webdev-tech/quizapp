import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { StudioEntry } from "@/features/studio/components/entry/studio-entry";
// import { StudioEntry } from "@/components/studio/shared/studio-entry";

export default function StudioPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="rounded-[28px] border border-black/10 bg-white/80 p-6 text-sm text-slate-500 shadow-[0_18px_70px_rgba(102,73,24,0.08)]">
            Loading AI studio...
          </div>
        }
      >
        <StudioEntry />
      </Suspense>
    </AppShell>
  );
}
