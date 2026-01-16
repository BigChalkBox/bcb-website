// src/app/api/curricula/share/route.js
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Service role client for admin operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/curricula/share
 * Share a curriculum with another teacher
 * Body: { curriculumId, targetEmail }
 */
export async function POST(req) {
    try {
        // Get current user from session
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { curriculumId, targetEmail } = body;

        if (!curriculumId || !targetEmail) {
            return NextResponse.json(
                { success: false, error: "Missing curriculumId or targetEmail" },
                { status: 400 }
            );
        }

        // Normalize email
        const normalizedEmail = targetEmail.trim().toLowerCase();

        // Prevent self-sharing
        if (normalizedEmail === user.email?.toLowerCase()) {
            return NextResponse.json(
                { success: false, error: "You cannot share a syllabus with yourself" },
                { status: 400 }
            );
        }

        // 1. Verify the curriculum exists and user is the owner
        const { data: curriculum, error: currError } = await supabaseAdmin
            .from("curricula")
            .select("id, owner_id, subject_name")
            .eq("id", curriculumId)
            .single();

        if (currError || !curriculum) {
            return NextResponse.json(
                { success: false, error: "Curriculum not found" },
                { status: 404 }
            );
        }

        // Check ownership (owner_id must match current user, or be null for legacy curricula)
        if (curriculum.owner_id && curriculum.owner_id !== user.id) {
            return NextResponse.json(
                { success: false, error: "You can only share curricula you own" },
                { status: 403 }
            );
        }

        // 2. Find target teacher by email - check users table first
        let targetUser = null;

        // Try users table (public profile)
        const { data: userData } = await supabaseAdmin
            .from("users")
            .select("id, full_name, email")
            .ilike("email", normalizedEmail)
            .single();

        if (userData) {
            targetUser = userData;
        } else {
            // Fall back to auth.users via admin API
            const { data: authData } = await supabaseAdmin.auth.admin.listUsers();
            const authUser = authData?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);

            if (authUser) {
                targetUser = {
                    id: authUser.id,
                    full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0],
                    email: authUser.email
                };
            }
        }

        if (!targetUser) {
            return NextResponse.json(
                { success: false, error: "No teacher found with that email address. Make sure they have an account." },
                { status: 404 }
            );
        }

        // 3. Get current user's name for the shared_by_name field
        const { data: currentUserData } = await supabaseAdmin
            .from("users")
            .select("full_name")
            .eq("id", user.id)
            .single();

        const sharedByName = currentUserData?.full_name || user.email?.split("@")[0] || "Unknown";

        // 4. Create the share record
        const { data: share, error: shareError } = await supabaseAdmin
            .from("curriculum_shares")
            .insert({
                curriculum_id: curriculumId,
                shared_with_id: targetUser.id,
                shared_by_id: user.id,
                shared_by_name: sharedByName
            })
            .select()
            .single();

        if (shareError) {
            // Check for duplicate
            if (shareError.code === "23505") {
                return NextResponse.json(
                    { success: false, error: "This syllabus is already shared with this teacher" },
                    { status: 400 }
                );
            }
            console.error("Share error:", shareError);
            return NextResponse.json(
                { success: false, error: shareError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Syllabus shared with ${targetUser.full_name || "teacher"}`,
            share
        });

    } catch (err) {
        console.error("Share curriculum error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/**
 * GET /api/curricula/share?curriculumId=xxx
 * Get all shares for a specific curriculum (owner only)
 */
export async function GET(req) {
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
        const curriculumId = searchParams.get("curriculumId");

        if (!curriculumId) {
            return NextResponse.json(
                { success: false, error: "Missing curriculumId" },
                { status: 400 }
            );
        }

        // Get shares for this curriculum
        const { data: shares, error } = await supabaseAdmin
            .from("curriculum_shares")
            .select(`
                id,
                created_at,
                shared_with_id,
                users!curriculum_shares_shared_with_id_fkey(full_name, email)
            `)
            .eq("curriculum_id", curriculumId)
            .eq("shared_by_id", user.id);

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            shares: shares || []
        });

    } catch (err) {
        console.error("Get shares error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/curricula/share?shareId=xxx
 * Remove a share (owner only)
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
        const shareId = searchParams.get("shareId");

        if (!shareId) {
            return NextResponse.json(
                { success: false, error: "Missing shareId" },
                { status: 400 }
            );
        }

        // Delete only if user is the one who shared
        const { error } = await supabaseAdmin
            .from("curriculum_shares")
            .delete()
            .eq("id", shareId)
            .eq("shared_by_id", user.id);

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (err) {
        console.error("Delete share error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
