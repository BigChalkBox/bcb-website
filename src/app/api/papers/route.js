// app/api/papers/route.js
import { NextResponse } from "next/server";
import {
  createPaper,
  listPapers,
  readPaper,
  writePaper,
  paperPath,
} from "@/lib/jsonStore";

export async function GET(request) {
  // return all papers
  const papers = listPapers();
  return NextResponse.json({ success: true, data: papers });
}

export async function POST(request) {
  const body = await request.json();
  const created = createPaper(body);
  return NextResponse.json({ success: true, data: created });
}

// Use /app/api/papers/[id]/route.js for single paper operations
