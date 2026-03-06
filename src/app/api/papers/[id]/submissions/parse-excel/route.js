// src/app/api/papers/[id]/submissions/parse-excel/route.js
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function POST(req, { params }) {
    try {
        const { id: paperId } = await params;
        if (!paperId) {
            return NextResponse.json({ success: false, error: "Missing paper id" }, { status: 400 });
        }

        const formData = await req.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        // Map the known column names to our internal format
        const rows = rawRows.map((row, index) => {
            // Find the submission link column — "Submit Test Here" or any column with "submit" or "upload" in its name
            const linkKey = Object.keys(row).find(
                (k) =>
                    k.toLowerCase().includes("submit") ||
                    k.toLowerCase().includes("upload")
            );

            // Find the Sap ID column
            const sapKey = Object.keys(row).find(
                (k) => k.toLowerCase().includes("sap")
            );

            return {
                id: row["ID"] ?? row["Id"] ?? row["id"] ?? index + 1,
                name: row["Name"] ?? row["name"] ?? row["Name2"] ?? "",
                email: row["Email"] ?? row["email"] ?? "",
                sapId: sapKey ? String(row[sapKey]).trim() : "",
                batch: row["Batch"] ?? row["batch"] ?? "",
                startTime: row["Start time"] ?? "",
                completionTime: row["Completion time"] ?? "",
                submissionLink: linkKey ? String(row[linkKey]).trim() : "",
            };
        });

        return NextResponse.json({
            success: true,
            rows,
            totalRows: rows.length,
            sheetName,
        });
    } catch (error) {
        console.error("Error parsing XLSX:", error);
        return NextResponse.json(
            { success: false, error: "Failed to parse the Excel file", details: error.message },
            { status: 500 }
        );
    }
}
