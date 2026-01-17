import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
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
export const maxDuration = 300; // long processing allowed

// Helper function to render PDF page to PNG buffer using pdfjs-dist + node-canvas
async function renderPdfPageToPng(pdfBuffer, pageNum, scale = 2.0) {
  // Dynamic import to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const { createCanvas } = await import("canvas");

  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  const pdfDoc = await loadingTask.promise;

  // Get the specific page
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  // Create a canvas with node-canvas
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  // Render the page to the canvas
  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  // Convert canvas to PNG buffer
  const pngBuffer = canvas.toBuffer("image/png");

  return pngBuffer;
}

// Helper function to get total pages in PDF
async function getPdfPageCount(pdfBuffer) {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  const pdfDoc = await loadingTask.promise;
  return pdfDoc.numPages;
}

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

    // 🔢 Get total number of pages
    const totalPages = await getPdfPageCount(pdfBuffer);
    console.log(`📚 Processing ${totalPages} pages...`);

    const results = [];

    for (let i = 1; i <= totalPages; i++) {
      console.log(`🖼️ Converting page ${i}...`);

      // Render page to PNG using pdfjs-dist + node-canvas
      const imageBuffer = await renderPdfPageToPng(pdfBuffer, i, 2.0);

      // ✂️ Crop top 25% for question number detection
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
      const uploadPath = `${submissionId}/${qFolder}/page_${i}.png`;

      const { error: uploadErr } = await supabase.storage
        .from("submissions")
        .upload(uploadPath, imageBuffer, {
          upsert: true,
          contentType: "image/png"
        });

      if (uploadErr)
        console.error(`⚠️ Upload error (page ${i}):`, uploadErr.message);
      else
        console.log(`✅ Uploaded page ${i} to ${uploadPath}`);

      results.push({
        page: i,
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
