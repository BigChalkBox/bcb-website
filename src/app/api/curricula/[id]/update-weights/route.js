// src/app/api/curricula/[id]/update-weights/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * PATCH /api/curricula/[id]/update-weights
 * Update unit/topic weights in structured_topics
 * Body: { units: [{ id: "unit-1", weight: 25, topics: [{ id: "u1-t1", weight: 10 }] }] }
 */
export async function PATCH(req, { params }) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await req.json();
        const { units: updatedUnits } = body;

        if (!updatedUnits || !Array.isArray(updatedUnits)) {
            return NextResponse.json(
                { success: false, error: "Invalid request body. Expected { units: [...] }" },
                { status: 400 }
            );
        }

        // Get current curriculum
        const { data: curriculum, error: fetchError } = await supabaseAdmin
            .from("curricula")
            .select("id, owner_id, structured_topics")
            .eq("id", id)
            .single();

        if (fetchError || !curriculum) {
            return NextResponse.json(
                { success: false, error: "Curriculum not found" },
                { status: 404 }
            );
        }

        // Check ownership (owner or shared with)
        if (curriculum.owner_id && curriculum.owner_id !== user.id) {
            // Check if shared with user
            const { data: share } = await supabaseAdmin
                .from("curriculum_shares")
                .select("id")
                .eq("curriculum_id", id)
                .eq("shared_with_id", user.id)
                .single();

            if (!share) {
                return NextResponse.json(
                    { success: false, error: "You don't have permission to edit this curriculum" },
                    { status: 403 }
                );
            }
        }

        // Update weights in structured_topics
        const structuredTopics = curriculum.structured_topics || { units: [] };

        updatedUnits.forEach(updatedUnit => {
            const existingUnit = structuredTopics.units.find(u => u.id === updatedUnit.id);
            if (existingUnit) {
                if (typeof updatedUnit.weight === 'number') {
                    existingUnit.weight = updatedUnit.weight;
                }

                // Update topic weights if provided
                if (updatedUnit.topics && Array.isArray(updatedUnit.topics)) {
                    updatedUnit.topics.forEach(updatedTopic => {
                        const existingTopic = existingUnit.topics?.find(t => t.id === updatedTopic.id);
                        if (existingTopic && typeof updatedTopic.weight === 'number') {
                            existingTopic.weight = updatedTopic.weight;
                        }
                    });
                }
            }
        });

        // Save updated structured_topics
        const { error: updateError } = await supabaseAdmin
            .from("curricula")
            .update({ structured_topics: structuredTopics })
            .eq("id", id);

        if (updateError) {
            console.error("Update error:", updateError);
            return NextResponse.json(
                { success: false, error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Weights updated successfully",
            structured_topics: structuredTopics,
        });

    } catch (err) {
        console.error("Update weights error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
