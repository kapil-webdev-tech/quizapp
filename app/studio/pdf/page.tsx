import { Suspense } from "react";
import { AppShell } from "@/components/app-shell";
import { PdfQuestionStudio } from "@/features/studio/pdf/pdf-question-studio";
import { LoadingState } from "@/features/studio/shared/components/loading-state";

export default function StudioPdfPage() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState label="Loading PDF studio..." />}>
        <PdfQuestionStudio />
      </Suspense>
    </AppShell>
  );
}
