import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export async function POST(req) {
    try {
        const { submission, report, totalScore, totalMarks, paperData, detectionResult } = await req.json();

        // Create question map for OR detection
        const questionsMap = new Map();
        if (paperData?.questions) {
            for (const q of paperData.questions) {
                questionsMap.set(q.qid, q);
            }
        }

        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const m = 18;
        const w = pageWidth - 2 * m;
        let y = m;

        // Modern Color Palette
        const C = {
            primary: [15, 23, 42],
            secondary: [51, 65, 85],
            accent: [99, 102, 241],
            success: [34, 197, 94],
            warning: [251, 146, 60],
            danger: [239, 68, 68],
            light: [248, 250, 252],
            border: [226, 232, 240],
            muted: [148, 163, 184],
            white: [255, 255, 255],
            gold: [234, 179, 8],
        };

        // Helper: Fetch and compress image
        const fetchImg = async (url) => {
            try {
                const res = await fetch(url);
                if (!res.ok) return null;
                const buf = await res.arrayBuffer();

                // Try to compress image using Sharp if available
                try {
                    const sharp = (await import('sharp')).default;
                    const compressed = await sharp(Buffer.from(buf))
                        .resize({ width: 800, withoutEnlargement: true }) // Max 800px width
                        .jpeg({ quality: 70 }) // Convert to JPEG with 70% quality
                        .toBuffer();
                    return `data:image/jpeg;base64,${compressed.toString('base64')}`;
                } catch (e) {
                    // Sharp not available, return original
                    return `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
                }
            } catch { return null; }
        };

        // Helper: Load Custom Font (Roboto) via Base64
        let fontLoaded = false;
        try {
            const fs = await import('fs');
            const path = await import('path');
            const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Roboto-Regular.ttf');
            if (fs.existsSync(fontPath)) {
                const fontBuffer = fs.readFileSync(fontPath);
                const fontBase64 = fontBuffer.toString('base64');
                doc.addFileToVFS('Roboto-Regular.ttf', fontBase64);
                doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
                fontLoaded = true;
            }
        } catch (e) {
            console.warn("Font loading failed:", e);
        }

        // Helper: Normalize Unicode Mathematical Alphanumeric Symbols to ASCII
        // These are U+1D400-U+1D7FF (bold, italic, script, fraktur, etc.)
        const normalizeMathAlphanumerics = (str) => {
            let result = '';
            for (const char of str) {
                const code = char.codePointAt(0);

                // Mathematical Bold Capital (U+1D400-U+1D419) -> A-Z
                if (code >= 0x1D400 && code <= 0x1D419) {
                    result += String.fromCharCode(65 + (code - 0x1D400));
                }
                // Mathematical Bold Small (U+1D41A-U+1D433) -> a-z
                else if (code >= 0x1D41A && code <= 0x1D433) {
                    result += String.fromCharCode(97 + (code - 0x1D41A));
                }
                // Mathematical Italic Capital (U+1D434-U+1D44D) -> A-Z
                else if (code >= 0x1D434 && code <= 0x1D44D) {
                    result += String.fromCharCode(65 + (code - 0x1D434));
                }
                // Mathematical Italic Small (U+1D44E-U+1D467) -> a-z (with gap for h at U+210E)
                else if (code >= 0x1D44E && code <= 0x1D467) {
                    result += String.fromCharCode(97 + (code - 0x1D44E));
                }
                // Mathematical Bold Italic Capital (U+1D468-U+1D481) -> A-Z
                else if (code >= 0x1D468 && code <= 0x1D481) {
                    result += String.fromCharCode(65 + (code - 0x1D468));
                }
                // Mathematical Bold Italic Small (U+1D482-U+1D49B) -> a-z
                else if (code >= 0x1D482 && code <= 0x1D49B) {
                    result += String.fromCharCode(97 + (code - 0x1D482));
                }
                // Mathematical Sans-Serif Capital (U+1D5A0-U+1D5B9) -> A-Z
                else if (code >= 0x1D5A0 && code <= 0x1D5B9) {
                    result += String.fromCharCode(65 + (code - 0x1D5A0));
                }
                // Mathematical Sans-Serif Small (U+1D5BA-U+1D5D3) -> a-z
                else if (code >= 0x1D5BA && code <= 0x1D5D3) {
                    result += String.fromCharCode(97 + (code - 0x1D5BA));
                }
                // Mathematical Sans-Serif Bold Capital (U+1D5D4-U+1D5ED) -> A-Z
                else if (code >= 0x1D5D4 && code <= 0x1D5ED) {
                    result += String.fromCharCode(65 + (code - 0x1D5D4));
                }
                // Mathematical Sans-Serif Bold Small (U+1D5EE-U+1D607) -> a-z
                else if (code >= 0x1D5EE && code <= 0x1D607) {
                    result += String.fromCharCode(97 + (code - 0x1D5EE));
                }
                // Mathematical Monospace Capital (U+1D670-U+1D689) -> A-Z
                else if (code >= 0x1D670 && code <= 0x1D689) {
                    result += String.fromCharCode(65 + (code - 0x1D670));
                }
                // Mathematical Monospace Small (U+1D68A-U+1D6A3) -> a-z
                else if (code >= 0x1D68A && code <= 0x1D6A3) {
                    result += String.fromCharCode(97 + (code - 0x1D68A));
                }
                // Mathematical Bold Digits (U+1D7CE-U+1D7D7) -> 0-9
                else if (code >= 0x1D7CE && code <= 0x1D7D7) {
                    result += String.fromCharCode(48 + (code - 0x1D7CE));
                }
                // Mathematical Double-Struck Digits (U+1D7D8-U+1D7E1) -> 0-9
                else if (code >= 0x1D7D8 && code <= 0x1D7E1) {
                    result += String.fromCharCode(48 + (code - 0x1D7D8));
                }
                // Planck constant (ℎ is U+210E, mapped to 'h')
                else if (code === 0x210E) {
                    result += 'h';
                }
                // Keep everything else as-is
                else {
                    result += char;
                }
            }
            return result;
        };

        // Helper: Clean text from unicode artifacts
        const cleanText = (text) => {
            if (!text) return "";
            let str = String(text);

            // STAGE 0: Normalize Unicode Math Alphanumerics FIRST (NFKC cannot do this!)
            str = normalizeMathAlphanumerics(str);

            // STAGE 1: Convert LaTeX syntax to Unicode
            str = str.replace(/\$/g, "");

            const latexMap = {
                '\\Delta': 'Δ', '\\nabla': '∇',
                '\\partial': '∂', '\\sum': 'Σ', '\\prod': 'Π',
                '\\pi': 'π', '\\theta': 'θ', '\\phi': 'φ', '\\psi': 'ψ',
                '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ',
                '\\epsilon': 'ε', '\\lambda': 'λ', '\\mu': 'μ', '\\sigma': 'σ', '\\omega': 'ω',
                '\\rho': 'ρ', '\\tau': 'τ',
                '\\int': '∫', '\\sqrt': '√', '\\infty': '∞',
                '\\leq': '≤', '\\geq': '≥', '\\neq': '≠', '\\approx': '≈',
                '\\rightarrow': '→', '\\leftarrow': '←', '\\implies': '⇒',
                '\\times': '×', '\\div': '÷', '\\pm': '±',
                '^{-1}': '⁻¹', '^2': '²', '^3': '³', '\\,': ' '
            };

            for (const [cmd, char] of Object.entries(latexMap)) {
                str = str.split(cmd).join(char);
            }

            str = str.replace(/\{|\}/g, "");
            str = str.normalize("NFKC");

            return str
                .replace(/[ \t\r\f\v]+/g, " ")
                .trim();
        };

        const contentFont = fontLoaded ? "Roboto" : "helvetica";

        // ============ PAGE 1: COVER ============

        // DASES Brand Colors (from logo)
        const brand = {
            darkGreen: [27, 94, 32],      // #1B5E20
            green: [46, 125, 50],         // #2E7D32
            lightGreen: [129, 199, 132],  // #81C784
            paleGreen: [200, 230, 201],   // #C8E6C9
            pageBg: [248, 242, 231],      // #f8f2e7 - warm cream
            cream: [245, 240, 230],       // slightly darker cream
        };

        // Helper: Fill page background
        const fillPageBg = () => {
            doc.setFillColor(...brand.pageBg);
            doc.rect(0, 0, pageWidth, pageHeight, "F");
        };

        // Background for cover page
        fillPageBg();

        // Top green header bar
        doc.setFillColor(...brand.darkGreen);
        doc.rect(0, 0, pageWidth, 8, "F");

        // Decorative side accent
        doc.setFillColor(...brand.lightGreen);
        doc.rect(0, 8, 5, pageHeight - 8, "F");

        y = 30;

        // Logo section - load and embed the actual logo
        try {
            const fs = await import('fs');
            const path = await import('path');
            const logoPath = path.join(process.cwd(), 'public', 'logo', 'dases-final.png');
            const logoBuffer = fs.readFileSync(logoPath);
            const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
            doc.addImage(logoBase64, 'PNG', m, y, 80, 20);
            y += 30;
        } catch (e) {
            // Fallback to text if logo not found
            doc.setTextColor(...brand.darkGreen);
            doc.setFontSize(36);
            doc.setFont("helvetica", "bold");
            doc.text("DASES", m, y + 15);
            y += 25;
        }

        // Tagline
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...brand.green);
        doc.text("Digital Academic Student Evaluation System", m, y);
        y += 20;

        // Decorative line
        doc.setDrawColor(...brand.lightGreen);
        doc.setLineWidth(2);
        doc.line(m, y, m + 60, y);
        y += 15;

        // Report Title
        doc.setFontSize(24);
        doc.setTextColor(...brand.darkGreen);
        doc.setFont("helvetica", "bold");
        doc.text("Assessment Report", m, y);
        y += 25;

        // Student Card - elegant design
        doc.setFillColor(...C.white);
        doc.roundedRect(m, y, w, 65, 6, 6, "F");
        doc.setDrawColor(...brand.paleGreen);
        doc.setLineWidth(1);
        doc.roundedRect(m, y, w, 65, 6, 6, "S");

        // Green accent on card
        doc.setFillColor(...brand.green);
        doc.roundedRect(m, y, 6, 65, 6, 0, "F");

        // User icon instead of initials
        const iconX = m + 30;
        const iconY = y + 32;
        // Circle background
        doc.setFillColor(...brand.paleGreen);
        doc.circle(iconX, iconY, 18, "F");
        doc.setDrawColor(...brand.green);
        doc.setLineWidth(1.5);
        doc.circle(iconX, iconY, 18, "S");
        // Head (small circle)
        doc.setFillColor(...brand.green);
        doc.circle(iconX, iconY - 5, 6, "F");
        // Body (arc shape using ellipse)
        doc.ellipse(iconX, iconY + 12, 10, 7, "F");

        // Student Info
        const infoX = m + 60;
        doc.setTextColor(...brand.darkGreen);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(cleanText(submission.student_name), infoX, y + 22);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.secondary);
        doc.text(`Enrollment No: ${cleanText(submission.enrollment_no)}`, infoX, y + 34);
        doc.text(`Paper: ${cleanText(submission.paper_name)}`, infoX, y + 44);
        doc.text(`Submitted: ${new Date(submission.submitted_at).toLocaleDateString()}`, infoX, y + 54);

        y += 80;

        // Score Card - green themed
        const percentage = totalMarks > 0 ? ((totalScore / totalMarks) * 100).toFixed(1) : "0";
        const pct = parseFloat(percentage);
        const scoreColor = pct > 80 ? C.success : pct > 50 ? C.warning : C.danger;

        // Score container
        doc.setFillColor(...brand.cream);
        doc.roundedRect(m, y, w, 55, 6, 6, "F");
        doc.setDrawColor(...brand.paleGreen);
        doc.roundedRect(m, y, w, 55, 6, 6, "S");

        // Score section
        doc.setFillColor(...scoreColor);
        doc.roundedRect(m + 10, y + 8, w / 2 - 15, 40, 5, 5, "F");

        doc.setTextColor(...C.white);
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.text("FINAL SCORE", m + 20, y + 20);

        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text(`${totalScore} / ${totalMarks}`, m + 20, y + 40);

        // Percentage display
        doc.setFillColor(...C.white);
        doc.circle(pageWidth - m - 45, y + 28, 22, "F");
        doc.setDrawColor(...scoreColor);
        doc.setLineWidth(3);
        doc.circle(pageWidth - m - 45, y + 28, 22, "S");
        doc.setTextColor(...scoreColor);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text(`${percentage}%`, pageWidth - m - 45, y + 33, { align: "center" });

        // Grade indicator


        // Footer on cover page
        doc.setFontSize(8);
        doc.setTextColor(...brand.lightGreen);
        doc.text("Evaluated on: " + new Date(report.evaluatedAt).toLocaleDateString(), m, pageHeight - 15);
        doc.text("Powered by DASES", pageWidth - m, pageHeight - 15, { align: "right" });

        // ============ PAGE 2: 3DOWN ============
        doc.addPage();
        fillPageBg();
        y = m;

        doc.setTextColor(...C.primary);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("Score Breakdown", pageWidth / 2, y + 10, { align: "center" });
        y += 30;

        const questions = report.results || [];
        const processedIndices = new Set();

        // Build rows
        const rows = [];
        for (let i = 0; i < questions.length; i++) {
            if (processedIndices.has(i)) continue;
            const q = questions[i];
            const paperQ = questionsMap.get(q.qid);

            if (paperQ?.isOr && i + 1 < questions.length) {
                const nextQ = questions[i + 1];
                processedIndices.add(i + 1);
                const q1A = q.studentImages?.length > 0;
                const q2A = nextQ.studentImages?.length > 0;
                const attemptedQ = q1A ? q : (q2A ? nextQ : q);
                rows.push({
                    label: `Q${q.qNumber} OR Q${nextQ.qNumber}`,
                    max: attemptedQ.marks,
                    got: attemptedQ.evaluation?.suggestedScore ?? 0,
                    isOr: true,
                    attempted: q1A ? q.qNumber : (q2A ? nextQ.qNumber : null)
                });
            } else {
                rows.push({
                    label: `Question ${q.qNumber}`,
                    max: q.marks,
                    got: q.evaluation?.suggestedScore ?? 0,
                    isOr: false
                });
            }
        }

        // Centered Table styling with margins
        const tableMargin = 10; // Extra margin for the table
        const tableX = m + tableMargin;
        const tableW = w - (tableMargin * 2); // Full width minus margins
        const colW = [tableW * 0.4, tableW * 0.2, tableW * 0.2, tableW * 0.2]; // Proportional columns
        const rowH = 14;

        // Header
        doc.setFillColor(...brand.darkGreen);
        doc.roundedRect(tableX, y, tableW, rowH, 3, 3, "F");
        doc.setTextColor(...C.white);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        let tx = tableX;
        doc.text("Question", tx + 8, y + 10);
        tx += colW[0];
        doc.text("Max", tx + colW[1] / 2, y + 10, { align: "center" });
        tx += colW[1];
        doc.text("Obtained", tx + colW[2] / 2, y + 10, { align: "center" });
        tx += colW[2];
        doc.text("Percentage", tx + colW[3] / 2, y + 10, { align: "center" });
        y += rowH;

        // Helper to draw table header (for continuation on new pages)
        const drawTableHeader = () => {
            doc.setFillColor(...brand.darkGreen);
            doc.roundedRect(tableX, y, tableW, rowH, 3, 3, "F");
            doc.setTextColor(...C.white);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            let headerTx = tableX;
            doc.text("Question", headerTx + 8, y + 10);
            headerTx += colW[0];
            doc.text("Max", headerTx + colW[1] / 2, y + 10, { align: "center" });
            headerTx += colW[1];
            doc.text("Obtained", headerTx + colW[2] / 2, y + 10, { align: "center" });
            headerTx += colW[2];
            doc.text("Percentage", headerTx + colW[3] / 2, y + 10, { align: "center" });
            y += rowH;
        };

        // Data rows
        rows.forEach((r, i) => {
            // Check if we need a new page (leave space for row + possible total row)
            if (y + rowH + 20 > pageHeight - m) {
                doc.addPage();
                fillPageBg();
                y = m;

                // Redraw section title on new page
                doc.setTextColor(...C.primary);
                doc.setFontSize(18);
                doc.setFont("helvetica", "bold");
                doc.text("Score Breakdown (continued)", pageWidth / 2, y + 10, { align: "center" });
                y += 25;

                // Redraw table header
                drawTableHeader();
            }

            const pct = r.max > 0 ? (r.got / r.max) * 100 : 0;
            const rowBg = i % 2 === 0 ? C.white : [252, 250, 245];
            const accent = pct >= 80 ? C.success : pct >= 50 ? C.warning : C.danger;

            doc.setFillColor(...rowBg);
            doc.rect(tableX, y, tableW, rowH, "F");

            // Left accent bar
            doc.setFillColor(...accent);
            doc.rect(tableX, y, 4, rowH, "F");

            // Bottom border
            doc.setDrawColor(...brand.paleGreen);
            doc.setLineWidth(0.3);
            doc.line(tableX, y + rowH, tableX + tableW, y + rowH);

            doc.setFontSize(11);
            tx = tableX;

            // Question
            doc.setTextColor(...(r.isOr ? brand.green : C.secondary));
            doc.setFont("helvetica", r.isOr ? "bold" : "normal");
            let label = r.label;
            if (r.isOr && r.attempted) label += ` (Q${r.attempted})`;
            doc.text(label, tx + 10, y + 10);
            tx += colW[0];

            // Max - centered
            doc.setTextColor(...C.secondary);
            doc.setFont("helvetica", "normal");
            doc.text(r.max.toString(), tx + colW[1] / 2, y + 10, { align: "center" });
            tx += colW[1];

            // Got - centered, colored
            doc.setTextColor(...accent);
            doc.setFont("helvetica", "bold");
            doc.text(r.got.toString(), tx + colW[2] / 2, y + 10, { align: "center" });
            tx += colW[2];

            // Percentage - centered, colored
            doc.text(`${pct.toFixed(1)}%`, tx + colW[3] / 2, y + 10, { align: "center" });

            y += rowH;
        });

        // Check if we need a new page for the Total row
        if (y + rowH + 5 > pageHeight - m) {
            doc.addPage();
            fillPageBg();
            y = m;

            // Redraw section title on new page
            doc.setTextColor(...C.primary);
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("Score Breakdown (continued)", pageWidth / 2, y + 10, { align: "center" });
            y += 25;

            // Redraw table header for the total row
            drawTableHeader();
        }

        // Total row
        doc.setFillColor(...brand.darkGreen);
        doc.roundedRect(tableX, y, tableW, rowH + 2, 0, 0, "F");
        doc.setTextColor(...C.white);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        tx = tableX;
        doc.text("TOTAL", tx + 10, y + 10);
        tx += colW[0];
        doc.text(totalMarks.toString(), tx + colW[1] / 2, y + 10, { align: "center" });
        tx += colW[1];
        doc.text(totalScore.toString(), tx + colW[2] / 2, y + 10, { align: "center" });
        tx += colW[2];
        doc.text(`${percentage}%`, tx + colW[3] / 2, y + 10, { align: "center" });

        // ============ OBJECTIVE ANSWER SHEETS ============
        const objectivePages = detectionResult?.pages?.filter(p => p.page_type === 'objective') || [];

        if (objectivePages.length > 0) {
            doc.addPage();
            fillPageBg();
            y = m;

            // Section header
            doc.setFillColor(...brand.darkGreen);
            doc.roundedRect(m, y, w, 16, 4, 4, "F");
            doc.setTextColor(...C.white);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Objective Answer Sheets", m + 10, y + 11);
            y += 26;

            doc.setFontSize(10);
            doc.setTextColor(...C.secondary);
            doc.setFont("helvetica", "normal");
            doc.text(`${objectivePages.length} objective answer page${objectivePages.length > 1 ? 's' : ''} submitted`, m, y);
            y += 15;

            // Render each objective page image
            for (let pi = 0; pi < objectivePages.length; pi++) {
                const page = objectivePages[pi];
                const imgUrl = `https://crqheuuvsgtzejaestyj.supabase.co/storage/v1/object/public/submissions/${page.uploaded_to}`;
                const b64 = await fetchImg(imgUrl);

                if (b64) {
                    try {
                        const imgProps = doc.getImageProperties(b64);
                        const imgAspect = imgProps.width / imgProps.height;

                        const maxImgWidth = w - 20;
                        const minRequiredHeight = 150; // Minimum height we want for proper display
                        const availableHeight = pageHeight - y - 30;

                        // If not enough space for a proper-sized image, go to new page first
                        if (availableHeight < minRequiredHeight) {
                            doc.addPage();
                            fillPageBg();
                            y = m;
                        }

                        // Now calculate image size with full available space
                        const targetHeight = 180; // Target height for images
                        let imgWidth, imgHeight;

                        if (imgAspect < 1) {
                            // Portrait
                            imgHeight = targetHeight;
                            imgWidth = imgHeight * imgAspect;
                            if (imgWidth > maxImgWidth) {
                                imgWidth = maxImgWidth;
                                imgHeight = imgWidth / imgAspect;
                            }
                        } else {
                            // Landscape
                            imgWidth = maxImgWidth;
                            imgHeight = imgWidth / imgAspect;
                            if (imgHeight > targetHeight) {
                                imgHeight = targetHeight;
                                imgWidth = imgHeight * imgAspect;
                            }
                        }

                        // Page label
                        doc.setFontSize(10);
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(...brand.green);
                        doc.text(`Page ${pi + 1} of ${objectivePages.length}`, m, y);
                        y += 8;

                        // Center the image
                        const imgX = m + (w - imgWidth) / 2;

                        // Border around image
                        doc.setDrawColor(...C.border);
                        doc.setLineWidth(0.5);
                        doc.roundedRect(imgX - 3, y - 3, imgWidth + 6, imgHeight + 6, 3, 3, "S");

                        doc.addImage(b64, 'JPEG', imgX, y, imgWidth, imgHeight);
                        y += imgHeight + 20;

                    } catch (e) {
                        console.error("Objective page image error:", e);
                        doc.setFontSize(9);
                        doc.setTextColor(...C.danger);
                        doc.text(`[Objective page ${pi + 1} could not be loaded]`, m, y);
                        y += 15;
                    }
                }
            }
        }

        // ============ DETAILED EVALUATION ============
        processedIndices.clear();

        for (let i = 0; i < questions.length; i++) {
            if (processedIndices.has(i)) continue;
            const q = questions[i];
            const paperQ = questionsMap.get(q.qid);

            if (paperQ?.isOr && i + 1 < questions.length) {
                const nextQ = questions[i + 1];
                processedIndices.add(i + 1);

                // New page for OR group
                doc.addPage();
                fillPageBg();
                y = m;

                // OR header - cleaner design
                doc.setFillColor(...brand.paleGreen);
                doc.roundedRect(m, y, w, 18, 4, 4, "F");
                doc.setDrawColor(...brand.green);
                doc.setLineWidth(1);
                doc.roundedRect(m, y, w, 18, 4, 4, "S");

                doc.setTextColor(...brand.darkGreen);
                doc.setFontSize(13);
                doc.setFont("helvetica", "bold");
                doc.text(`CHOICE QUESTION`, m + 10, y + 12);

                doc.setTextColor(...brand.green);
                doc.setFontSize(11);
                doc.setFont("helvetica", "normal");
                doc.text(`Attempt either Q${q.qNumber} or Q${nextQ.qNumber}`, m + 85, y + 12);

                y += 28;

                // Determine which was attempted
                const q1Attempted = q.studentImages?.length > 0;
                const q2Attempted = nextQ.studentImages?.length > 0;

                // Render both OR questions with attempt status
                for (const orQ of [q, nextQ]) {
                    const wasAttempted = orQ.studentImages?.length > 0;

                    // Check if we need a new page for this question
                    if (y + 80 > pageHeight - 20) {
                        doc.addPage();
                        fillPageBg();
                        y = m;
                    }

                    await renderQuestion(orQ, wasAttempted, !wasAttempted);
                    y += 10;
                }
            } else {
                // New page for each regular question
                doc.addPage();
                fillPageBg();
                y = m;
                await renderQuestion(q, true);
            }
        }

        // Question renderer
        async function renderQuestion(q, showFull, skipDetails = false) {
            const score = q.evaluation?.suggestedScore ?? 0;
            const max = q.marks;
            const pct = max > 0 ? score / max : 0;
            const isAttempted = q.studentImages?.length > 0;
            const accent = isAttempted ? (pct > 0.8 ? C.success : pct > 0.5 ? C.warning : C.danger) : C.muted;

            // Question header
            doc.setFillColor(...C.primary);
            doc.roundedRect(m, y, w, 14, 3, 3, "F");

            doc.setTextColor(...C.white);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text(`Question ${q.qNumber}`, m + 8, y + 10);

            // Score badge
            doc.setFillColor(...accent);
            doc.roundedRect(pageWidth - m - 40, y + 3, 35, 8, 2, 2, "F");
            doc.setFontSize(10);
            doc.text(`${score} / ${max}`, pageWidth - m - 22, y + 9, { align: "center" });

            y += 22;

            // Question text
            doc.setFillColor(...C.light);
            doc.roundedRect(m, y, w, 20, 3, 3, "F");
            doc.setFontSize(10);
            doc.setTextColor(...C.secondary);

            // USE CUSTOM FONT FOR CONTENT
            doc.setFont(contentFont, "normal");

            const qClean = cleanText(q.question);
            // Limit to 100 words for PDF
            const words = qClean.split(/\s+/);
            const truncatedText = words.length > 100
                ? words.slice(0, 100).join(' ') + '...'
                : qClean;
            const lines = doc.splitTextToSize(truncatedText, w - 16);

            // Calculate dynamic box height based on content
            const lineHeight = 4;
            const textHeight = lines.length * lineHeight;
            const boxHeight = Math.max(20, textHeight + 10);

            // Check if we need a new page for long questions
            if (y + boxHeight > pageHeight - 40) {
                doc.addPage();
                fillPageBg();
                y = m;

                // Re-render question header on new page
                doc.setFillColor(...C.primary);
                doc.roundedRect(m, y, w, 14, 3, 3, "F");
                doc.setTextColor(...C.white);
                doc.setFontSize(14);
                doc.setFont("helvetica", "bold");
                doc.text(`Question ${q.qNumber} (continued)`, m + 8, y + 10);
                y += 22;
            }

            // Draw dynamic question box
            doc.setFillColor(...C.light);
            doc.roundedRect(m, y, w, boxHeight, 3, 3, "F");
            doc.setFontSize(10);
            doc.setTextColor(...C.secondary);
            doc.setFont(contentFont, "normal");
            doc.text(lines, m + 8, y + 8);

            y += boxHeight + 8;

            if (!showFull || skipDetails) {
                if (!isAttempted) {
                    // Not attempted box
                    doc.setFillColor(252, 250, 245);
                    doc.roundedRect(m + 10, y, w - 20, 14, 3, 3, "F");
                    doc.setDrawColor(...C.muted);
                    doc.setLineWidth(0.5);
                    doc.roundedRect(m + 10, y, w - 20, 14, 3, 3, "S");

                    doc.setFontSize(10);
                    doc.setTextColor(...C.muted);
                    doc.setFont("helvetica", "italic");
                    doc.text("Not attempted", m + w / 2, y + 9, { align: "center" });
                    y += 20;
                }
                return;
            }

            // Student Answer Images
            if (q.studentImages?.length > 0) {
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...C.primary);
                doc.text(`Student Answer Sheet (${q.studentImages.length} page${q.studentImages.length > 1 ? 's' : ''}):`, m, y);
                y += 10;

                for (let imgIdx = 0; imgIdx < q.studentImages.length; imgIdx++) {
                    const img = q.studentImages[imgIdx];
                    const url = `https://crqheuuvsgtzejaestyj.supabase.co/storage/v1/object/public/submissions/${img}`;
                    const b64 = await fetchImg(url);

                    if (b64) {
                        try {
                            // Get image properties to maintain aspect ratio
                            const imgProps = doc.getImageProperties(b64);
                            const imgAspect = imgProps.width / imgProps.height;

                            const maxImgWidth = w - 20;
                            let imgWidth, imgHeight;

                            // First image: fit to remaining space on page
                            // Subsequent images: full size on new page
                            if (imgIdx === 0) {
                                // Calculate available height on current page
                                const availableHeight = pageHeight - y - 25;
                                const targetHeight = Math.min(availableHeight, 180);

                                if (imgAspect < 1) {
                                    // Portrait
                                    imgHeight = targetHeight;
                                    imgWidth = imgHeight * imgAspect;
                                    if (imgWidth > maxImgWidth) {
                                        imgWidth = maxImgWidth;
                                        imgHeight = imgWidth / imgAspect;
                                    }
                                } else {
                                    // Landscape
                                    imgWidth = maxImgWidth;
                                    imgHeight = imgWidth / imgAspect;
                                    if (imgHeight > targetHeight) {
                                        imgHeight = targetHeight;
                                        imgWidth = imgHeight * imgAspect;
                                    }
                                }
                                // No page break for first image - it fits
                            } else {
                                // Subsequent images: new page with full size
                                doc.addPage();
                                fillPageBg();
                                y = m;

                                const maxH = 200;
                                if (imgAspect < 1) {
                                    imgHeight = maxH;
                                    imgWidth = imgHeight * imgAspect;
                                    if (imgWidth > maxImgWidth) {
                                        imgWidth = maxImgWidth;
                                        imgHeight = imgWidth / imgAspect;
                                    }
                                } else {
                                    imgWidth = maxImgWidth;
                                    imgHeight = imgWidth / imgAspect;
                                    if (imgHeight > maxH) {
                                        imgHeight = maxH;
                                        imgWidth = imgHeight * imgAspect;
                                    }
                                }
                            }

                            // Page indicator for multiple images
                            if (q.studentImages.length > 1) {
                                doc.setFontSize(9);
                                doc.setFont("helvetica", "italic");
                                doc.setTextColor(...C.muted);
                                doc.text(`Page ${imgIdx + 1} of ${q.studentImages.length}`, m, y);
                                y += 6;
                            }

                            // Center the image
                            const imgX = m + (w - imgWidth) / 2;

                            // Add border around image
                            doc.setDrawColor(...C.border);
                            doc.setLineWidth(0.5);
                            doc.roundedRect(imgX - 3, y - 3, imgWidth + 6, imgHeight + 6, 3, 3, "S");

                            doc.addImage(b64, 'PNG', imgX, y, imgWidth, imgHeight);
                            y += imgHeight + 15;

                        } catch (e) {
                            console.error("Image error:", e);
                            doc.setFontSize(9);
                            doc.setTextColor(...C.danger);
                            doc.text(`[Image ${imgIdx + 1} could not be loaded]`, m, y);
                            y += 10;
                        }
                    }
                }
                y += 5;
            }

            // Criteria Section - Stacked Layout
            if (q.evaluation?.criteria?.length > 0) {
                if (y + 50 > pageHeight - 20) {
                    doc.addPage();
                    fillPageBg();
                    y = m;
                }

                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(...C.primary);
                doc.text("Evaluation Criteria:", m, y);
                y += 10;

                // Each criterion as a card
                for (let ci = 0; ci < q.evaluation.criteria.length; ci++) {
                    const c = q.evaluation.criteria[ci];
                    const cp = c.max_marks > 0 ? c.obtained_marks / c.max_marks : 0;
                    const cCol = cp > 0.8 ? C.success : cp > 0.5 ? C.warning : C.danger;

                    // Marks box dimensions (fixed size for all cards)
                    const markBoxW = 25;
                    const markBoxH = 16;

                    // Fixed text width - 55% of card width for consistent appearance
                    const textStartX = m + 12;
                    const textWidth = (pageWidth - m * 2 - 70) * 0.85;


                    // Calculate text lines for dynamic height
                    const critLines = doc.splitTextToSize(cleanText(c.criterion), textWidth);
                    const fbLines = doc.splitTextToSize(cleanText(c.feedback || ""), textWidth);

                    // Calculate card height based on content (with labels)
                    const critHeight = critLines.length * 4;
                    const fbHeight = fbLines.length * 3.5;
                    const cardH = Math.max(42, 10 + critHeight + 10 + fbHeight + 8);

                    if (y + cardH > pageHeight - 20) {
                        doc.addPage();
                        fillPageBg();
                        y = m;
                    }

                    // Card background
                    doc.setFillColor(...(ci % 2 === 0 ? C.white : C.light));
                    doc.roundedRect(m, y, w, cardH, 3, 3, "F");
                    doc.setDrawColor(...C.border);
                    doc.setLineWidth(0.3);
                    doc.roundedRect(m, y, w, cardH, 3, 3, "S");

                    // Left accent bar
                    doc.setFillColor(...cCol);
                    doc.roundedRect(m, y, 4, cardH, 3, 0, "F");

                    // Marks box on right side (vertically centered)
                    const markBoxX = pageWidth - m - markBoxW - 8;
                    const markBoxY = y + (cardH - markBoxH) / 2;

                    doc.setFillColor(...cCol);
                    doc.roundedRect(markBoxX, markBoxY, markBoxW, markBoxH, 2, 2, "F");

                    doc.setTextColor(...C.white);
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    doc.text(`${c.obtained_marks}/${c.max_marks}`, markBoxX + markBoxW / 2, markBoxY + 10, { align: "center" });

                    // Current Y position for text
                    let textY = y + 8;

                    // "CRITERIA" label
                    doc.setTextColor(...C.muted);
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "normal");
                    doc.text("CRITERIA", textStartX, textY);
                    textY += 5;

                    // Criterion text (full)
                    doc.setTextColor(...C.primary);
                    doc.setFontSize(9);

                    // USE CUSTOM FONT
                    doc.setFont(contentFont, "normal"); // Regular for reading

                    doc.text(critLines, textStartX, textY);
                    textY += critHeight + 6;

                    // "FEEDBACK" label
                    doc.setTextColor(...C.muted);
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "normal");
                    doc.text("FEEDBACK", textStartX, textY);
                    textY += 5;

                    // Feedback text (full)
                    doc.setTextColor(...C.secondary);
                    doc.setFontSize(8);

                    // USE CUSTOM FONT
                    doc.setFont(contentFont, "normal");

                    doc.text(fbLines, textStartX, textY);

                    y += cardH + 5;
                }
                y += 5;
            }

            // Overall Feedback
            if (q.evaluation?.feedback) {
                // ENSURE FONT IS SET BEFORE SPLITTING to get correct text width
                doc.setFont(contentFont, "normal");
                doc.setFontSize(9); // Size must match render size

                // Calculate full feedback lines with more margin (w - 40 for safety)
                const fullFbLines = doc.splitTextToSize(cleanText(q.evaluation.feedback), w - 40);
                const lineHeight = 4;
                const headerHeight = 18;
                const padding = 12;

                // Check if we need a new page first
                if (y + 40 > pageHeight - 25) {
                    doc.addPage();
                    fillPageBg();
                    y = m;
                }

                // Calculate how many lines fit on current page
                const availableHeight = pageHeight - y - 30;
                const maxLinesOnPage = Math.floor((availableHeight - headerHeight - padding) / lineHeight);

                // If all lines fit, render normally
                if (fullFbLines.length <= maxLinesOnPage) {
                    const fbBoxH = headerHeight + fullFbLines.length * lineHeight + padding;

                    doc.setFillColor(255, 251, 235);
                    doc.roundedRect(m, y, w, fbBoxH, 3, 3, "F");
                    doc.setDrawColor(...C.gold);
                    doc.setLineWidth(0.5);
                    doc.roundedRect(m, y, w, fbBoxH, 3, 3, "S");

                    doc.setFontSize(10);
                    doc.setTextColor(...C.gold);
                    doc.setFont("helvetica", "bold");
                    doc.text("Overall Feedback:", m + 10, y + 10);

                    doc.setTextColor(...C.secondary);

                    // USE CUSTOM FONT
                    doc.setFont(contentFont, "normal");
                    doc.setFontSize(9);
                    doc.text(fullFbLines, m + 10, y + headerHeight);

                    y += fbBoxH + 8;
                } else {
                    // Split across pages
                    let linesRemaining = [...fullFbLines];
                    let isFirstPart = true;

                    while (linesRemaining.length > 0) {
                        const availH = isFirstPart ? availableHeight : pageHeight - m - 30;
                        const linesOnThisPage = Math.floor((availH - headerHeight - padding) / lineHeight);
                        const linesToRender = linesRemaining.splice(0, Math.max(1, linesOnThisPage));
                        const boxH = headerHeight + linesToRender.length * lineHeight + padding;

                        doc.setFillColor(255, 251, 235);
                        doc.roundedRect(m, y, w, boxH, 3, 3, "F");
                        doc.setDrawColor(...C.gold);
                        doc.setLineWidth(0.5);
                        doc.roundedRect(m, y, w, boxH, 3, 3, "S");

                        doc.setFontSize(10);
                        doc.setTextColor(...C.gold);
                        doc.setFont("helvetica", "bold");
                        doc.text(isFirstPart ? "Overall Feedback:" : "Overall Feedback (cont.):", m + 10, y + 10);

                        doc.setTextColor(...C.secondary);
                        doc.setFont("helvetica", "normal");
                        doc.setFontSize(9);
                        doc.text(linesToRender, m + 10, y + headerHeight);

                        y += boxH + 8;

                        if (linesRemaining.length > 0) {
                            doc.addPage();
                            fillPageBg();
                            y = m;
                            isFirstPart = false;
                        }
                    }
                }
            }
        }

        // Footer on last page
        doc.setDrawColor(...C.border);
        doc.line(m, pageHeight - 15, pageWidth - m, pageHeight - 15);
        doc.setFontSize(8);
        doc.setTextColor(...C.muted);
        doc.setFont("helvetica", "italic");
        doc.text(`Generated: ${new Date().toLocaleString()} | DASES Automated Evaluation Report`, m, pageHeight - 10);

        const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=DASES_Report_${submission.enrollment_no}.pdf`,
            },
        });

    } catch (error) {
        console.error("PDF Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate PDF", details: error.message }, { status: 500 });
    }
}
