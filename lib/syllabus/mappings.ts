// lib/syllabus/mappings.ts

import { requireSupabaseBrowserClient } from "@/lib/supabase";

/* ========================================
   EXAM ↔ SUBJECT
======================================== */

export async function getExamSubjectTopics(examId: string, subjectId: string) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("exam_subject_topics")
    .select("*")
    .eq("exam_id", examId)
    .eq("subject_id", subjectId);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function saveExamSubjectTopics(
  examId: string,
  subjectId: string,
  topicIds: string[],
) {
  const supabase = requireSupabaseBrowserClient();

  const { error: deleteError } = await supabase
    .from("exam_subject_topics")
    .delete()
    .eq("exam_id", examId)
    .eq("subject_id", subjectId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (topicIds.length === 0) {
    return;
  }

  const rows = topicIds.map((topicId) => ({
    exam_id: examId,
    subject_id: subjectId,
    topic_id: topicId,
  }));

  const { error } = await supabase.from("exam_subject_topics").upsert(rows, {
    onConflict: "exam_id,subject_id,topic_id",
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function getExamSubjects(examId: string) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("exam_subjects")
    .select(
      `
      exam_id,
      subject_id,
      subjects (*)
    `,
    )
    .eq("exam_id", examId);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function saveExamSubjects(examId: string, subjectIds: string[]) {
  const supabase = requireSupabaseBrowserClient();

  const { error: deleteError } = await supabase
    .from("exam_subjects")
    .delete()
    .eq("exam_id", examId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (subjectIds.length === 0) {
    return;
  }

  const rows = subjectIds.map((subjectId) => ({
    exam_id: examId,
    subject_id: subjectId,
  }));

  const { error } = await supabase.from("exam_subjects").insert(rows);

  if (error) {
    throw new Error(error.message);
  }
}

export async function linkExamSubject(examId: string, subjectId: string) {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase.from("exam_subjects").upsert(
    {
      exam_id: examId,
      subject_id: subjectId,
    },
    {
      onConflict: "exam_id,subject_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function unlinkExamSubject(examId: string, subjectId: string) {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase
    .from("exam_subjects")
    .delete()
    .eq("exam_id", examId)
    .eq("subject_id", subjectId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function getTopicsForSubject(subjectId: string) {
  const data = await getSubjectTopics(subjectId);

  return data.map((row) => {
    const topic = Array.isArray(row.topics) ? row.topics[0] : row.topics;

    return {
      id: row.topic_id,
      name_en: topic?.name_en ?? "",
    };
  });
}

/* ========================================
   SUBJECT ↔ TOPIC
======================================== */

export async function getSubjectTopics(subjectId: string) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("subject_topics")
    .select(
      `
      subject_id,
      topic_id,
      topics (*)
    `,
    )
    .eq("subject_id", subjectId);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function saveSubjectTopics(subjectId: string, topicIds: string[]) {
  const supabase = requireSupabaseBrowserClient();

  const { error: deleteError } = await supabase
    .from("subject_topics")
    .delete()
    .eq("subject_id", subjectId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (topicIds.length === 0) {
    return;
  }

  const rows = topicIds.map((topicId) => ({
    subject_id: subjectId,
    topic_id: topicId,
  }));

  const { error } = await supabase.from("subject_topics").upsert(rows, {
    onConflict: "subject_id,topic_id",
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function linkSubjectTopic(subjectId: string, topicId: string) {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase.from("subject_topics").upsert(
    {
      subject_id: subjectId,
      topic_id: topicId,
    },
    {
      onConflict: "subject_id,topic_id",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function unlinkSubjectTopic(subjectId: string, topicId: string) {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase
    .from("subject_topics")
    .delete()
    .eq("subject_id", subjectId)
    .eq("topic_id", topicId);

  if (error) {
    throw new Error(error.message);
  }
}

/* ========================================
   TOPIC ↔ TOPIC
======================================== */

export async function getTopicRelations(parentTopicId: string) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("topic_relations")
    .select(
      `
      parent_topic_id,
      child_topic_id,
      relation_type,
      topics!topic_relations_child_topic_id_fkey (*)
    `,
    )
    .eq("parent_topic_id", parentTopicId);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function linkTopicRelation(
  parentTopicId: string,
  childTopicId: string,
  relationType = "contains",
) {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase.from("topic_relations").upsert(
    {
      parent_topic_id: parentTopicId,
      child_topic_id: childTopicId,
      relation_type: relationType,
    },
    {
      onConflict: "parent_topic_id,child_topic_id,relation_type",
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function unlinkTopicRelation(
  parentTopicId: string,
  childTopicId: string,
) {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase
    .from("topic_relations")
    .delete()
    .eq("parent_topic_id", parentTopicId)
    .eq("child_topic_id", childTopicId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function relationExists(
  parentTopicId: string,
  childTopicId: string,
) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("topic_relations")
    .select("parent_topic_id")
    .eq("parent_topic_id", parentTopicId)
    .eq("child_topic_id", childTopicId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return !!data;
}
