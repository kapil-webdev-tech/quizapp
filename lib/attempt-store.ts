import {
  getSupabaseBrowserClient,
  getSupabaseUserId,
} from "@/lib/supabase";
import type { StoredAttempt } from "@/lib/quiz";

export async function loadAttempts() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return [];
  }

  const userId = await getSupabaseUserId();
  if (!userId) {
    return [];
  }

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("quiz_slug, completed_at, score_percent, correct, total, category, title, answers_query")
    .order("completed_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return [];
  }

  return data.map((item) => ({
    quizSlug: item.quiz_slug,
    completedAt: item.completed_at,
    scorePercent: item.score_percent,
    correct: item.correct,
    total: item.total,
    category: item.category,
    title: item.title,
    answersQuery: item.answers_query,
    synced: true,
  } satisfies StoredAttempt));
}

export async function saveAttempt(attempt: StoredAttempt) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return;
  }

  const userId = await getSupabaseUserId();
  if (!userId) {
    return;
  }

  await supabase.from("quiz_attempts").insert({
    user_id: userId,
    quiz_slug: attempt.quizSlug,
    completed_at: attempt.completedAt,
    score_percent: attempt.scorePercent,
    correct: attempt.correct,
    total: attempt.total,
    category: attempt.category,
    title: attempt.title,
    answers_query: attempt.answersQuery,
  });
}
