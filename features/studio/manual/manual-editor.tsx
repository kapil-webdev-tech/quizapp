"use client";

import { ManualSetupSection } from "@/components/studio/manual/manual-setup-section";
import { questionTemplateLabels } from "@/features/studio/shared/utils/quiz-draft-utils";
import type { QuestionTemplateLabel } from "@/features/studio/shared/types";

type ManualEditorProps = {
  isAddingToSavedQuiz: boolean;
  onBack: () => void;
  onStart: (template: QuestionTemplateLabel) => void;
};

export function ManualEditor({
  isAddingToSavedQuiz,
  onBack,
  onStart,
}: ManualEditorProps) {
  return (
    <ManualSetupSection
      templates={questionTemplateLabels}
      isAddingToSavedQuiz={isAddingToSavedQuiz}
      onBack={onBack}
      onStart={onStart}
    />
  );
}
