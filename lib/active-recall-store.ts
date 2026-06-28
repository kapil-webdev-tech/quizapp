import { PostgrestError } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient,
  requireSupabaseBrowserClient,
  requireSupabaseUserId,
} from "@/lib/supabase";

export type RecallVisibility = "private" | "public";
export type RecallStatus = "forgot" | "partial" | "mastered";

export type StoredRecallQuestion = {
  id: string;
  question: string;
  answer: string;
  orderIndex?: number;
};

export type StoredRecallSheet = {
  topic: string;
  questions: StoredRecallQuestion[];
};

export type UserRecallProgress = {
  id: string;
  userId: string;
  cardId: string;
  recallStatus: RecallStatus;
  recalledPoints: number;
  totalPoints: number;
  reviewCount: number;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ActiveRecallSheetRecord = {
  id: string;
  ownerId: string;
  subject: string;
  topic: string;
  visibility: RecallVisibility;
  sheet?: StoredRecallSheet;
  createdAt: string;
  updatedAt: string;
  title?: string;
  questionCount: number;
};

type RecallCardRow = {
  id: string;
  question: string;
  answer: string;
  order_index: number;
};

type RecallSheetRow = {
  id: string;

  owner_id?: string | null;
  user_id?: string | null;

  title?: string | null;

  subject: string;
  topic: string;

  subject_id?: string | null;
  topic_id?: string | null;
  micro_topic_id?: string | null;

  current_affairs_date?: string | null;

  visibility?: RecallVisibility | null;
  question_count: number;

  created_at: string;
  updated_at: string;
};
function buildRecallSaveErrorMessage(error: PostgrestError) {
  if (error.code === "42P01") {
    return "The normalized active recall tables are missing in Supabase. Apply supabase/schema.sql first.";
  }

  if (error.code === "42703") {
    return "The active recall schema is out of date. Apply supabase/schema.sql to add owner_id, visibility, cards, and progress columns.";
  }

  if (error.code === "42501") {
    return "Supabase blocked recall sheet saving. Check RLS policies for active recall tables.";
  }

  return error.message;
}

const requireRecallUserId = () =>
  requireSupabaseUserId(
    "Sign in to store active recall sheets in the backend.",
  );

function mapCardRows(cards: RecallCardRow[] | null | undefined) {
  return (cards ?? [])
    .slice()
    .sort((left, right) => left.order_index - right.order_index)
    .map((card) => ({
      id: card.id,
      question: card.question,
      answer: card.answer,
      orderIndex: card.order_index,
    }));
}

function mapRecallSheetMetadata(row: RecallSheetRow) {
  return {
    id: row.id,

    ownerId: row.owner_id ?? row.user_id ?? "",

    title: row.title ?? "",

    subject: row.subject,
    topic: row.topic,

    subjectId: row.subject_id ?? null,
    topicId: row.topic_id ?? null,
    microTopicId: row.micro_topic_id ?? null,

    currentAffairsDate: row.current_affairs_date ?? null,

    questionCount: row.question_count,
    visibility: row.visibility ?? "private",

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRecallSheetRow(
  row: RecallSheetRow,
  cardsBySheetId: Record<string, RecallCardRow[]> = {},
) {
  return {
    ...mapRecallSheetMetadata(row),

    sheet: {
      topic: row.topic,
      questions: mapCardRows(cardsBySheetId[row.id]),
    },
  };
}

const sheetSelect = `
id,
owner_id,
user_id,

title,

subject,
topic,

subject_id,
topic_id,
micro_topic_id,

current_affairs_date,

question_count,

visibility,

created_at,
updated_at
`;

async function fetchCardsBySheetId(sheetIds: string[]) {
  if (sheetIds.length === 0) {
    return {};
  }

  const supabase = requireSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("active_recall_cards")
    .select("id, sheet_id, question, answer, order_index")
    .in("sheet_id", sheetIds)
    .order("order_index", { ascending: true });

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }

  return (data ?? []).reduce<Record<string, RecallCardRow[]>>((acc, row) => {
    const sheetId = row.sheet_id as string;
    acc[sheetId] = [
      ...(acc[sheetId] ?? []),
      {
        id: row.id as string,
        question: row.question as string,
        answer: row.answer as string,
        order_index: row.order_index as number,
      },
    ];
    return acc;
  }, {});
}

export async function fetchActiveRecallSheetCount() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return 0;
  }

  const userId = await requireRecallUserId();
  const { count, error } = await supabase
    .from("active_recall_sheets")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId);

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }

  return count ?? 0;
}

export async function fetchActiveRecallSheets() {
  console.count("fetchActiveRecallSheets");
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireRecallUserId();
  const { data, error } = await supabase
    .from("active_recall_sheets")
    .select(sheetSelect)
    .eq("owner_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }
  const rows = (data ?? []) as RecallSheetRow[];

  return rows.map(mapRecallSheetMetadata);
}

export async function fetchPublicActiveRecallSheets() {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("active_recall_sheets")
    .select(sheetSelect)
    .eq("visibility", "public")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }

  const rows = (data ?? []) as RecallSheetRow[];
  return rows.map(mapRecallSheetMetadata);
}

export async function fetchActiveRecallSheet(id: string) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("active_recall_sheets")
    .select(sheetSelect)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }

  if (!data) {
    return null;
  }

  const row = data as RecallSheetRow;
  const cardsBySheetId = await fetchCardsBySheetId([row.id]);

  return mapRecallSheetRow(row, cardsBySheetId);
}



export async function saveActiveRecallSheet(input: {
  title: string;

  subject: string;
  topic: string;

  subjectId?: string | null;
  topicId?: string | null;
  microTopicId?: string | null;

  currentAffairsDate?: string | null;

  visibility?: RecallVisibility;
  sheet: StoredRecallSheet;
}) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireRecallUserId();
  const { data, error } = await supabase
    .from("active_recall_sheets")
    .insert({
      user_id: userId,
      owner_id: userId,
      title: input.title,
      subject: input.subject,
      topic: input.topic,
      subject_id: input.subjectId ?? null,
      topic_id: input.topicId ?? null,
      micro_topic_id: input.microTopicId ?? null,
      current_affairs_date: input.currentAffairsDate ?? null,
      visibility: input.visibility ?? "private",
      question_count: input.sheet.questions.length,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }

  const { error: cardError } = await supabase
    .from("active_recall_cards")
    .insert(
      input.sheet.questions.map((question, index) => ({
        id: question.id,
        sheet_id: data.id,
        question: question.question,
        answer: question.answer,
        order_index: question.orderIndex ?? index,
      })),
    );

  if (cardError) {
    throw new Error(buildRecallSaveErrorMessage(cardError));
  }
}

export async function updateActiveRecallSheet(
  id: string,
  input: {
    subject: string;
    topic: string;
    visibility?: RecallVisibility;
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
      visibility: input.visibility,
      updated_at: new Date().toISOString(),
      question_count: input.sheet.questions.length,
    })
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }

  const nextCardIds = input.sheet.questions.map((question) => question.id);
  const { data: existingCards, error: existingError } = await supabase
    .from("active_recall_cards")
    .select("id")
    .eq("sheet_id", id);

  if (existingError) {
    throw new Error(buildRecallSaveErrorMessage(existingError));
  }

  const staleCardIds = (existingCards ?? [])
    .map((card) => card.id as string)
    .filter((cardId) => !nextCardIds.includes(cardId));

  if (staleCardIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("active_recall_cards")
      .delete()
      .eq("sheet_id", id)
      .in("id", staleCardIds);

    if (deleteError) {
      throw new Error(buildRecallSaveErrorMessage(deleteError));
    }
  }

  const { error: upsertError } = await supabase
    .from("active_recall_cards")
    .upsert(
      input.sheet.questions.map((question, index) => ({
        id: question.id,
        sheet_id: id,
        question: question.question,
        answer: question.answer,
        order_index: question.orderIndex ?? index,
        updated_at: new Date().toISOString(),
      })),
    );

  if (upsertError) {
    throw new Error(buildRecallSaveErrorMessage(upsertError));
  }
}

export async function updateActiveRecallSheetVisibility(
  id: string,
  visibility: RecallVisibility,
) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireRecallUserId();
  const { error } = await supabase
    .from("active_recall_sheets")
    .update({
      visibility,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("owner_id", userId);

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
    .eq("owner_id", userId);

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }
}

export async function fetchUserRecallProgress(cardIds: string[]) {
  const supabase = requireSupabaseBrowserClient();
  if (cardIds.length === 0) {
    return [];
  }

  const userId = await requireRecallUserId();
  const { data, error } = await supabase
    .from("user_recall_progress")
    .select(
      "id, user_id, card_id, recall_status, recalled_points, total_points, review_count, last_reviewed_at, created_at, updated_at",
    )
    .eq("user_id", userId)
    .in("card_id", cardIds);

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    cardId: row.card_id as string,
    recallStatus: row.recall_status as RecallStatus,
    recalledPoints: row.recalled_points as number,
    totalPoints: row.total_points as number,
    reviewCount: row.review_count as number,
    lastReviewedAt: row.last_reviewed_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  })) satisfies UserRecallProgress[];
}

export async function upsertUserRecallProgress(input: {
  cardId: string;
  recallStatus: RecallStatus;
  recalledPoints: number;
  totalPoints: number;
}) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireRecallUserId();
  const now = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from("user_recall_progress")
    .select("id, review_count")
    .eq("user_id", userId)
    .eq("card_id", input.cardId)
    .maybeSingle();

  if (existingError) {
    throw new Error(buildRecallSaveErrorMessage(existingError));
  }

  const progressPayload = {
    user_id: userId,
    card_id: input.cardId,
    recall_status: input.recallStatus,
    recalled_points: input.recalledPoints,
    total_points: input.totalPoints,
    review_count: ((existing?.review_count as number | undefined) ?? 0) + 1,
    last_reviewed_at: now,
    updated_at: now,
  };

  const { error } = await supabase.from("user_recall_progress").upsert(
    existing?.id
      ? {
          id: existing.id as string,
          ...progressPayload,
        }
      : progressPayload,
    {
      onConflict: "user_id,card_id",
    },
  );

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }
}

// to delete a progress of card

export async function deleteUserRecallProgress(cardId: string) {
  const supabase = requireSupabaseBrowserClient();

  const userId = await requireRecallUserId();

  const { error } = await supabase
    .from("user_recall_progress")
    .delete()
    .eq("user_id", userId)
    .eq("card_id", cardId);

  if (error) {
    throw new Error(buildRecallSaveErrorMessage(error));
  }
}
