import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
    try {
        // Fetch all students
        const { data: users, error: usersError } = await supabase
            .from("users")
            .select("id, email, institution_id")
            .eq("role", "student");

        if (usersError) throw usersError;

        // Fetch all student profiles
        const { data: profiles, error: profilesError } = await supabase
            .from("student_profiles")
            .select("id, full_name, enrollment_no, course, year");

        if (profilesError) throw profilesError;

        // Fetch all institutions
        const { data: institutions, error: instError } = await supabase
            .from("institutions")
            .select("id, name");

        if (instError) throw instError;

        // Create lookup maps
        const profileMap = {};
        profiles?.forEach((p) => {
            profileMap[p.id] = p;
        });

        const institutionMap = {};
        institutions?.forEach((inst) => {
            institutionMap[inst.id] = inst;
        });

        // Combine data
        const combined = users?.map((user) => ({
            id: user.id,
            email: user.email,
            institution_id: user.institution_id,
            institution: institutionMap[user.institution_id] || null,
            student_profiles: profileMap[user.id] || null,
        }));

        return NextResponse.json(combined || []);
    } catch (error) {
        console.error("Error fetching students:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
