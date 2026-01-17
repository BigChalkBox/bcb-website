// Polyfills for Node.js (required for pdfjs-dist on Vercel)
import DOMMatrix from "dommatrix";
import { Path2D } from "path2d";

// Apply Polyfills immediately
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = DOMMatrix;
}
if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = Path2D;
}
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData {
    constructor(data, width, height) {
      if (arguments.length === 2) {
        this.width = data;
        this.height = width;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      } else if (arguments.length === 3) {
        this.data = data;
        this.width = width;
        this.height = height;
      }
    }
  };
}

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import sharp from "sharp";

// ⚙️ Initialize Supabase + Gemini
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req, { params }) {
  try {
    // 动态 import to ensure polyfills are active
    const { pdf } = await import("pdf-to-img");

    const { submissionId } = await params;
    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "Missing submissionId" },
        { status: 400 }
      );
    }

    // 🧾 Fetch submission file path
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .select("file_path")
      .eq("id", submissionId)
      .single();

    if (subErr || !submission) {
      throw new Error("Submission not found or missing file path");
    }

    console.log("🗂️ Submission file path:", submission.file_path);

    // 🔗 Generate temporary signed URL
    const { data: fileData, error: fileError } = await supabase.storage
      .from("submissions")
      .createSignedUrl(submission.file_path, 300);

    if (fileError || !fileData?.signedUrl) {
      throw new Error("Failed to generate signed URL");
    }

    // ⬇️ Download PDF
    const res = await fetch(fileData.signedUrl);
    if (!res.ok) {
      throw new Error(`Failed to download PDF (status: ${res.status})`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    console.log("📘 PDF downloaded, size:", pdfBuffer.length);

    // 📄 Convert PDF to images
    const pdfDocument = await pdf(pdfBuffer, { scale: 2.0 });
    console.log(`📚 Processing PDF pages...`);

    const results = [];
    let pageNumber = 0;

    for await (const imageBuffer of pdfDocument) {
      pageNumber++;
      console.log(`🖼️ Processing page ${pageNumber}...`);

      const imgBuffer = Buffer.isBuffer(imageBuffer) ? imageBuffer : Buffer.from(imageBuffer);

      // ✂️ Crop top 25%
      const metadata = await sharp(imgBuffer).metadata();
      const cropHeight = Math.floor(metadata.height * 0.25);
      const croppedBuffer = await sharp(imgBuffer)
        .extract({
          left: 0,
          top: 0,
          width: metadata.width,
          height: cropHeight,
        })
        .png()
        .toBuffer();

      const base64Cropped = croppedBuffer.toString("base64");

      // 🧠 Gemini prompt
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

      let rawText = response.text ? response.text.trim() : "";
      if (!rawText && response.candidates?.length) {
        rawText = response.candidates[0]?.content?.parts?.[0]?.text?.trim() || "";
      }

      let question_no = null;
      try {
        let cleanJson = rawText;
        if (cleanJson.startsWith("```json")) cleanJson = cleanJson.slice(7);
        if (cleanJson.startsWith("```")) cleanJson = cleanJson.slice(3);
        if (cleanJson.endsWith("```")) cleanJson = cleanJson.slice(0, -3);
        cleanJson = cleanJson.trim();
        const parsed = JSON.parse(cleanJson);
        question_no = parsed?.question_no || null;
      } catch {
        const match = rawText.match(/\d+/);
        question_no = match ? match[0] : null;
      }

      // 🗂️ Upload
      const qFolder = question_no ? `q${question_no}` : "unassigned";
      const uploadPath = `${submissionId}/${qFolder}/page_${pageNumber}.png`;

      const { error: uploadErr } = await supabase.storage
        .from("submissions")
        .upload(uploadPath, imgBuffer, { upsert: true, contentType: "image/png" });

      if (uploadErr) console.error(`⚠️ Upload error:`, uploadErr.message);

      results.push({ page: pageNumber, question_no, uploadPath });
    }

    // ✅ Update status
    const { error: upsertError } = await supabase
      .from("evaluations")
      .upsert({
        submission_id: submissionId,
        status: "Pages Detected",
        result: { total_pages: results.length, pages: results },
        updated_at: new Date().toISOString(),
      }, { onConflict: "submission_id" });

    if (upsertError) console.error("⚠️ Status update failed:", upsertError.message);

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error("❌ Evaluation Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
