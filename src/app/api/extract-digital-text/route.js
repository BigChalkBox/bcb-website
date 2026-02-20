
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const { submissionId, pageNumber } = await req.json();

        if (!submissionId || !pageNumber) {
            return NextResponse.json({ success: false, error: "Missing submissionId or pageNumber" }, { status: 400 });
        }

        // 1. Get file path from submission
        const { data: submission, error: subError } = await supabase
            .from("submissions")
            .select("file_path")
            .eq("id", submissionId)
            .single();

        if (subError || !submission) {
            return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
        }

        // 2. Download PDF
        const { data: fileData, error: downloadError } = await supabase.storage
            .from("submissions")
            .download(submission.file_path);

        if (downloadError) {
            return NextResponse.json({ success: false, error: "Failed to download PDF" }, { status: 500 });
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // 3. Load PDF
        const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            useSystemFonts: true, // Try to resolve fonts
            disableFontFace: true, // Avoid font loading errors in node
        });

        const pdfDocument = await loadingTask.promise;

        // 4. Get page text
        // pageNumber is 1-indexed
        if (pageNumber > pdfDocument.numPages) {
            return NextResponse.json({ success: false, error: "Page number out of range" }, { status: 400 });
        }

        const page = await pdfDocument.getPage(Number(pageNumber));
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item) => item.str).join(" ");

        return NextResponse.json({ success: true, text });

    } catch (error) {
        console.error("[EXTRACT_DIGITAL_TEXT_ERROR]", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
