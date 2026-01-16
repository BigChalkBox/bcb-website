// src/app/api/curricula/[id]/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * GET /api/curricula/[id]
 * Get a single curriculum
 */
export async function GET(req, { params }) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("curricula")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, curriculum: data });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/curricula/[id]
 * Update curriculum (for editing extracted topics)
 */
export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();

        const { data, error } = await supabase
            .from("curricula")
            .update({
                structured_topics: body.structured_topics,
                subject_name: body.subject_name,
                subject_code: body.subject_code,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, curriculum: data });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/curricula/[id]
 * Delete a curriculum
 */
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        const { error } = await supabase
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
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
