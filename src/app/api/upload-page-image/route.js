import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚙️ Initialize Supabase with SERVICE_ROLE_KEY (bypasses RLS)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const runtime = "nodejs";

/**
 * POST /api/upload-page-image
 * Uploads a page image to Supabase Storage
 * Body: { submissionId, questionNo, pageNumber, imageBase64 }
 */
export async function POST(req) {
    try {
        let body;
        try {
            body = await req.json();
        } catch (parseError) {
            return NextResponse.json(
                { success: false, error: "Invalid or empty request body" },
                { status: 400 }
            );
        }

        const { submissionId, questionNo, pageNumber, imageBase64 } = body;

        if (!submissionId || !pageNumber || !imageBase64) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Convert base64 to buffer and detect type
        const isJpeg = imageBase64.startsWith("data:image/jpeg");
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Determine folder and filename
        const qFolder = questionNo ? `q${questionNo}` : "unassigned";
        const ext = isJpeg ? "jpg" : "png";
        const uploadPath = `${submissionId}/${qFolder}/page_${pageNumber}.${ext}`;

        // Upload to Supabase Storage
        const { error: uploadErr } = await supabase.storage
            .from("submissions")
            .upload(uploadPath, buffer, {
                upsert: true,
                contentType: isJpeg ? "image/jpeg" : "image/png",
            });

        if (uploadErr) {
            console.error(`⚠️ Upload error (page ${pageNumber}):`, uploadErr.message);
            return NextResponse.json(
                { success: false, error: uploadErr.message },
                { status: 500 }
            );
        }

        console.log(`✅ Uploaded page ${pageNumber} to ${uploadPath}`);
        return NextResponse.json({ success: true, path: uploadPath });
    } catch (err) {
        console.error("❌ Upload error:", err);
        return NextResponse.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}
