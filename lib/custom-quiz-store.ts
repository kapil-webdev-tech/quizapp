import { useCallback, useEffect, useState } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import type { QuizSet } from "@/lib/quiz-types";
import {
  AI_JSON_SHAPE,
  generationModes,
  buildAiPrompt,
  createBlankEditableQuiz,
  editableQuizToQuiz,
  parseGeneratedQuiz,
  quizToEditableQuiz,
  slugify,
  type EditableQuestion,
  type EditableQuiz,
  type GenerationMode,
} from "@/lib/custom-quiz-schema";
import {
  emitBrowserEvent,
  getSupabaseBrowserClient,
  getSupabaseUserId,
  requireSupabaseBrowserClient,
  requireSupabaseUserId,
  useSupabaseSession,
} from "@/lib/supabase";

export {
  AI_JSON_SHAPE,
  generationModes,
  buildAiPrompt,
  createBlankEditableQuiz,
  editableQuizToQuiz,
  parseGeneratedQuiz,
  quizToEditableQuiz,
  slugify,
};
export type { EditableQuestion, EditableQuiz, GenerationMode };
export type StudioDraftMode = "ai" | "manual" | "pdf";

const CUSTOM_QUIZZES_EVENT = "custom-quizzes-updated";
const STUDIO_DRAFT_EVENT = "studio-draft-updated";
const EMPTY_QUIZZES: QuizSet[] = [];
const adminStatusCache = new Map<string, boolean>();

type DraftListener = () => void;

const requireQuizUserId = () =>
  requireSupabaseUserId("Sign in to store quizzes and drafts in the backend.");

async function isCurrentUserAdmin() {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireQuizUserId();
  const cached = adminStatusCache.get(userId);
  if (cached !== undefined) {
    return cached;
  }

  const { data, error } = await supabase
    .from("app_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const isAdmin = Boolean(data?.user_id);
  adminStatusCache.set(userId, isAdmin);
  return isAdmin;
}

function mapQuizRowToQuiz(payload: unknown) {
  const quiz = payload as Partial<QuizSet>;

  return {
    ...quiz,
    focusAreas: Array.isArray(quiz.focusAreas) ? quiz.focusAreas : [],
    isPublic: quiz.isPublic ?? false,
  } as QuizSet;
}

function isUniqueViolation(error: PostgrestError | null) {
  return error?.code === "23505";
}

function buildSaveErrorMessage(error: PostgrestError) {
  if (error.code === "42P01") {
    return "The custom_quizzes table is missing in Supabase. Apply supabase/schema.sql first.";
  }

  if (error.code === "42501") {
    return "Supabase blocked quiz saving. Check RLS policies for custom_quizzes and make sure insert/select are enabled for the signed-in user.";
  }

  return error.message;
}

function buildDeleteErrorMessage(error: PostgrestError) {
  if (error.code === "42501") {
    return "Supabase blocked quiz deletion. Check the delete policy for custom_quizzes.";
  }

  return error.message;
}

export async function fetchCustomQuizzes() {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireQuizUserId();
  const isAdmin = await isCurrentUserAdmin();

  let query = supabase
    .from("custom_quizzes")
    .select("payload")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (!isAdmin) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapQuizRowToQuiz(row.payload));
}

export async function fetchCustomQuiz(slug: string) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireQuizUserId();
  const isAdmin = await isCurrentUserAdmin();

  let query = supabase
    .from("custom_quizzes")
    .select("payload")
    .eq("slug", slug);

  if (!isAdmin) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapQuizRowToQuiz(data.payload) : null;
}

export async function fetchAvailableQuizzes() {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("custom_quizzes")
    .select("payload")
    .order("updated_at", { ascending: false })
    .limit(40);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapQuizRowToQuiz(row.payload));
}

export async function fetchAvailableQuiz(slug: string) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("custom_quizzes")
    .select("payload")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapQuizRowToQuiz(data.payload) : null;
}

export async function saveCustomQuiz(quiz: QuizSet) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireQuizUserId();
  const timestamp = new Date().toISOString();

  for (let counter = 1; counter <= 20; counter += 1) {
    const nextSlug = counter === 1 ? quiz.slug : `${quiz.slug}-${counter}`;
    const nextQuiz = { ...quiz, slug: nextSlug };

    const { error } = await supabase.from("custom_quizzes").insert({
      user_id: userId,
      slug: nextQuiz.slug,
      title: nextQuiz.title,
      category: nextQuiz.category,
      description: nextQuiz.description,
      is_public: nextQuiz.isPublic,
      payload: nextQuiz,
      updated_at: timestamp,
    });

    if (!error) {
      emitBrowserEvent(CUSTOM_QUIZZES_EVENT);
      return nextQuiz;
    }

    if (isUniqueViolation(error)) {
      continue;
    }

    throw new Error(buildSaveErrorMessage(error));
  }

  throw new Error("Unable to save quiz because all generated slug variants were already used.");
}

export async function updateCustomQuiz(existingSlug: string, quiz: QuizSet) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireQuizUserId();
  const isAdmin = await isCurrentUserAdmin();

  const nextQuiz = { ...quiz, slug: existingSlug };
  let query = supabase
    .from("custom_quizzes")
    .update({
      title: nextQuiz.title,
      category: nextQuiz.category,
      description: nextQuiz.description,
      is_public: nextQuiz.isPublic,
      payload: nextQuiz,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", existingSlug);

  if (!isAdmin) {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(buildSaveErrorMessage(error));
  }

  emitBrowserEvent(CUSTOM_QUIZZES_EVENT);
  return nextQuiz;
}

export async function updateCustomQuizVisibility(slug: string, isPublic: boolean) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireQuizUserId();
  const isAdmin = await isCurrentUserAdmin();
  let query = supabase
    .from("custom_quizzes")
    .update({
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);

  if (!isAdmin) {
    query = query.eq("user_id", userId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(buildSaveErrorMessage(error));
  }

  const existingQuiz = await fetchCustomQuiz(slug);
  if (!existingQuiz) {
    throw new Error("The quiz could not be reloaded after updating visibility.");
  }

  let payloadQuery = supabase
    .from("custom_quizzes")
    .update({
      payload: { ...existingQuiz, isPublic },
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);

  if (!isAdmin) {
    payloadQuery = payloadQuery.eq("user_id", userId);
  }

  const { error: payloadError } = await payloadQuery;

  if (payloadError) {
    throw new Error(buildSaveErrorMessage(payloadError));
  }

  emitBrowserEvent(CUSTOM_QUIZZES_EVENT);
  return { ...existingQuiz, isPublic };
}

export async function deleteCustomQuiz(slug: string) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireQuizUserId();
  const isAdmin = await isCurrentUserAdmin();
  let visibleQuery = supabase
    .from("custom_quizzes")
    .select("slug", { count: "exact", head: true })
    .eq("slug", slug);

  if (!isAdmin) {
    visibleQuery = visibleQuery.eq("user_id", userId);
  }

  const { count: visibleCount, error: visibleError } = await visibleQuery;

  if (visibleError) {
    throw new Error(buildDeleteErrorMessage(visibleError));
  }

  if (!visibleCount) {
    throw new Error("This quiz is not visible to the current signed-in user. It may already be deleted or belong to another account.");
  }

  let deleteQuery = supabase
    .from("custom_quizzes")
    .delete({ count: "exact" })
    .eq("slug", slug);

  if (!isAdmin) {
    deleteQuery = deleteQuery.eq("user_id", userId);
  }

  const { count, error } = await deleteQuery;

  if (error) {
    throw new Error(buildDeleteErrorMessage(error));
  }

  if (!count) {
    throw new Error("The quiz is visible to this session, but Supabase still blocked deletion. Your live database is likely missing the delete policy for custom_quizzes.");
  }

  emitBrowserEvent(CUSTOM_QUIZZES_EVENT);
}

export async function loadStudioDraft() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return null;
  }

  const userId = await getSupabaseUserId();
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase.from("studio_drafts").select("draft").maybeSingle();
  if (error) {
    throw new Error(error.message);
  }

  return (data?.draft as { quiz: EditableQuiz; mode: StudioDraftMode } | null) ?? null;
}

export async function saveStudioDraft(quiz: EditableQuiz | null, mode: StudioDraftMode) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return;
  }

  const userId = await getSupabaseUserId();
  if (!userId) {
    return;
  }

  if (!quiz) {
    await clearStudioDraft();
    return;
  }

  const { error } = await supabase.from("studio_drafts").upsert({
    user_id: userId,
    draft: { quiz, mode },
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(error.message);
  }

  emitBrowserEvent(STUDIO_DRAFT_EVENT);
}

export async function clearStudioDraft() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return;
  }

  const userId = await getSupabaseUserId();
  if (!userId) {
    return;
  }

  const { error } = await supabase.from("studio_drafts").delete().eq("user_id", userId);
  if (error) {
    throw new Error(error.message);
  }

  emitBrowserEvent(STUDIO_DRAFT_EVENT);
}

export function subscribeToStudioDraft(listener: DraftListener) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(STUDIO_DRAFT_EVENT, listener);
  return () => {
    window.removeEventListener(STUDIO_DRAFT_EVENT, listener);
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function useEventBackedResource<T>({
  initialValue,
  load,
  skipWhen,
  resetWhen,
  resetValue,
  errorMessage,
}: {
  initialValue: T;
  load: () => Promise<T>;
  skipWhen?: boolean;
  resetWhen?: boolean;
  resetValue: T;
  errorMessage: string;
}) {
  const [data, setData] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (skipWhen) {
      return;
    }

    if (resetWhen) {
      setData(resetValue);
      setLoaded(true);
      setError(null);
      return;
    }

    try {
      setError(null);
      setData(await load());
    } catch (refreshError) {
      setData(resetValue);
      setError(getErrorMessage(refreshError, errorMessage));
    } finally {
      setLoaded(true);
    }
  }, [errorMessage, load, resetValue, resetWhen, skipWhen]);

  useEffect(() => {
    void refresh();

    if (typeof window === "undefined") {
      return;
    }

    const handle = () => {
      void refresh();
    };

    window.addEventListener(CUSTOM_QUIZZES_EVENT, handle);
    return () => {
      window.removeEventListener(CUSTOM_QUIZZES_EVENT, handle);
    };
  }, [refresh]);

  return { data, loaded, error, refresh };
}

export function useCustomQuizzes() {
  const { session, loaded: sessionLoaded } = useSupabaseSession();
  const { data: quizzes, loaded, error, refresh } = useEventBackedResource({
    initialValue: EMPTY_QUIZZES,
    load: fetchCustomQuizzes,
    skipWhen: !sessionLoaded,
    resetWhen: !session,
    resetValue: EMPTY_QUIZZES,
    errorMessage: "Unable to load custom quizzes.",
  });

  return { quizzes, loaded, error, refresh };
}

export function useAvailableQuizzes() {
  const { data: quizzes, loaded, error, refresh } = useEventBackedResource({
    initialValue: EMPTY_QUIZZES,
    load: fetchAvailableQuizzes,
    resetValue: EMPTY_QUIZZES,
    errorMessage: "Unable to load available quizzes.",
  });

  return { quizzes, loaded, error, refresh };
}

export function useCustomQuiz(slug?: string) {
  const { session, loaded: sessionLoaded } = useSupabaseSession();
  const load = useCallback(() => fetchCustomQuiz(slug as string), [slug]);
  const { data: quiz, loaded, error, refresh } = useEventBackedResource({
    initialValue: null as QuizSet | null,
    load,
    skipWhen: !sessionLoaded,
    resetWhen: !session || !slug,
    resetValue: null as QuizSet | null,
    errorMessage: "Unable to load custom quiz.",
  });

  return { quiz, loaded, error, refresh };
}

export function useAvailableQuiz(slug?: string) {
  const load = useCallback(() => fetchAvailableQuiz(slug as string), [slug]);
  const { data: quiz, loaded, error, refresh } = useEventBackedResource({
    initialValue: null as QuizSet | null,
    load,
    resetWhen: !slug,
    resetValue: null as QuizSet | null,
    errorMessage: "Unable to load quiz.",
  });

  return { quiz, loaded, error, refresh };
}
