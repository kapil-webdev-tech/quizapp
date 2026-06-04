import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { ManualQuestionStudio } from "@/features/studio/manual/manual-question-studio";
import { LoadingState } from "@/features/studio/shared/components/loading-state";

export default function StudioManualPage() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState label="Loading manual studio..." />}>
        <ManualQuestionStudio />
      </Suspense>
    </AppShell>
  );
}
