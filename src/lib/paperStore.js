import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ service role key for writes
);

export async function readPaper(id) {
  const { data, error } = await supabase
    .from("papers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    console.error(error);
    return null;
  }
  return data;
}

export async function writePaper(id, obj) {
  const { error } = await supabase
    .from("papers")
    .update(obj)
    .eq("id", id);
  if (error) throw error;
  return true;
}

export async function finalizePaper(id, questions) {
  const { error } = await supabase
    .from("papers")
    .update({
      status: "final",
      paper_data: { questions },
      finalized_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
  return true;
}
