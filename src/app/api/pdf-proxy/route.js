// src/app/api/pdf-proxy/route.js
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const pdfUrl = searchParams.get("url");

    if (!pdfUrl) {
        return NextResponse.json(
            { error: "PDF URL is required" },
            { status: 400 }
        );
    }

    try {
        // Fetch the PDF from Supabase
        const response = await fetch(pdfUrl);

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch PDF" },
                { status: response.status }
            );
        }

        // Get the PDF buffer
        const pdfBuffer = await response.arrayBuffer();

        // Return the PDF with proper headers
        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "inline",
                "Cache-Control": "public, max-age=31536000",
            },
        });
    } catch (error) {
        console.error("Error proxying PDF:", error);
        return NextResponse.json(
            { error: "Failed to proxy PDF" },
            { status: 500 }
        );
    }
}
