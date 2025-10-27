import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { fromPath } from "pdf2pic";
import { execSync } from "child_process";

// ⚙️ Initialize Supabase + Gemini
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export const runtime = "nodejs";
export const maxDuration = 300; // long processing allowed

export async function POST(req, { params }) {
  try {
    const { submissionId } = params;
    if (!submissionId)
      return NextResponse.json(
        { success: false, error: "Missing submissionId" },
        { status: 400 }
      );

    // 🧾 Fetch submission file path
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .select("file_path")
      .eq("id", submissionId)
      .single();

    if (subErr || !submission)
      throw new Error("Submission not found or missing file path");

    console.log("🗂️ Submission file path:", submission.file_path);

    // 🔗 Generate temporary signed URL for the PDF
    const { data: fileData, error: fileError } = await supabase.storage
      .from("submissions")
      .createSignedUrl(submission.file_path, 300);

    if (fileError || !fileData?.signedUrl)
      throw new Error("Failed to generate signed URL for submission file");

    // ⬇️ Download PDF to temp directory
    const tempDir = path.join(tmpdir(), `eval_${uuidv4()}`);
    await fs.mkdir(tempDir, { recursive: true });
    const pdfPath = path.join(tempDir, "input.pdf");

    const res = await fetch(fileData.signedUrl);
    if (!res.ok)
      throw new Error(`Failed to download PDF (status: ${res.status})`);

    const arrayBuffer = await res.arrayBuffer();
    await fs.writeFile(pdfPath, Buffer.from(arrayBuffer));
    console.log("📘 PDF downloaded successfully →", pdfPath);

    // 📄 Initialize pdf2pic converter
    const convert = fromPath(pdfPath, {
      density: 200,
      saveFilename: "page",
      savePath: tempDir,
      format: "png",
      width: 1200,
      height: 1600,
    });

    // 🔢 Get total number of pages
    let totalPages = 1;
    try {
      const output = execSync(`pdfinfo "${pdfPath}" | grep Pages`).toString();
      const match = output.match(/\d+/);
      if (match) totalPages = parseInt(match[0], 10);
    } catch {
      console.warn("⚠️ Unable to count pages accurately, defaulting to 1");
    }

    console.log(`📚 Processing ${totalPages} pages...`);
    const results = [];

    for (let i = 1; i <= totalPages; i++) {
      console.log(`🖼️ Converting page ${i}...`);
      const output = await convert(i);
      const imagePath = output?.path;
      if (!imagePath) throw new Error(`Failed to convert page ${i}`);

      const imageBuffer = await fs.readFile(imagePath);

      // ✂️ Crop top 25%
      const metadata = await sharp(imageBuffer).metadata();
      const cropHeight = Math.floor(metadata.height * 0.25);
      const croppedBuffer = await sharp(imageBuffer)
        .extract({
          left: 0,
          top: 0,
          width: metadata.width,
          height: cropHeight,
        })
        .png()
        .toBuffer();

      const base64Cropped = croppedBuffer.toString("base64");

      // 🧠 Gemini prompt for Q detection
      const prompt = `
You are a precise OCR assistant. The image shows the top section of an exam answer sheet.
Your job: detect the number written next to "Q. No" (or "Question Number").
Return valid JSON:
{ "question_no": "<number or null if unclear>" }`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: "image/png", data: base64Cropped } },
              { text: prompt },
            ],
          },
        ],
      });

      let rawText = "";
      if (response.text) rawText = response.text.trim();
      else if (response.candidates?.length)
        rawText =
          response.candidates[0]?.content?.parts?.[0]?.text?.trim() || "";

      let question_no = null;
      try {
        const parsed = JSON.parse(rawText);
        question_no = parsed?.question_no || null;
      } catch {
        const match = rawText.match(/\d+/);
        question_no = match ? match[0] : null;
      }

      // 🗂️ Upload full page image to Supabase in question folder
      const qFolder = question_no ? `q${question_no}` : "unassigned";
      const uploadPath = `${submissionId}/${qFolder}/page_${i}.png`;

      const { error: uploadErr } = await supabase.storage
        .from("submissions")
        .upload(uploadPath, imageBuffer, { upsert: true });

      if (uploadErr)
        console.error(`⚠️ Upload error (page ${i}):`, uploadErr.message);

      results.push({
        page: i,
        question_no,
        uploaded_to: uploadPath,
        rawText,
      });
    }

    console.log(`✅ OCR extraction & upload complete for ${results.length} pages.`);

    // ✅ NEW: Update evaluation status in Supabase
    const { error: upsertError } = await supabase
      .from("evaluations")
      .upsert(
        {
          submission_id: submissionId,
          status: "Pages Detected",
          result: { total_pages: results.length, pages: results },
          updated_at: new Date().toISOString(),
        },
        { onConflict: "submission_id" }
      );

    if (upsertError)
      console.error("⚠️ Failed to update evaluation status:", upsertError.message);
    else console.log(`📊 Evaluation status set to 'Pages Detected' for ${submissionId}`);

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error("❌ Evaluation OCR error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
