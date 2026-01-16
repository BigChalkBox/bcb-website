// Debug route to check student reports data
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Check submissions
    const { data: submissions, error: subError } = await supabase
        .from("submissions")
        .select("*")
        .eq("email", email);

    // Check evaluations
    let evaluations = [];
    if (submissions && submissions.length > 0) {
        const submissionIds = submissions.map((s) => s.id);
        const { data: evals, error: evalError } = await supabase
            .from("evaluations")
            .select("*")
            .in("submission_id", submissionIds);

        evaluations = evals || [];
    }

    return NextResponse.json({
        email,
        submissions: submissions || [],
        submissionCount: submissions?.length || 0,
        evaluations: evaluations,
        evaluationCount: evaluations.length,
        submissionError: subError?.message,
    });
}
