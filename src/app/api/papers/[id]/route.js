// app/api/papers/[id]/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(_req, { params }) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: "Paper not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching paper:", err);
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    // IMPORTANT: await params before using it
    const { id } = await params;

    // Read JSON body
    const body = await req.json();

    // Basic validation: body must be an object with at least one key other than id
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, error: "Request body is empty or invalid. Provide fields to update." },
        { status: 400 }
      );
    }

    // Optional: remove fields you don't want the client to update directly
    // e.g. ensure created_at, teacher_id, id are not overwritten unintentionally
    const forbidden = ["id", "created_at", "teacher_id"];
    forbidden.forEach((f) => delete body[f]);

    // Perform the update and return the updated row
    const { data, error } = await supabase
      .from("papers")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error updating paper:", err);
    return NextResponse.json(
      { success: false, error: err.message || String(err) },
      { status: 500 }
    );
  }
}
