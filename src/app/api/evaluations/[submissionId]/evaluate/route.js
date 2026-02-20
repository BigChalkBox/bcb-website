// src/app/api/evaluations/[submissionId]/evaluate/route.js

import { generateContentWithFallback, extractTextFromResponse } from "@/lib/gemini";
import { createClient } from "@supabase/supabase-js";

// Supabase (service role)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 🔧 Helper: Log to console (Vercel filesystem is read-only)
function appendToLog(data) {
    console.log("[GEMINI_EVAL]", JSON.stringify(data, null, 2));
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
        // Extract objective answers from detection result (for auto-grading objective questions)
        const objectiveAnswers = detectionResult.objective_answers || {};

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
        console.log("🔑 Available Objective Answer Keys:", Object.keys(objectiveAnswers));
        const evaluationsPerQuestion = [];

        // Helper to find answer with loose key matching
        const findAnswer = (key) => {
            const normalizedKey = String(key).toLowerCase().trim();
            // Try exact match
            if (objectiveAnswers[key]) return objectiveAnswers[key];
            if (objectiveAnswers[normalizedKey]) return objectiveAnswers[normalizedKey];

            // Try variations
            const variations = [
                `q${normalizedKey}`,  // 1a -> q1a
                normalizedKey.replace(/^q/, ''), // q1a -> 1a
                normalizedKey.replace('.', ''),  // 1.a -> 1a
                `q${normalizedKey}`.replace('.', ''), // 1.a -> q1a
            ];

            for (const v of variations) {
                if (objectiveAnswers[v]) return objectiveAnswers[v];
            }

            // Search all keys for suffix match if key is sub-part (e.g. key="1a", stored="q.1a")
            const allKeys = Object.keys(objectiveAnswers);
            const found = allKeys.find(k => {
                const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                const keyNorm = normalizedKey.replace(/[^a-z0-9]/g, '');
                return kNorm === keyNorm || kNorm.endsWith(keyNorm);
            });

            return found ? objectiveAnswers[found] : null;
        };

        for (let qi = 0; qi < questions.length; qi++) {
            const q = questions[qi];
            const qNumber = qi + 1;

            // 🆕 Handle OBJECTIVE questions with auto-grading
            if (q.type === "objective") {
                const studentAnswer = findAnswer(qNumber);
                const correctAnswer = q.correctAnswer || null;

                let isCorrect = false;
                if (studentAnswer && correctAnswer) {
                    // Case-insensitive comparison, trim whitespace
                    const normalizedStudent = String(studentAnswer).trim().toLowerCase();
                    const normalizedCorrect = String(correctAnswer).trim().toLowerCase();
                    isCorrect = normalizedStudent === normalizedCorrect;
                }

                const score = isCorrect ? (q.marks || 0) : 0;

                evaluationsPerQuestion.push({
                    qNumber,
                    qid: q.qid || null,
                    marks: q.marks || null,
                    question: q.text || null,
                    type: "objective",
                    studentAnswer,
                    correctAnswer,
                    studentImages: [], // No images for objective questions
                    evaluation: {
                        question_number: qNumber,
                        qid: q.qid || null,
                        suggestedScore: score,
                        feedback: studentAnswer
                            ? (isCorrect
                                ? "✅ Correct answer"
                                : `❌ Incorrect. Expected: "${correctAnswer}", Got: "${studentAnswer}"`)
                            : "⚠️ No answer provided",
                        criteria: [{
                            criterion: "Answer correctness",
                            obtained_marks: score,
                            max_marks: q.marks || 0,
                            feedback: isCorrect ? "Correct" : (studentAnswer ? "Incorrect" : "Not attempted"),
                        }],
                    },
                });

                console.log(`✅ Q${qNumber} (objective): ${studentAnswer || "no answer"} → ${isCorrect ? "CORRECT" : "INCORRECT"}`);
                continue; // Skip to next question, no LLM evaluation needed
            }

            // 🆕 Handle CASE_STUDY questions with sub-parts
            if (q.type === "case_study" && q.hasSubParts && Array.isArray(q.subParts)) {
                const subPartResults = [];
                let totalScore = 0;

                for (const sub of q.subParts) {
                    const subLabel = `${qNumber}${sub.label}`; // e.g., "1a", "1b"

                    if (sub.type === "objective") {
                        // Auto-grade objective sub-part
                        const studentAnswer = findAnswer(subLabel) || findAnswer(sub.label); // Try "1a" then "a"
                        const correctAnswer = sub.correctAnswer || null;

                        let isCorrect = false;
                        if (studentAnswer && correctAnswer) {
                            const normalizedStudent = String(studentAnswer).trim().toLowerCase();
                            const normalizedCorrect = String(correctAnswer).trim().toLowerCase();
                            isCorrect = normalizedStudent === normalizedCorrect;
                        }

                        const subScore = isCorrect ? (sub.marks || 0) : 0;
                        totalScore += subScore;

                        subPartResults.push({
                            label: sub.label,
                            fullLabel: subLabel,
                            text: sub.text,
                            type: "objective",
                            marks: sub.marks,
                            studentAnswer,
                            correctAnswer,
                            score: subScore,
                            feedback: studentAnswer
                                ? (isCorrect ? "✅ Correct" : `❌ Incorrect. Expected: "${correctAnswer}"`)
                                : "⚠️ Not answered",
                        });

                        console.log(`  ✅ Q${subLabel} (objective sub-part): ${studentAnswer || "no answer"} → ${isCorrect ? "CORRECT" : "INCORRECT"}`);
                    } else {
                        // Subjective sub-part - would need images/LLM, marking as TODO for now
                        subPartResults.push({
                            label: sub.label,
                            fullLabel: subLabel,
                            text: sub.text,
                            type: "subjective",
                            marks: sub.marks,
                            score: 0, // TODO: LLM evaluation for subjective sub-parts
                            feedback: "⚠️ Subjective sub-parts require manual review",
                        });
                        console.log(`  📝 Q${subLabel} (subjective sub-part): requires LLM evaluation`);
                    }
                }

                evaluationsPerQuestion.push({
                    qNumber,
                    qid: q.qid || null,
                    marks: q.marks || null,
                    question: q.text || null,
                    type: "case_study",
                    subParts: subPartResults,
                    studentImages: [],
                    evaluation: {
                        question_number: qNumber,
                        qid: q.qid || null,
                        suggestedScore: totalScore,
                        feedback: `Case study with ${subPartResults.length} sub-parts. Objective parts auto-graded.`,
                        criteria: subPartResults.map(s => ({
                            criterion: `Part ${s.label.toUpperCase()}: ${s.text || "Sub-question"}`,
                            obtained_marks: s.score,
                            max_marks: s.marks || 0,
                            feedback: s.feedback,
                            studentAnswer: s.studentAnswer,
                            correctAnswer: s.correctAnswer,
                        })),
                    },
                });

                console.log(`📋 Q${qNumber} (case_study): ${subPartResults.length} sub-parts, total score: ${totalScore}`);
                continue;
            }

            // SUBJECTIVE questions - use LLM evaluation
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





            // NORMAL PROMPT

            const prompt = `

You are evaluating a student's handwritten answer.
You are a fair and moderate evaluator.
Be a bit lenient.

Carefully read the handwritten answer images and understand what the student has written.
Ignore any content that is crossed out.

The question has multiple official sample solutions, each with its own rubric.

Your tasks:
1. Analyze the student’s answer for correctness and understanding.
2. Choose the sample solution that best matches the student’s approach.
3. Apply ONLY that sample’s rubric.
4. Award marks based on how well each criterion is met.
5. Give partial credit where correct ideas or reasoning are shown.
6. Do not award marks for irrelevant or incorrect content.
7. If the answer is blank or unreadable, give minimal marks and explain why.

Be fair, clear, and focused on evaluating understanding rather than minor mistakes.


First, carefully and thoroughly read the student's handwritten answer images.
- Clearly understand what the student has written.
- Ignore any content that has been crossed out by the student.


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

            // 🆕 CHECK FOR EXTRACTED TEXT
            const extractedTextsForQ = pages
                .filter(p => Number(p.question_no) === qNumber && p.extracted_text)
                .map(p => p.extracted_text)
                .join("\n\n [Next Page] \n\n");

            const hasExtractedText = extractedTextsForQ && extractedTextsForQ.trim().length > 10;

            if (hasExtractedText) {
                parts.push({ text: "Student's Answer (Extracted Text via OCR/Digital Layer):" });
                parts.push({ text: extractedTextsForQ });

                // Add images as reference anyway? User said "send the text INSTEAD of images"
                // But it might be safer to send images as fallback if token limit allows? 
                // User instruction was explicit: "send the text instead of images"
                parts.push({ text: "(Note: The text above was extracted from the student's answer sheet. Evaluate this text primarily.)" });
                console.log(`Q${qNumber}: Using extracted text (${extractedTextsForQ.length} chars) instead of images.`);
            } else {
                const studentImgs = questionToStudentImages[qi] || [];
                if (studentImgs.length) {
                    parts.push({ text: "Student's handwritten answer (images in order):" });
                    for (const img of studentImgs) {
                        parts.push({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
                    }
                } else {
                    parts.push({ text: "No student images found for this question (possibly skipped)." });
                }
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

                const { response, model } = await generateContentWithFallback({
                    contents: [{ role: "user", parts }],
                    preferredModel: "gemini-2.5-flash",
                    maxRetries: 2,
                    baseDelay: 1000,
                });

                const raw = extractTextFromResponse(response);
                console.log(`Q${qNumber} evaluated with model: ${model}`);

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
