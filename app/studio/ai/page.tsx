import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { AiQuestionStudio } from "@/features/studio/ai/ai-question-studio";
import { LoadingState } from "@/features/studio/shared/components/loading-state";

export default function StudioAiPage() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState label="Loading AI studio..." />}>
        <AiQuestionStudio />
      </Suspense>
    </AppShell>
  );
}
