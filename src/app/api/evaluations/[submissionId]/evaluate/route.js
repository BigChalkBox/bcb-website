// src/app/api/evaluations/[submissionId]/evaluate/route.js

import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

// Supabase (service role)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🧾 Log file path
const LOG_FILE_PATH = path.resolve("./gemini_eval.log");

// 🔧 Helper: Append structured logs safely
function appendToLog(data) {
    try {
        const timestamp = new Date().toISOString();
        const entry = `\n\n=== [${timestamp}] Gemini Evaluation Log ===\n${JSON.stringify(
            data,
            null,
            2
        )}\n==========================================\n`;
        fs.appendFileSync(LOG_FILE_PATH, entry, "utf8");
    } catch (err) {
        console.error("Failed to write to gemini_eval.log:", err);
    }
}

export async function POST(request, { params }) {
    try {
        const { submissionId } = await params;
        if (!submissionId)
            return Response.json({ success: false, error: "submissionId required" }, { status: 400 });

        // 1️⃣ Load existing evaluation metadata
        const { data: evalRows, error: evalErr } = await supabase
            .from("evaluations")
            .select("id, submission_id, status, result")
            .eq("submission_id", submissionId)
            .limit(1);

        if (evalErr) {
            console.error("Supabase fetch evaluations error:", evalErr);
            return Response.json({ success: false, error: "Failed to fetch evaluation metadata" }, { status: 500 });
        }

        if (!evalRows || evalRows.length === 0) {
            return Response.json(
                { success: false, error: "No evaluation metadata found for this submission. Run detection first." },
                { status: 404 }
            );
        }

        const evalRow = evalRows[0];
        let detectionResult = evalRow.result || null;
        if (!detectionResult) {
            return Response.json(
                { success: false, error: "No detection result present in evaluations.result for this submission." },
                { status: 400 }
            );
        }

        if (typeof detectionResult === "string") {
            try {
                detectionResult = JSON.parse(detectionResult);
            } catch {
                return Response.json({ success: false, error: "Invalid detection JSON in evaluations.result" }, { status: 500 });
            }
        }

        const pages = Array.isArray(detectionResult.pages) ? detectionResult.pages : [];

        // 2️⃣ Load submission to get paper_id
        const { data: submissionRow, error: subErr } = await supabase
            .from("submissions")
            .select("id, paper_id, file_path, student_name, enrollment_no")
            .eq("id", submissionId)
            .single();

        if (subErr || !submissionRow)
            return Response.json({ success: false, error: "Submission not found" }, { status: 404 });

        const paperId = submissionRow.paper_id;
        if (!paperId)
            return Response.json({ success: false, error: "Submission has no paper_id" }, { status: 400 });

        // 3️⃣ Load paper data
        const { data: paperRow, error: paperErr } = await supabase
            .from("papers")
            .select("id, paper_data")
            .eq("id", paperId)
            .single();

        if (paperErr || !paperRow)
            return Response.json({ success: false, error: "Paper not found" }, { status: 404 });

        const paperData = paperRow.paper_data || {};
        const questions = Array.isArray(paperData.questions) ? paperData.questions : [];

        function detectMimeType(filePathOrUrl) {
            const lower = String(filePathOrUrl || "").toLowerCase();
            if (lower.endsWith(".png")) return "image/png";
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
            if (lower.endsWith(".webp")) return "image/webp";
            return "image/png";
        }

        async function downloadStorageAsBase64(storagePath) {
            try {
                const { data, error } = await supabase.storage.from("submissions").download(storagePath);
                if (error) {
                    console.warn("Storage download error:", storagePath, error.message || error);
                    return null;
                }
                let buffer;
                if (data.arrayBuffer) {
                    const ab = await data.arrayBuffer();
                    buffer = Buffer.from(ab);
                } else if (Buffer.isBuffer(data)) {
                    buffer = data;
                } else {
                    const resp = new Response(data);
                    const ab = await resp.arrayBuffer();
                    buffer = Buffer.from(ab);
                }
                if (!buffer) return null;
                return {
                    base64: buffer.toString("base64"),
                    mimeType: detectMimeType(storagePath),
                };
            } catch (err) {
                console.error("downloadStorageAsBase64 error:", err);
                return null;
            }
        }

        async function fetchUrlAsBase64(url) {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    console.warn("fetchUrlAsBase64 failed for", url, res.status);
                    return null;
                }
                const ab = await res.arrayBuffer();
                const buffer = Buffer.from(ab);
                const ct = res.headers.get("content-type") || detectMimeType(url);
                return { base64: buffer.toString("base64"), mimeType: ct.split(";")[0] || detectMimeType(url) };
            } catch (err) {
                console.error("fetchUrlAsBase64 error:", err, url);
                return null;
            }
        }

        function extractFirstJson(text) {
            if (!text || typeof text !== "string") return null;
            let t = text.trim();
            t = t.replace(/^\uFEFF/, "");
            t = t.replace(/^```(?:json)?\s*/, "");
            t = t.replace(/```$/, "").trim();
            const firstBrace = t.indexOf("{");
            const lastBrace = t.lastIndexOf("}");
            if (firstBrace === -1 || lastBrace === -1) return null;
            const candidate = t.slice(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(candidate);
            } catch {
                const fixed = candidate
                    .replace(/([^{,:\s]+)\s*:/g, (m, p1) => (p1.startsWith('"') ? m : `"${p1}":`))
                    .replace(/,(\s*[}\]])/g, "$1");
                try {
                    return JSON.parse(fixed);
                } catch (err2) {
                    console.warn("extractFirstJson failed to parse candidate JSON:", err2.message);
                    return null;
                }
            }
        }

        // 4️⃣ Map pages → questions
        const questionToStudentImages = {};
        const unassignedPages = [];

        for (const p of pages) {
            const qnoRaw = p.question_no;
            const uploaded_to = p.uploaded_to;
            if (!uploaded_to) {
                unassignedPages.push(p);
                continue;
            }
            const qNum = typeof qnoRaw === "number" ? qnoRaw : Number(qnoRaw);
            if (!Number.isFinite(qNum)) {
                unassignedPages.push(p);
                continue;
            }
            const qIndex = qNum - 1;
            const img = await downloadStorageAsBase64(uploaded_to);
            if (!img) continue;
            questionToStudentImages[qIndex] = questionToStudentImages[qIndex] || [];
            questionToStudentImages[qIndex].push({ ...img, source: uploaded_to });
        }

        // 5️⃣ Evaluate each question
        const evaluationsPerQuestion = [];

        for (let qi = 0; qi < questions.length; qi++) {
            const q = questions[qi];
            const qNumber = qi + 1;
            const samples = Array.isArray(q.samples) ? q.samples : [];

            const sampleBlocks = samples.map((s, idx) => {
                const rubricList = s.rubric?.criteria || [];
                const rubricText = rubricList
                    .map((c, i) => `  ${i + 1}. (${c.weight ?? 1} marks) ${c.criterion}`)
                    .join("\n");
                return `
SAMPLE Answer${idx + 1}:
${typeof s.answer === "string" ? s.answer : JSON.stringify(s.answer, null, 2)}
Rubric for this sample:
${rubricText || "[No rubric available]"}
`;
            }).join("\n\n---\n\n");

            const prompt = `
You are a VERY STRICT and expert exam evaluator.

You are given one student's handwritten answer (as images) for a specific question.

This question has multiple official sample solutions, and each sample has its own rubric.

Your tasks are:
1. Analyze the student’s answer.
2. Decide which sample solution (from the list below) the student’s work most closely matches.
3. Apply *only that sample’s rubric* to evaluate the student’s performance.
4. Award marks per criterion, give feedback per criterion, and compute the total score.
5. Be generous in partial credit for correct reasoning.
6. If the handwriting or answer is blank/unreadable, give minimal marks and explain.
7. BE STRICT: Do not award marks for any criterion not clearly met.

Return STRICTLY valid JSON (no markdown, no commentary) structured as:
{
  "question_number": ${qNumber},
  "qid": "${q.qid || ""}",
  "used_sample_index": <number | null>,
  "criteria": [
    { "criterion": "<text>", "obtained_marks": <number>, "max_marks": <number>, "feedback": "<text>" }
  ],
  "suggestedScore": <number>,
  "feedback": "<overall feedback>"
}

---

QUESTION:
${q.text || "[No text provided]"}

TOTAL MARKS: ${q.marks ?? "N/A"}

AVAILABLE SAMPLES (each has its own rubric) choose one SAMPLE to which student answer resonates the most:
${sampleBlocks}
`;

            const parts = [{ text: prompt }];

            for (let si = 0; si < samples.length; si++) {
                const s = samples[si];
                if (Array.isArray(s.instructionImages)) {
                    for (const url of s.instructionImages) {
                        const img = await fetchUrlAsBase64(url);
                        if (img) {
                            parts.push({ text: `Sample ${si + 1} instruction image:` });
                            parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
                        }
                    }
                }
                if (Array.isArray(s.answerImages)) {
                    for (const url of s.answerImages) {
                        const img = await fetchUrlAsBase64(url);
                        if (img) {
                            parts.push({ text: `Sample ${si + 1} answer image:` });
                            parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
                        }
                    }
                }
            }

            const studentImgs = questionToStudentImages[qi] || [];
            if (studentImgs.length) {
                parts.push({ text: "Student's handwritten answer (images in order):" });
                for (const img of studentImgs) {
                    parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
                }
            } else {
                parts.push({ text: "No student images found for this question (possibly skipped)." });
            }

            console.log(`Sending Q${qNumber} (qid=${q.qid || "n/a"}) to Gemini — parts: ${parts.length}`);

            let responseObjRaw = null;
            try {
                // 🧠 Log what we send to Gemini
                appendToLog({
                    submissionId,
                    question_number: qNumber,
                    qid: q.qid || null,
                    type: "REQUEST_TO_GEMINI",
                    payload: parts.map((p) => (p.text ? { text: p.text.slice(0, 3000) } : { inlineData: "[image data]" })),
                });

                const response = await genAI.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: [{ role: "user", parts }],
                });

                let raw = "";
                if (response.text) raw = response.text.trim();
                else if (response.candidates?.length) {
                    raw = response.candidates[0]?.content?.parts?.[0]?.text?.trim() || "";
                }

                // 🧠 Log what we received
                appendToLog({
                    submissionId,
                    question_number: qNumber,
                    qid: q.qid || null,
                    type: "RESPONSE_FROM_GEMINI",
                    rawResponse: raw.slice(0, 10000),
                });

                const parsed = extractFirstJson(raw);
                if (!parsed) {
                    console.warn(`Q${qNumber}: LLM returned uninterpretable JSON. Raw:`, raw.slice(0, 200));
                    responseObjRaw = { error: "LLM did not return valid JSON", raw, parsed: null };
                } else {
                    responseObjRaw = parsed;
                }
            } catch (err) {
                console.error(`Error evaluating Q${qNumber}:`, err);
                appendToLog({
                    submissionId,
                    question_number: qNumber,
                    qid: q.qid || null,
                    type: "ERROR",
                    message: err.message,
                    stack: err.stack,
                });
                responseObjRaw = { error: err.message };
            }

            evaluationsPerQuestion.push({
                qNumber,
                qid: q.qid || null,
                marks: q.marks || null,
                question: q.text || null,
                studentImages: (questionToStudentImages[qi] || []).map((i) => i.source),
                evaluation: responseObjRaw,
            });
        }


        // 6️⃣ Save final evaluation results (in evaluation_results column)
        const evaluationReport = {
            submissionId,
            evaluatedAt: new Date().toISOString(),
            totalQuestions: questions.length,
            results: evaluationsPerQuestion,
        };

        const { error: updateErr } = await supabase
            .from("evaluations")
            .update({
                status: "Evaluated",
                evaluation_results: evaluationReport, // 👈 store here instead of result
                updated_at: new Date().toISOString(),
            })
            .eq("submission_id", submissionId);

        if (updateErr) {
            appendToLog({
                submissionId,
                type: "SAVE_ERROR",
                message: updateErr.message,
            });

            const { error: insertErr } = await supabase
                .from("evaluations")
                .insert({
                    submission_id: submissionId,
                    status: "Evaluated",
                    evaluation_results: evaluationReport, // 👈 same here
                })
                .select()
                .single();

            if (insertErr) {
                appendToLog({
                    submissionId,
                    type: "SAVE_FATAL",
                    message: insertErr.message,
                });
                return Response.json({ success: false, error: "Failed to save evaluation results" }, { status: 500 });
            }
        }

        return Response.json({
            success: true,
            message: "Evaluation complete",
            submissionId,
            savedResult: evaluationReport,
            resultsCount: evaluationsPerQuestion.length,
        });
    } catch (err) {
        console.error("Evaluation handler error:", err);
        appendToLog({
            type: "FATAL_ERROR",
            message: err.message,
            stack: err.stack,
        });
        return Response.json({ success: false, error: err.message }, { status: 500 });
    }
}
