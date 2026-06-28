import { requireSupabaseBrowserClient } from "@/lib/supabase";

export type ExplorerTopic = {
  id: string;
  name_en: string;
};

export type ExplorerSubject = {
  id: string;
  name_en: string;
  topics: ExplorerTopic[];
};

type ExplorerRow = {
  subjects: {
    id: string;
    name_en: string;
    subject_topics: {
      topics:
        | {
            id: string;
            name_en: string;
          }
        | {
            id: string;
            name_en: string;
          }[];
    }[];
  };
};

export async function getExamHierarchy(
  examId: string,
): Promise<ExplorerSubject[]> {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("exam_subjects")
    .select(
      `
        subjects (
          id,
          name_en,
          subject_topics (
            topics (
              id,
              name_en
            )
          )
        )
      `,
    )
    .eq("exam_id", examId);

  if (error) {
    throw new Error(error.message);
  }

  return (data as unknown as ExplorerRow[]).map((row) => ({
    id: row.subjects.id,
    name_en: row.subjects.name_en,

    topics: row.subjects.subject_topics.flatMap((st) =>
      Array.isArray(st.topics) ? st.topics : [st.topics],
    ),
  }));
}

export async function getSyllabusDebugData() {
  const supabase = requireSupabaseBrowserClient();

  const [
    subjectsResult,
    topicsResult,
    subjectTopicsResult,
    topicRelationsResult,
  ] = await Promise.all([
    supabase
      .from("subjects")
      .select("*")
      .order("name_en"),

    supabase
      .from("topics")
      .select("*")
      .order("name_en"),

    supabase
      .from("subject_topics")
      .select("*"),

    supabase
      .from("topic_relations")
      .select("*"),
  ]);

  if (subjectsResult.error)
    throw new Error(subjectsResult.error.message);

  if (topicsResult.error)
    throw new Error(topicsResult.error.message);

  if (subjectTopicsResult.error)
    throw new Error(
      subjectTopicsResult.error.message,
    );

  if (topicRelationsResult.error)
    throw new Error(
      topicRelationsResult.error.message,
    );

  return {
    subjects:
      subjectsResult.data ?? [],

    topics:
      topicsResult.data ?? [],

    subjectTopics:
      subjectTopicsResult.data ?? [],

    topicRelations:
      topicRelationsResult.data ?? [],
  };
}