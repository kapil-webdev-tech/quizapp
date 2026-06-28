import { requireSupabaseBrowserClient } from "@/lib/supabase";

export async function getSubjects() {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("name_en");

  if (error) throw new Error(error.message);

  return data;
}

export async function getSubjectsWithSyllabus() {
  const supabase =
    requireSupabaseBrowserClient();

  const { data, error } =
    await supabase
      .from("subjects")
      .select(`
        *,
        subject_topics (
          topic_id,
          topics (
            id,
            name_en,
            name_hi
          )
        )
      `)
      .order("name_en");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function createSubject(input: {
  name_en: string;
  name_hi?: string | null;
  slug: string;
  description_en?: string | null;
  description_hi?: string | null;
}) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("subjects")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function createSubjects(
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
    .from("subjects")
    .upsert(inputs, {
      onConflict: "slug",
    })
    .select();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateSubject(
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
    .from("subjects")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function deleteSubject(id: string) {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase.from("subjects").delete().eq("id", id);

  if (error) throw new Error(error.message);
}
