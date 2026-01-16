// src/app/api/papers/[id]/lock/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * POST /api/papers/[id]/lock
 * Lock a paper for evaluation (QuickPass approval)
 */
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { approved_by } = body;

        if (!approved_by) {
            return NextResponse.json(
                { success: false, error: "Missing approved_by field" },
                { status: 400 }
            );
        }

        // Check if paper exists
        const { data: paper, error: fetchError } = await supabase
            .from("papers")
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError || !paper) {
            return NextResponse.json(
                { success: false, error: "Paper not found" },
                { status: 404 }
            );
        }

        // Check if already locked
        if (paper.locked_at) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Paper already locked",
                    locked_at: paper.locked_at,
                },
                { status: 400 }
            );
        }

        // Lock the paper
        const { data, error: updateError } = await supabase
            .from("papers")
            .update({
                status: "locked",
                locked_at: new Date().toISOString(),
                locked_by: approved_by,
            })
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            console.error("Lock error:", updateError);
            return NextResponse.json(
                { success: false, error: "Failed to lock paper" },
                { status: 500 }
            );
        }

        console.log(`[QuickPass] Paper ${id} locked by ${approved_by}`);

        return NextResponse.json({
            success: true,
            paper: data,
            locked_at: data.locked_at,
        });
    } catch (err) {
        console.error("Lock endpoint error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/papers/[id]/lock
 * Unlock a paper (for testing/admin purposes)
 */
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("papers")
            .update({
                status: "draft",
                locked_at: null,
                locked_by: null,
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

        return NextResponse.json({ success: true, paper: data });
    } catch (err) {
        console.error("Unlock error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
