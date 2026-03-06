// src/app/api/sharepoint-cookies/route.js
import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));
        const domain = body.domain || "";

        const scriptPath = path.join(process.cwd(), "scripts", "get_cookies.py");
        const cmd = domain
            ? `python3 "${scriptPath}" "${domain}"`
            : `python3 "${scriptPath}"`;

        return new Promise((resolve) => {
            exec(cmd, { timeout: 15000 }, (error, stdout, stderr) => {
                if (error) {
                    console.error("Cookie extraction error:", error.message, stderr);
                    resolve(
                        NextResponse.json(
                            {
                                success: false,
                                error: "Failed to extract cookies. Make sure you are signed in to SharePoint in your browser.",
                            },
                            { status: 500 }
                        )
                    );
                    return;
                }

                try {
                    const result = JSON.parse(stdout.trim());
                    resolve(NextResponse.json(result));
                } catch (parseErr) {
                    console.error("Failed to parse cookie script output:", stdout);
                    resolve(
                        NextResponse.json(
                            { success: false, error: "Failed to parse cookie data" },
                            { status: 500 }
                        )
                    );
                }
            });
        });
    } catch (err) {
        console.error("Cookie API error:", err);
        return NextResponse.json(
            { success: false, error: err.message || String(err) },
            { status: 500 }
        );
    }
}
