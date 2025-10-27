// app/api/papers/[id]/question/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // use service role for writes
);

export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json();
  const { action, question } = body;

  try {
    // Fetch paper from Supabase
    const { data: paper, error: fetchError } = await supabase
      .from("papers")
      .select("id, paper_data")
      .eq("id", id)
      .single();

    if (fetchError || !paper) {
      return NextResponse.json(
        { success: false, error: "Paper not found" },
        { status: 404 }
      );
    }

    let paperData = paper.paper_data || { questions: [] };

    if (!Array.isArray(paperData.questions)) {
      paperData.questions = [];
    }

    // 🔥 Handle actions
    if (action === "add") {
      const qid = paperData.questions.length
        ? paperData.questions[paperData.questions.length - 1].qid + 1
        : 1;

      const newQ = {
        ...question,
        qid,
        sampleAnswers: question.sampleAnswers || [],
      };

      paperData.questions.push(newQ);
    } else if (action === "update") {
      const idx = paperData.questions.findIndex((q) => q.qid === question.qid);
      if (idx === -1) {
        return NextResponse.json(
          { success: false, error: "Question not found" },
          { status: 404 }
        );
      }
      paperData.questions[idx] = {
        ...paperData.questions[idx],
        ...question,
      };
    } else if (action === "delete") {
      paperData.questions = paperData.questions.filter(
        (q) => q.qid !== question.qid
      );
    } else {
      return NextResponse.json(
        { success: false, error: "Unknown action" },
        { status: 400 }
      );
    }

    // Save updated paper back into Supabase
    const { error: updateError } = await supabase
      .from("papers")
      .update({ paper_data: paperData })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: paperData });
  } catch (err) {
    console.error("Error updating questions:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
