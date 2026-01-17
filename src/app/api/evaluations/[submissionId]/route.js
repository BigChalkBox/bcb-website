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
import path from "path";
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
    // Dynamic import of pdfjs-dist to ensure polyfills are loaded first
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const { createCanvas } = await import("canvas");

    // Configure worker with absolute path pointing to public folder
    const workerPath = path.join(process.cwd(), "public/pdf.worker.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

    // Define NodeCanvasFactory for Node.js environment
    class NodeCanvasFactory {
      create(width, height) {
        const canvas = createCanvas(width, height);
        const context = canvas.getContext("2d");
        return { canvas, context };
      }

      reset(canvasAndContext, width, height) {
        canvasAndContext.canvas.width = width;
        canvasAndContext.canvas.height = height;
      }

      destroy(canvasAndContext) {
        canvasAndContext.canvas.width = 0;
        canvasAndContext.canvas.height = 0;
        canvasAndContext.canvas = null;
        canvasAndContext.context = null;
      }
    }

    const { submissionId } = await params;
    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: "Missing submissionId" },
        { status: 400 }
      );
    }

    // 🧾 Fetch submission
    const { data: submission, error: subErr } = await supabase
      .from("submissions")
      .select("file_path")
      .eq("id", submissionId)
      .single();

    if (subErr || !submission) {
      throw new Error("Submission not found or missing file path");
    }

    console.log("🗂️ Submission file path:", submission.file_path);

    // 🔗 Generate URL
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
    // Convert to strict Uint8Array for pdfjs
    const pdfData = new Uint8Array(arrayBuffer);
    console.log("📘 PDF downloaded, size:", pdfData.length);

    // 📄 Load PDF Document
    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
      canvasFactory: new NodeCanvasFactory(),
    });

    const pdfDoc = await loadingTask.promise;
    console.log(`📚 Processing ${pdfDoc.numPages} pages...`);

    const results = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      console.log(`🖼️ Processing page ${i}...`);

      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });

      const canvasFactory = new NodeCanvasFactory();
      const { canvas, context } = canvasFactory.create(viewport.width, viewport.height);

      await page.render({
        canvasContext: context,
        viewport: viewport,
        canvasFactory: canvasFactory
      }).promise;

      const imgBuffer = canvas.toBuffer("image/png");

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
      const uploadPath = `${submissionId}/${qFolder}/page_${i}.png`;

      const { error: uploadErr } = await supabase.storage
        .from("submissions")
        .upload(uploadPath, imgBuffer, { upsert: true, contentType: "image/png" });

      if (uploadErr) console.error(`⚠️ Upload error:`, uploadErr.message);

      results.push({ page: i, question_no, uploadPath });

      // Clean up page
      page.cleanup();
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
