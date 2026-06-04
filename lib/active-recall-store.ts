import { PostgrestError } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient,
  requireSupabaseBrowserClient,
  requireSupabaseUserId,
} from "@/lib/supabase";

export type StoredRecallQuestion = {
  question: string;
  answer: string;
};

export type StoredRecallSheet = {
  topic: string;
  questions: StoredRecallQuestion[];
};

export type ActiveRecallSheetRecord = {
  id: string;
  subject: string;
  topic: string;
  prompt: string;
  sheet: StoredRecallSheet;
  createdAt: string;
  updatedAt: string;
};

function buildRecallSaveErrorMessage(error: PostgrestError) {
  if (error.code === "42P01") {
    return "The active_recall_sheets table is missing in Supabase. Apply supabase/schema.sql first.";
  }

  if (error.code === "42501") {
    return "Supabase blocked recall sheet saving. Check RLS policies for active_recall_sheets.";
  }

  return error.message;
}

const requireRecallUserId = () =>
  requireSupabaseUserId("Sign in to store active recall sheets in the backend.");

export async function fetchActiveRecallSheetCount() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return 0;
  }

  const userId = await requireRecallUserId();
  const { count, error } = await supabase
    .from("active_recall_sheets")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }

  return count ?? 0;
}

function mapRecallSheetRow(row: {
  id: string;
  subject: string;
  topic: string;
  prompt: string;
  payload: unknown;
  created_at: string;
  updated_at: string;
}) {
  return {
    id: row.id,
    subject: row.subject,
    topic: row.topic,
    prompt: row.prompt,
    sheet: row.payload as StoredRecallSheet,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies ActiveRecallSheetRecord;
}

export async function fetchActiveRecallSheets() {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireRecallUserId();
  const { data, error } = await supabase
    .from("active_recall_sheets")
    .select("id, subject, topic, prompt, payload, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }

  return (data ?? []).map(mapRecallSheetRow);
}

export async function fetchActiveRecallSheet(id: string) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireRecallUserId();
  const { data, error } = await supabase
    .from("active_recall_sheets")
    .select("id, subject, topic, prompt, payload, created_at, updated_at")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }

  return data ? mapRecallSheetRow(data) : null;
}

export async function saveActiveRecallSheet(input: {
  subject: string;
  topic: string;
  prompt: string;
  sheet: StoredRecallSheet;
}) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireRecallUserId();
  const { error } = await supabase.from("active_recall_sheets").insert({
    user_id: userId,
    subject: input.subject,
    topic: input.topic,
    prompt: input.prompt,
    payload: input.sheet,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }
}

export async function updateActiveRecallSheet(
  id: string,
  input: {
    subject: string;
    topic: string;
    prompt: string;
    sheet: StoredRecallSheet;
  },
) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireRecallUserId();
  const { error } = await supabase
    .from("active_recall_sheets")
    .update({
      subject: input.subject,
      topic: input.topic,
      prompt: input.prompt,
      payload: input.sheet,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }
}

export async function deleteActiveRecallSheet(id: string) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireRecallUserId();
  const { error } = await supabase
    .from("active_recall_sheets")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }
}
