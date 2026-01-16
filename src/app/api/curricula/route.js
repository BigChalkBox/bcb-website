// src/app/api/curricula/route.js
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/curricula
 * List curricula for the current user:
 * - Curricula they own (owner_id = user.id)
 * - Curricula shared with them (via curriculum_shares)
 * - Legacy curricula (owner_id is null) - accessible to all
 */
export async function GET(req) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        const { searchParams } = new URL(req.url);
        const subjectCode = searchParams.get("subjectCode");

        // If no user, only return legacy (null owner) curricula
        if (userError || !user) {
            let query = supabaseAdmin
                .from("curricula")
                .select("id, subject_code, subject_name, structured_topics, created_at, owner_id")
                .is("owner_id", null)
                .order("created_at", { ascending: false });

            if (subjectCode) {
                query = query.eq("subject_code", subjectCode);
            }

            const { data, error } = await query;

            if (error) {
                return NextResponse.json(
                    { success: false, error: error.message },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                curricula: data || [],
            });
        }

        // For logged-in users, get:
        // 1. Curricula they own
        // 2. Curricula shared with them
        // 3. Legacy curricula (owner_id is null)

        // Get owned curricula
        let ownedQuery = supabaseAdmin
            .from("curricula")
            .select("id, subject_code, subject_name, structured_topics, created_at, owner_id")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

        if (subjectCode) {
            ownedQuery = ownedQuery.eq("subject_code", subjectCode);
        }

        const { data: ownedData, error: ownedError } = await ownedQuery;

        // Get shared curricula (with share info)
        const { data: sharedData, error: sharedError } = await supabaseAdmin
            .from("curriculum_shares")
            .select(`
                curriculum_id,
                shared_by_name,
                shared_by_id,
                curricula!inner(id, subject_code, subject_name, structured_topics, created_at, owner_id)
            `)
            .eq("shared_with_id", user.id);

        // Get legacy curricula (owner_id is null)
        let legacyQuery = supabaseAdmin
            .from("curricula")
            .select("id, subject_code, subject_name, structured_topics, created_at, owner_id")
            .is("owner_id", null)
            .order("created_at", { ascending: false });

        if (subjectCode) {
            legacyQuery = legacyQuery.eq("subject_code", subjectCode);
        }

        const { data: legacyData, error: legacyError } = await legacyQuery;

        if (ownedError || sharedError || legacyError) {
            const errorMsg = ownedError?.message || sharedError?.message || legacyError?.message;
            return NextResponse.json(
                { success: false, error: errorMsg },
                { status: 500 }
            );
        }

        // Process owned curricula (mark as owned)
        const owned = (ownedData || []).map(c => ({
            ...c,
            isOwner: true,
            sharedBy: null
        }));

        // Process shared curricula (add shared_by info)
        const shared = (sharedData || []).map(s => ({
            ...s.curricula,
            isOwner: false,
            sharedBy: s.shared_by_name || "Another teacher"
        }));

        // Process legacy curricula (accessible to all)
        const legacy = (legacyData || []).map(c => ({
            ...c,
            isOwner: false,
            sharedBy: null,
            isLegacy: true
        }));

        // Combine and dedupe (in case of overlaps)
        const allCurriculaMap = new Map();

        // Add owned first (highest priority)
        owned.forEach(c => allCurriculaMap.set(c.id, c));

        // Add shared (only if not already owned)
        shared.forEach(c => {
            if (!allCurriculaMap.has(c.id)) {
                allCurriculaMap.set(c.id, c);
            }
        });

        // Add legacy (only if not already in list)
        legacy.forEach(c => {
            if (!allCurriculaMap.has(c.id)) {
                allCurriculaMap.set(c.id, c);
            }
        });

        const curricula = Array.from(allCurriculaMap.values());

        return NextResponse.json({
            success: true,
            curricula,
        });
    } catch (err) {
        console.error("List curricula error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/curricula?id=xxx
 * Delete a curriculum (owner only)
 */
export async function DELETE(req) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Missing curriculum id" },
                { status: 400 }
            );
        }

        // Check if user owns this curriculum
        const { data: curriculum } = await supabaseAdmin
            .from("curricula")
            .select("owner_id")
            .eq("id", id)
            .single();

        if (curriculum && curriculum.owner_id && curriculum.owner_id !== user.id) {
            return NextResponse.json(
                { success: false, error: "You can only delete curricula you own" },
                { status: 403 }
            );
        }

        const { error } = await supabaseAdmin
            .from("curricula")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delete curriculum error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

