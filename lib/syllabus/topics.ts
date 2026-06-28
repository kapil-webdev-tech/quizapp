// lib/syllabus/topics.ts

import { requireSupabaseBrowserClient } from "@/lib/supabase";
import { linkTopicRelation, relationExists } from "./mappings";
import { slugify } from "../custom-quiz-schema";

export async function getTopics() {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("name_en");

  if (error) throw new Error(error.message);

  return data;
}

export async function getTopicsBySubject(subjectId: string) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("subject_topics")
    .select(
      `
        topic_id,
        topics (
          id,
          name_en,
          name_hi,
          slug
        )
      `,
    )
    .eq("subject_id", subjectId);

  if (error) {
    throw new Error(error.message);
  }

  return data?.map((row) => row.topics) ?? [];
}

export async function createTopic(input: {
  name_en: string;
  name_hi?: string | null;
  slug: string;
  description_en?: string | null;
  description_hi?: string | null;
}) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("topics")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function createTopics(
  inputs: {
    name_en: string;
    name_hi?: string | null;
    slug: string;
    description_en?: string | null;
    description_hi?: string | null;
  }[],
) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("topics")
    .upsert(inputs, {
      onConflict: "slug",
    })
    .select();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateTopic(
  id: string,
  input: {
    name_en?: string;
    name_hi?: string | null;
    slug?: string;
    description_en?: string | null;
    description_hi?: string | null;
  },
) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("topics")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function deleteTopic(id: string) {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase.from("topics").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteTopics(ids: string[]) {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase.from("topics").delete().in("id", ids);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteAllTopics() {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase.rpc("delete_all_topics");

  if (error) {
    throw new Error(error.message);
  }
}

export async function getTopicBySlug(
  slug: string,
) {
  const supabase =
    requireSupabaseBrowserClient();

  const { data, error } =
    await supabase
      .from("topics")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createOrGetMicroTopic(
  parentTopicId: string,
  name: string,
) {
  const normalizedName =
    name.trim();

  const slug =
    slugify(normalizedName);

  const existing =
    await getTopicBySlug(slug);

  if (existing) {
    const alreadyLinked =
      await relationExists(
        parentTopicId,
        existing.id,
      );

    if (!alreadyLinked) {
      await linkTopicRelation(
        parentTopicId,
        existing.id,
      );
    }

    return existing;
  }

  const createdTopic =
    await createTopic({
      name_en: normalizedName,
      slug,
    });

  await linkTopicRelation(
    parentTopicId,
    createdTopic.id,
  );

  return createdTopic;
}

export async function getSubjectsWithSyllabusTree() {
  const supabase =
    requireSupabaseBrowserClient();

  const [
    subjectsResult,
    relationsResult,
  ] = await Promise.all([
    supabase
      .from("subjects")
      .select(`
        *,
        subject_topics (
          topic_id,
          topics (
            id,
            name_en,
            name_hi,
            slug
          )
        )
      `)
      .order("name_en"),

    supabase
      .from("topic_relations")
      .select(`
        parent_topic_id,
        child_topic_id,
        topics!topic_relations_child_topic_id_fkey (
          id,
          name_en,
          name_hi,
          slug
        )
      `),
  ]);

  if (subjectsResult.error) {
    throw new Error(
      subjectsResult.error.message,
    );
  }

  if (relationsResult.error) {
    throw new Error(
      relationsResult.error.message,
    );
  }

  const relationMap =
    new Map<
      string,
      any[]
    >();

  for (
    const relation of relationsResult
      .data ?? []
  ) {
    const existing =
      relationMap.get(
        relation.parent_topic_id,
      ) ?? [];

    existing.push(
      relation.topics,
    );

    relationMap.set(
      relation.parent_topic_id,
      existing,
    );
  }

  return (
    subjectsResult.data ?? []
  ).map((subject: any) => ({
    ...subject,

    topics:
      subject.subject_topics.map(
        (st: any) => ({
          ...st.topics,

          children:
            relationMap.get(
              st.topic_id,
            ) ?? [],
        }),
      ),
  }));
}