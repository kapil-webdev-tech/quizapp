"use client";

import { useParams, useSearchParams } from "next/navigation";
import { ResultsPanel } from "@/components/results-panel";
import { useAvailableQuiz } from "@/lib/custom-quiz-store";

export function CustomResultsView() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const { quiz, loaded, error } = useAvailableQuiz(params?.slug);

  if (!params?.slug) {
    return <div className="rounded-[30px] border border-black/10 bg-white/75 p-8 text-sm text-slate-500">Loading results...</div>;
  }

  if (!loaded) {
    return <div className="rounded-[30px] border border-black/10 bg-white/75 p-8 text-sm text-slate-500">Loading results...</div>;
  }

  if (error) {
    return <div className="rounded-[30px] border border-dashed border-rose-200 bg-rose-50 p-8 text-sm text-rose-800">{error}</div>;
  }

  if (!quiz) {
    return <div className="rounded-[30px] border border-dashed border-black/20 bg-white/75 p-8 text-sm text-slate-500">This custom quiz is no longer available in backend storage.</div>;
  }

  const answers = Object.fromEntries(searchParams.entries());

  return <ResultsPanel quiz={quiz} answers={answers} retakeHref={`/custom/${quiz.slug}`} />;
}
