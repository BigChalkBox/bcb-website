
import { NextResponse } from "next/server";
import { detectQuestionNumber, extractHandwrittenText, extractObjectiveAnswers } from "@/lib/gemini-functions";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 300; // Allow 5 mins for processing

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
    try {
        const body = await req.json();
        const { submissionId, extractionMode } = body;

        // 1. Call Python Service (PDF -> Images + Digital Text + Header)
        const pythonUrl = "http://127.0.0.1:8000/process_pdf";
        console.log("\n========================================");
        console.log("🚀 [Orchestrator] Starting PDF Processing");
        console.log(`   Submission: ${submissionId}`);
        console.log(`   Mode: ${extractionMode}`);
        console.log("========================================");
        console.log("\n🐍 [Python] Calling PDF Service...");

        const res = await fetch(pythonUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Python service error (${res.status}): ${text}`);
        }

        const pythonJson = await res.json();
        if (!pythonJson.success) {
            throw new Error(pythonJson.error || "Unknown Python error");
        }

        const pages = pythonJson.data; // List of { page, uploaded_path, header_base64, digital_text }
        console.log(`✅ [Python] Processed ${pages.length} pages`);
        console.log("\n🧠 [AI] Starting Gemini Analysis...");

        const results = [];
        const allObjectiveAnswers = {};

        // 2. Process Pages in Parallel (Limit concurrency if needed, but Promise.all is okay for <50 pages)
        const pagePromises = pages.map(async (p) => {
            const pageNum = p.page;

            // A. Detect Question Number using Header
            console.log(`\n--- Page ${pageNum} ---`);
            const detection = await detectQuestionNumber(p.header_base64); // Uses Gemini
            const pageType = detection.page_type || "subjective";
            const questionNo = detection.question_no;

            // B. Determine Final Storage Path
            let folder = "unassigned";
            if (pageType === "objective") folder = "objective";
            else if (questionNo) folder = `q${questionNo}`;

            const finalPath = `${submissionId}/${folder}/page_${pageNum}.jpeg`;

            // C. Move Image in Supabase (if folder changed from unassigned)
            // Python uploaded to: submissionId/unassigned/page_N.jpeg
            // If folder is NOT unassigned, we must move it.
            // Actually, Python uploaded to `p.uploaded_path`.
            if (p.uploaded_path !== finalPath) {
                console.log(`   📁 Moving to: ${folder}/`);
                const { error: moveError } = await supabase.storage.from("submissions")
                    .move(p.uploaded_path, finalPath);
                if (moveError) console.warn(`   ⚠️ Move failed: ${moveError.message}`);
            }

            // D. Extract Text
            let extractedText = null;
            let objectiveAnswers = null;

            if (pageType === "objective") {
                // Download Full Image for Objective Extraction
                console.log(`   📝 Extracting Objective Answers...`);
                const fullImageB64 = await downloadImageAsBase64(finalPath);
                if (fullImageB64) {
                    objectiveAnswers = await extractObjectiveAnswers(fullImageB64);
                }
            } else if (extractionMode !== 'none') {
                if (extractionMode === 'digital') {
                    extractedText = p.digital_text; // From Python (PyMuPDF)
                } else if (extractionMode === 'handwritten') {
                    // Download Full Image for OCR
                    console.log(`   ✍️  Extracting Handwritten Text...`);
                    const fullImageB64 = await downloadImageAsBase64(finalPath);
                    if (fullImageB64) {
                        extractedText = await extractHandwrittenText(fullImageB64);
                    }
                }
            }

            return {
                page: pageNum,
                page_type: pageType,
                question_no: questionNo,
                uploaded_to: finalPath,
                extracted_text: extractedText,
                objective_answers: objectiveAnswers
            };
        });

        const pageResults = await Promise.all(pagePromises);

        // Aggregate
        pageResults.forEach(r => {
            results.push(r);
            if (r.objective_answers) {
                Object.assign(allObjectiveAnswers, r.objective_answers);
            }
        });

        // 3. Update Database
        console.log("\n💾 [Database] Updating evaluations...");
        const payload = {
            status: "Pages Detected",
            result: {
                total_pages: results.length,
                pages: results.sort((a, b) => a.page - b.page),
                objective_answers: Object.keys(allObjectiveAnswers).length > 0 ? allObjectiveAnswers : null,
            }
        };

        const { error: dbError } = await supabase.from("evaluations")
            .upsert({ submission_id: submissionId, ...payload }, { onConflict: 'submission_id' })
            .select();

        if (dbError) throw dbError;

        console.log("✅ [Complete] Processing finished successfully!");
        console.log(`   Total Pages: ${results.length}`);
        console.log(`   Objective Answers: ${Object.keys(allObjectiveAnswers).length}`);
        console.log("========================================\n");

        return NextResponse.json({ success: true, data: results });

    } catch (err) {
        console.error("\n❌ [Orchestrator Error]:", err.message);
        console.error("   Stack:", err.stack);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

async function downloadImageAsBase64(path) {
    try {
        const { data, error } = await supabase.storage.from("submissions").download(path);
        if (error || !data) throw error;
        const arrayBuffer = await data.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
    } catch (e) {
        console.error(`Failed to download ${path}:`, e);
        return null;
    }
}
