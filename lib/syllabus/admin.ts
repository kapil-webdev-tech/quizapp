import { requireSupabaseBrowserClient } from "@/lib/supabase";

export async function resetSyllabus() {
  const supabase =
    requireSupabaseBrowserClient();

  const { error } = await supabase.rpc(
    "reset_syllabus",
  );

  if (error) {
    throw new Error(error.message);
  }
}