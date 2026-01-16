// Debug route to check submission details
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const enrollment = searchParams.get("enrollment") || "R2190";

    // Check submission by enrollment
    const { data: submissions, error: subError } = await supabase
        .from("submissions")
        .select("*")
        .ilike("enrollment_no", `%${enrollment}%`);

    return NextResponse.json({
        enrollment,
        submissions: submissions || [],
        count: submissions?.length || 0,
        error: subError?.message,
    });
}
