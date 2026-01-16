// app/api/papers/[id]/finalize/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ needs service role for secure writes
);

// helper to generate unique qids
function generateQid() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req, { params }) {
  try {
    const { id } = params; // ✅ no await here
    const body = await req.json();
    let { questions, intelligence } = body; // Accept intelligence

    // ensure unique qids
    questions = questions.map((q) => ({
      ...q,
      qid: q.qid || generateQid(),
    }));

    const { data, error } = await supabase
      .from("papers")
      .update({
        status: "que-final",
        paper_data: {
          questions,
          intelligence: intelligence || null, // Save QuickPass analysis
        },
        finalized_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Paper not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, paper: data });
  } catch (err) {
    console.error("Error finalizing paper:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
