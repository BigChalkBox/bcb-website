import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚙️ Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const runtime = "nodejs";

/**
 * POST /api/evaluations/[submissionId]
 * Updates the evaluation status for a submission
 * Body: { status: string, result: object }
 */
export async function POST(req, { params }) {
  try {
    const { submissionId } = await params;
    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "Missing submissionId" },
        { status: 400 }
      );
    }

    // Parse body with error handling
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "Invalid or empty request body" },
        { status: 400 }
      );
    }

    const { status, result } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "Missing status" },
        { status: 400 }
      );
    }

    // Update evaluation record
    const { error: upsertError } = await supabase
      .from("evaluations")
      .upsert(
        {
          submission_id: submissionId,
          status: status,
          result: result || {},
          updated_at: new Date().toISOString(),
        },
        { onConflict: "submission_id" }
      );

    if (upsertError) {
      console.error("⚠️ Failed to update evaluation status:", upsertError.message);
      return NextResponse.json(
        { success: false, error: upsertError.message },
        { status: 500 }
      );
    }

    console.log(`📊 Evaluation status set to '${status}' for ${submissionId}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Evaluation update error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
