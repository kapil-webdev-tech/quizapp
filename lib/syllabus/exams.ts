import { requireSupabaseBrowserClient } from "@/lib/supabase";

export async function getExams() {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .order("name_en");

  if (error) throw new Error(error.message);

  return data;
}

export async function createExam(input: {
  name_en: string;
  name_hi?: string | null;
  slug: string;
  description_en?: string | null;
  description_hi?: string | null;
}) {
  const supabase = requireSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("exams")
    .insert(input)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function updateExam(
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
    .from("exams")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function deleteExam(id: string) {
  const supabase = requireSupabaseBrowserClient();

  const { error } = await supabase
    .from("exams")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}