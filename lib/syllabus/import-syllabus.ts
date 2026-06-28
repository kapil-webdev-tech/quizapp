import { requireSupabaseBrowserClient } from "@/lib/supabase";

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export async function importSyllabus(rawText: string) {
  const supabase = requireSupabaseBrowserClient();

  const sections = rawText.split(/\n\s*\n/).filter((x) => x.trim());

  const subjectsMap = new Map<
    string,
    {
      name_en: string;
      name_hi?: string | null;
      slug: string;
    }
  >();

  const topicsMap = new Map<
    string,
    {
      name_en: string;
      name_hi?: string | null;
      slug: string;
    }
  >();

  const mappings: {
    subjectSlug: string;
    topicSlug: string;
  }[] = [];

  const topicRelations: {
    parentSlug: string;
    childSlug: string;
  }[] = [];

  for (const section of sections) {
    const lines = section.split("\n").filter((x) => x.trim());

    if (!lines.length) continue;

    const [subjectEn, subjectHi] = lines[0]
      .replace(/:$/, "")
      .split("|")
      .map((x) => x.trim());

    const subjectSlug = slugify(subjectEn);

    subjectsMap.set(subjectSlug, {
      name_en: subjectEn,
      name_hi: subjectHi?.trim() || null,
      slug: subjectSlug,
    });

    let currentTopicSlug: string | null = null;

    for (const rawLine of lines.slice(1)) {
      const line = rawLine.trim();

      if (!line) continue;

      const isMicroTopic = line.startsWith("-");

      if (!isMicroTopic) {
        const [topicEn, topicHi] = line
          .replace(/:$/, "")
          .split("|")
          .map((x) => x.trim());

        const topicSlug = slugify(topicEn);

        topicsMap.set(topicSlug, {
          name_en: topicEn,
          name_hi: topicHi?.trim() || null,
          slug: topicSlug,
        });

        mappings.push({
          subjectSlug,
          topicSlug,
        });

        currentTopicSlug = topicSlug;

        continue;
      }

      if (!currentTopicSlug) {
        continue;
      }

      const cleanLine = line.replace(/^-\s*/, "").trim();

      const [microEn, microHi] = cleanLine.split("|").map((x) => x.trim());

      const microSlug = slugify(microEn);

      topicsMap.set(microSlug, {
        name_en: microEn,
        name_hi: microHi?.trim() || null,
        slug: microSlug,
      });

      topicRelations.push({
        parentSlug: currentTopicSlug,
        childSlug: microSlug,
      });
    }
  }

  const subjects = [...subjectsMap.values()];

  const topics = [...topicsMap.values()];

  // 1 query
  const { error: subjectsError } = await supabase
    .from("subjects")
    .upsert(subjects, {
      onConflict: "slug",
    });

  if (subjectsError) {
    throw new Error(subjectsError.message);
  }

  // 1 query
  const { error: topicsError } = await supabase.from("topics").upsert(topics, {
    onConflict: "slug",
  });

  if (topicsError) {
    throw new Error(topicsError.message);
  }

  // 1 query
  const { data: allSubjects, error: fetchSubjectsError } = await supabase
    .from("subjects")
    .select("id, slug");

  if (fetchSubjectsError) {
    throw new Error(fetchSubjectsError.message);
  }

  // 1 query
  const { data: allTopics, error: fetchTopicsError } = await supabase
    .from("topics")
    .select("id, slug");

  if (fetchTopicsError) {
    throw new Error(fetchTopicsError.message);
  }

  const subjectLookup = new Map(allSubjects.map((s) => [s.slug, s.id]));

  const topicLookup = new Map(allTopics.map((t) => [t.slug, t.id]));

  const subjectTopicsRows = mappings
    .map((m) => ({
      subject_id: subjectLookup.get(m.subjectSlug),
      topic_id: topicLookup.get(m.topicSlug),
    }))
    .filter((x) => x.subject_id && x.topic_id);
  const topicRelationRows = topicRelations
    .map((r) => ({
      parent_topic_id: topicLookup.get(r.parentSlug),

      child_topic_id: topicLookup.get(r.childSlug),

      relation_type: "contains",
    }))
    .filter((x) => x.parent_topic_id && x.child_topic_id);

  // 1 query
  // 1 query
  // 1 query
  const { error: mappingsError } = await supabase
    .from("subject_topics")
    .upsert(subjectTopicsRows, {
      onConflict: "subject_id,topic_id",
    });

  if (mappingsError) {
    throw new Error(mappingsError.message);
  }

  // 1 query
  const { error: topicRelationsError } = await supabase
    .from("topic_relations")
    .upsert(topicRelationRows, {
      onConflict: "parent_topic_id,child_topic_id,relation_type",
    });

  if (topicRelationsError) {
    throw new Error(topicRelationsError.message);
  }
}
