// Polyfills for Node.js (required for pdfjs-dist on Vercel)
import { DOMMatrix } from "dommatrix";
import { Path2D } from "path2d";

// Polyfill DOMMatrix
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = DOMMatrix;
}

// Polyfill Path2D
if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = Path2D;
}

// Polyfill ImageData
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData {
    constructor(data, width, height) {
      if (arguments.length === 2) {
        // ImageData(width, height)
        this.width = data;
        this.height = width;
        this.data = new Uint8ClampedArray(this.width * this.height * 4);
      } else if (arguments.length === 3) {
        // ImageData(data, width, height)
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
import { pdf } from "pdf-to-img";

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
    const { submissionId } = await params;
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

    // ⬇️ Download PDF as buffer
    const res = await fetch(fileData.signedUrl);
    if (!res.ok)
      throw new Error(`Failed to download PDF (status: ${res.status})`);

    const arrayBuffer = await res.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);
    console.log("📘 PDF downloaded successfully, size:", pdfBuffer.length, "bytes");

    // � Convert PDF to images using pdf-to-img
    const pdfDocument = await pdf(pdfBuffer, { scale: 2.0 });
    console.log(`📚 Processing PDF pages...`);

    const results = [];
    let pageNumber = 0;

    for await (const imageBuffer of pdfDocument) {
      pageNumber++;
      console.log(`🖼️ Processing page ${pageNumber}...`);

      // Convert Uint8Array to Buffer if needed
      const imgBuffer = Buffer.isBuffer(imageBuffer) ? imageBuffer : Buffer.from(imageBuffer);

      // ✂️ Crop top 25% for question number detection
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
        // Clean up markdown if present
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

      // 🗂️ Upload full page image to Supabase in question folder
      const qFolder = question_no ? `q${question_no}` : "unassigned";
      const uploadPath = `${submissionId}/${qFolder}/page_${pageNumber}.png`;

      const { error: uploadErr } = await supabase.storage
        .from("submissions")
        .upload(uploadPath, imgBuffer, {
          upsert: true,
          contentType: "image/png"
        });

      if (uploadErr)
        console.error(`⚠️ Upload error (page ${pageNumber}):`, uploadErr.message);
      else
        console.log(`✅ Uploaded page ${pageNumber} to ${uploadPath}`);

      results.push({
        page: pageNumber,
        question_no,
        uploaded_to: uploadPath,
        rawText,
      });
    }

    console.log(`✅ OCR extraction & upload complete for ${results.length} pages.`);

    // ✅ Update evaluation status in Supabase
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
    else
      console.log(`📊 Evaluation status set to 'Pages Detected' for ${submissionId}`);

    return NextResponse.json({ success: true, data: results });
  } catch (err) {
    console.error("❌ Evaluation OCR error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
