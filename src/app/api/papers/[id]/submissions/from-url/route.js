// src/app/api/papers/[id]/submissions/from-url/route.js
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 120; // Allow up to 2 minutes for download + upload

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req, { params }) {
    try {
        const { id: paperId } = await params;
        if (!paperId) {
            return NextResponse.json({ success: false, error: "Missing paper id" }, { status: 400 });
        }

        const body = await req.json();
        const { url, student_name, enrollment_no, email, cookies } = body;

        if (!url || !student_name || !enrollment_no || !email) {
            return NextResponse.json(
                { success: false, error: "Missing required fields (url, student_name, enrollment_no, email)" },
                { status: 400 }
            );
        }

        // 1) Validate paper exists and read subject_name
        const { data: paperRow, error: paperErr } = await supabase
            .from("papers")
            .select("subject_name")
            .eq("id", paperId)
            .single();

        if (paperErr || !paperRow) {
            return NextResponse.json({ success: false, error: "Invalid paper ID" }, { status: 400 });
        }

        const paperName = paperRow.subject_name || "paper";
        const cleanPaperName = paperName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

        // 2) Prepare download URL — force file download for SharePoint/OneDrive
        let downloadUrl = url;
        if (downloadUrl.includes("sharepoint.com") || downloadUrl.includes("onedrive.live.com")) {
            if (downloadUrl.includes("?")) {
                downloadUrl = downloadUrl.split("?")[0] + "?download=1";
            } else {
                downloadUrl = downloadUrl + "?download=1";
            }
        }

        // 3) Download the file from the SharePoint URL
        const headers = {
            "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        };
        if (cookies) {
            headers["Cookie"] = cookies;
        }

        const response = await fetch(downloadUrl, {
            headers,
            redirect: "follow",
        });

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Failed to download file: HTTP ${response.status}`,
                    statusCode: response.status,
                },
                { status: 502 }
            );
        }

        const contentType = response.headers.get("content-type") || "";
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Check if we actually got a PDF
        const magic = buffer.slice(0, 4).toString();
        const isPdf = magic === "%PDF" || contentType.includes("application/pdf");

        if (buffer.length < 100) {
            return NextResponse.json(
                { success: false, error: "Downloaded file is too small — likely an error page" },
                { status: 502 }
            );
        }

        // 4) Upload to Supabase storage
        const cleanEnrollment = enrollment_no.replace(/[^a-zA-Z0-9_.]/g, "");
        const fileName = `${cleanEnrollment}_${paperId}_${cleanPaperName}.pdf`;
        const filePath = `${paperId}/${fileName}`;

        const { error: uploadErr } = await supabase.storage
            .from("submissions")
            .upload(filePath, buffer, {
                upsert: true,
                contentType: "application/pdf",
            });

        if (uploadErr) {
            console.error("Storage upload error:", uploadErr);
            return NextResponse.json({ success: false, error: "Failed to upload file to storage" }, { status: 500 });
        }

        // 5) Insert submission row
        const { data, error: insertErr } = await supabase
            .from("submissions")
            .insert([
                {
                    student_name: student_name,
                    enrollment_no: enrollment_no,
                    email,
                    paper_id: paperId,
                    paper_name: paperName,
                    file_path: filePath,
                },
            ])
            .select()
            .single();

        if (insertErr) {
            // Handle duplicate
            if (insertErr.code === "23505" || insertErr.code === "23503") {
                return NextResponse.json(
                    { success: false, error: "This student has already submitted for this paper.", duplicate: true },
                    { status: 400 }
                );
            }
            console.error("Insert submission error:", insertErr);
            return NextResponse.json({ success: false, error: insertErr.message || String(insertErr) }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            submission: data,
            isPdf,
            contentType,
            fileSize: buffer.length,
        });
    } catch (err) {
        console.error("From-URL submission error:", err);
        return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 });
    }
}
