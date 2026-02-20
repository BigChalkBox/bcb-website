import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export async function POST(req, { params }) {
    try {
        const { id: paperId } = await params;
        const { paperName, questions, intelligence, coverage } = await req.json();

        if (!intelligence?.quickpass) {
            return NextResponse.json({ success: false, error: "No QuickPass analysis data" }, { status: 400 });
        }

        const qp = intelligence.quickpass;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const m = 18;
        const w = pageWidth - 2 * m;
        let y = m;

        // Color Palette
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
        };

        const brand = {
            darkGreen: [27, 94, 32],
            green: [46, 125, 50],
            lightGreen: [129, 199, 132],
            paleGreen: [200, 230, 201],
            pageBg: [248, 242, 231],
        };

        const fillPageBg = () => {
            doc.setFillColor(...brand.pageBg);
            doc.rect(0, 0, pageWidth, pageHeight, "F");
        };

        // ============ PAGE 1: COVER ============
        fillPageBg();

        // Header bar
        doc.setFillColor(...brand.darkGreen);
        doc.rect(0, 0, pageWidth, 8, "F");
        doc.setFillColor(...brand.lightGreen);
        doc.rect(0, 8, 5, pageHeight - 8, "F");

        y = 30;

        // Logo/Title
        doc.setTextColor(...brand.darkGreen);
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("DASES", m, y);
        y += 10;

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...brand.green);
        doc.text("Paper Moderation Report", m, y);
        y += 15;

        // Decorative line
        doc.setDrawColor(...brand.lightGreen);
        doc.setLineWidth(2);
        doc.line(m, y, m + 60, y);
        y += 20;

        // Report Title
        doc.setFontSize(22);
        doc.setTextColor(...brand.darkGreen);
        doc.setFont("helvetica", "bold");
        doc.text("QuickPass Analysis", m, y);
        y += 25;

        // Paper Info Card
        doc.setFillColor(...C.white);
        doc.roundedRect(m, y, w, 40, 6, 6, "F");
        doc.setDrawColor(...brand.paleGreen);
        doc.setLineWidth(1);
        doc.roundedRect(m, y, w, 40, 6, 6, "S");
        doc.setFillColor(...brand.green);
        doc.roundedRect(m, y, 6, 40, 6, 0, "F");

        doc.setTextColor(...brand.darkGreen);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(paperName || "Untitled Paper", m + 15, y + 18);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...C.secondary);
        doc.text(`${questions?.length || 0} Questions Analyzed`, m + 15, y + 30);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, m + w - 70, y + 30);

        y += 50;

        // Issue Summary
        doc.setTextColor(...C.primary);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Issue Summary", m, y);
        y += 12;

        const checksRun = qp.checks_run || [];
        const issueCategories = [
            { id: 'typos', label: 'Typos', count: qp.spelling?.errors?.length || 0 },
            { id: 'readability', label: 'Readability', count: qp.clarity?.issues?.length || 0 },
            { id: 'unclear', label: 'Unclear', count: qp.ambiguity?.flags?.length || 0 },
            { id: 'marks', label: 'Marks', count: qp.marks_effort?.warnings?.length || 0 },
            { id: 'or_balance', label: 'OR Balance', count: qp.or_conflicts?.issues?.length || 0 },
            { id: 'duplicates', label: 'Duplicates', count: qp.duplicates?.pairs?.length || 0 },
            { id: 'grading', label: 'Grading', count: qp.evaluation_smoothness?.issues?.length || 0 },
        ];

        const colW = w / 2 - 5;
        let col = 0;
        let rowY = y;

        issueCategories.forEach((cat, i) => {
            const analyzed = checksRun.includes(cat.id);
            const x = m + (col * (colW + 10));

            doc.setFillColor(...(cat.count > 0 ? [254, 242, 242] : analyzed ? [240, 253, 244] : [249, 250, 251]));
            doc.roundedRect(x, rowY, colW, 14, 3, 3, "F");

            const borderColor = cat.count > 0 ? C.danger : analyzed ? C.success : C.muted;
            doc.setFillColor(...borderColor);
            doc.rect(x, rowY, 4, 14, "F");

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(...C.secondary);
            doc.text(cat.label, x + 10, rowY + 9);

            doc.setFont("helvetica", "bold");
            doc.setTextColor(...borderColor);
            const statusText = !analyzed ? "Not analyzed" : (cat.count === 0 ? "No issues" : `${cat.count} issue${cat.count > 1 ? 's' : ''}`);
            doc.text(statusText, x + colW - 5, rowY + 9, { align: "right" });

            col++;
            if (col >= 2) {
                col = 0;
                rowY += 18;
            }
        });

        // ============ PAGE 2: COVERAGE ANALYSIS ============
        if (coverage) {
            doc.addPage();
            fillPageBg();
            y = m;

            // Section header
            doc.setFillColor(...brand.darkGreen);
            doc.roundedRect(m, y, w, 16, 4, 4, "F");
            doc.setTextColor(...C.white);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Coverage Analysis", m + 10, y + 11);
            y += 26;

            // Overall coverage score
            const overallCoverage = coverage.overall || 0;
            const coverageColor = overallCoverage >= 80 ? C.success : overallCoverage >= 50 ? C.warning : C.danger;

            doc.setFillColor(...C.white);
            doc.roundedRect(m, y, w, 50, 6, 6, "F");
            doc.setDrawColor(...brand.paleGreen);
            doc.roundedRect(m, y, w, 50, 6, 6, "S");

            // Coverage circle
            doc.setFillColor(...coverageColor);
            doc.circle(m + 35, y + 25, 18, "F");
            doc.setTextColor(...C.white);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text(`${overallCoverage}%`, m + 35, y + 29, { align: "center" });

            doc.setTextColor(...C.primary);
            doc.setFontSize(14);
            doc.text("Curriculum Coverage", m + 70, y + 20);

            const coverageLabel = overallCoverage >= 80 ? "Excellent coverage" : overallCoverage >= 50 ? "Partial coverage" : "Low coverage";
            doc.setFontSize(10);
            doc.setTextColor(...coverageColor);
            doc.text(coverageLabel, m + 70, y + 32);

            // Stats
            doc.setFontSize(9);
            doc.setTextColor(...C.secondary);
            doc.text(`Topics Covered: ${coverage.coveredTopics || 0}`, m + 70, y + 42);
            doc.text(`Uncovered Topics: ${coverage.uncoveredTopics?.length || 0}`, m + 130, y + 42);

            y += 60;

            // CO (Course Outcome) Distribution with Units & Questions
            if (coverage.coAnalysis?.length > 0) {
                doc.setTextColor(...C.primary);
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text("Course Outcome (CO) Coverage", m, y);
                y += 12;

                const coData = coverage.coAnalysis.slice(0, 6);
                coData.forEach((co) => {
                    // Check if we need a new page
                    if (y + 30 > pageHeight - 20) {
                        doc.addPage();
                        fillPageBg();
                        y = m;
                    }

                    const pct = Math.round(co.coverage || 0);
                    const barColor = pct >= 80 ? C.success : pct >= 50 ? C.warning : C.danger;

                    // CO Header with bar
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(...C.primary);
                    const coLabel = co.code || `CO${co.id}`;
                    doc.text(coLabel, m, y + 5);

                    // Bar background
                    doc.setFillColor(...C.light);
                    doc.roundedRect(m + 25, y, w - 65, 7, 2, 2, "F");

                    // Bar fill
                    doc.setFillColor(...barColor);
                    const fillWidth = Math.max(0, (w - 65) * (pct / 100));
                    if (fillWidth > 0) {
                        doc.roundedRect(m + 25, y, fillWidth, 7, 2, 2, "F");
                    }

                    // Percentage
                    doc.setTextColor(...barColor);
                    doc.text(`${pct}%`, m + w - 30, y + 5, { align: "right" });

                    y += 10;

                    // Show mapped units and their questions
                    if (co.mappedUnits?.length > 0) {
                        doc.setFontSize(8);
                        doc.setFont("helvetica", "normal");
                        doc.setTextColor(...C.secondary);

                        co.mappedUnits.forEach((unit) => {
                            // Get questions from this unit
                            const unitFromCoverage = coverage.units?.find(u => u.id === unit.id || u.name === unit.name);
                            const questionsInUnit = [];
                            if (unitFromCoverage?.topics) {
                                unitFromCoverage.topics.forEach(topic => {
                                    topic.questions?.forEach(q => {
                                        if (!questionsInUnit.includes(q.index)) {
                                            questionsInUnit.push(q.index);
                                        }
                                    });
                                });
                            }
                            questionsInUnit.sort((a, b) => a - b);

                            const unitName = unit.name || `Unit ${unit.id}`;
                            const qNums = questionsInUnit.length > 0 ? `Q${questionsInUnit.join(', Q')}` : 'No questions';
                            doc.text(`  • ${unitName}: ${qNums}`, m + 5, y + 3);
                            y += 6;
                        });
                    } else {
                        doc.setFontSize(8);
                        doc.setFont("helvetica", "italic");
                        doc.setTextColor(...C.muted);
                        doc.text("  No units mapped", m + 5, y + 3);
                        y += 6;
                    }

                    y += 4;
                });

                y += 5;
            }

            // ═══════════════════════════════════════════════════════════════
            // BLOOM'S TAXONOMY - COGNITIVE LEVEL ANALYSIS
            // ═══════════════════════════════════════════════════════════════
            const hasBloomsData = questions?.some(q => q.bloomsLevel);

            if (hasBloomsData) {
                if (y + 110 > pageHeight - 20) {
                    doc.addPage();
                    fillPageBg();
                    y = m;
                }

                // Section Header
                doc.setTextColor(...C.primary);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("Cognitive Level Analysis (Bloom's Taxonomy)", m, y);
                y += 8;

                doc.setFontSize(9);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(...C.muted);
                doc.text("Distribution of questions across six cognitive levels for OBE/NBA/NAAC compliance", m, y);
                y += 18;

                // Calculate distribution
                const bloomDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
                const bloomMarks = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
                let totalMarks = 0;

                questions.forEach(q => {
                    const level = q.bloomsLevel || 2;
                    bloomDist[level]++;
                    const marks = q.marks || 0;
                    bloomMarks[level] += marks;
                    totalMarks += marks;
                });

                // Calculate weighted average
                let weightedSum = 0;
                for (let i = 1; i <= 6; i++) {
                    weightedSum += i * bloomMarks[i];
                }
                const avgLevel = totalMarks > 0 ? (weightedSum / totalMarks).toFixed(2) : 0;

                // Bloom's levels metadata
                const bloomLevels = [
                    { id: 1, name: 'Remember', color: [229, 231, 235], textColor: [55, 65, 81] },
                    { id: 2, name: 'Understand', color: [219, 234, 254], textColor: [30, 64, 175] },
                    { id: 3, name: 'Apply', color: [209, 250, 229], textColor: [22, 101, 52] },
                    { id: 4, name: 'Analyze', color: [254, 243, 199], textColor: [120, 53, 15] },
                    { id: 5, name: 'Evaluate', color: [254, 215, 170], textColor: [154, 52, 18] },
                    { id: 6, name: 'Create', color: [254, 202, 202], textColor: [153, 27, 27] }
                ];

                // Bar chart
                const chartY = y;
                const chartH = 60;
                const maxBarH = 50;
                const barW = 25;
                const spacing = 4;

                bloomLevels.forEach((level, idx) => {
                    const x = m + idx * (barW + spacing);
                    const pct = totalMarks > 0 ? (bloomMarks[level.id] / totalMarks * 100) : 0;
                    const barH = (pct / 100) * maxBarH;

                    // Bar background
                    doc.setFillColor(241, 245, 249);
                    doc.roundedRect(x, chartY + maxBarH - barH, barW, barH, 2, 2, "F");

                    // Bar fill
                    doc.setFillColor(...level.color);
                    doc.roundedRect(x, chartY + maxBarH - barH, barW, barH, 2, 2, "F");

                    // Percentage on bar
                    if (pct > 0) {
                        doc.setTextColor(...level.textColor);
                        doc.setFontSize(8);
                        doc.setFont("helvetica", "bold");
                        doc.text(`${Math.round(pct)}%`, x + barW / 2, chartY + maxBarH - barH + 8, { align: "center" });
                    }

                    // Level name below
                    doc.setTextColor(...C.secondary);
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "normal");
                    const levelName = level.name.length > 8 ? level.name.substring(0, 7) : level.name;
                    doc.text(levelName, x + barW / 2, chartY + maxBarH + 8, { align: "center" });

                    // Question count
                    doc.setTextColor(...C.muted);
                    doc.setFontSize(6);
                    doc.text(`${bloomDist[level.id]}Q`, x + barW / 2, chartY + maxBarH + 13, { align: "center" });
                });

                y += chartH + 20;

                // Summary stats
                const statsY = y;

                // Weighted Average
                doc.setFillColor(...C.light);
                doc.roundedRect(m, statsY, w / 2 - 5, 16, 3, 3, "F");

                doc.setTextColor(...C.secondary);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text("Average Cognitive Level:", m + 8, statsY + 6);

                const avgColor = avgLevel >= 3.5 ? C.success : avgLevel >= 2.5 ? C.warning : C.danger;
                doc.setTextColor(...avgColor);
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`${avgLevel}`, m + 8, statsY + 13);

                doc.setTextColor(...C.muted);
                doc.setFontSize(7);
                doc.setFont("helvetica", "normal");
                doc.text("/ 6.0", m + 23, statsY + 13);

                // Higher-order thinking percentage (levels 4-6)
                const hotMarks = bloomMarks[4] + bloomMarks[5] + bloomMarks[6];
                const hotPct = totalMarks > 0 ? ((hotMarks / totalMarks) * 100).toFixed(0) : 0;

                doc.setFillColor(...C.light);
                doc.roundedRect(m + w / 2 + 5, statsY, w / 2 - 5, 16, 3, 3, "F");

                doc.setTextColor(...C.secondary);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text("Higher-Order Thinking (Analyze+):", m + w / 2 + 13, statsY + 6);

                const hotColor = hotPct >= 30 ? C.success : hotPct >= 15 ? C.warning : C.danger;
                doc.setTextColor(...hotColor);
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`${hotPct}%`, m + w / 2 + 13, statsY + 13);

                y += 22;

                // Warnings/Issues
                const rememberPct = totalMarks > 0 ? ((bloomMarks[1] / totalMarks) * 100) : 0;

                if (rememberPct > 40 || hotPct < 10 || avgLevel < 2.5) {
                    doc.setFillColor(254, 243, 199);
                    doc.roundedRect(m, y, w, 12, 3, 3, "F");

                    doc.setTextColor(120, 53, 15);
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "bold");
                    doc.text("⚠️  Cognitive Balance Concerns:", m + 8, y + 8);
                    y += 15;

                    doc.setFontSize(8);
                    doc.setFont("helvetica", "normal");

                    if (rememberPct > 40) {
                        doc.text(`• Over-reliance on "Remember" level (${Math.round(rememberPct)}% of marks)`, m + 10, y);
                        y += 6;
                    }
                    if (hotPct < 10) {
                        doc.text(`• Limited higher-order thinking questions (<10% of marks)`, m + 10, y);
                        y += 6;
                    }
                    if (avgLevel < 2.5) {
                        doc.text(`• Average cognitive level is low (${avgLevel} < 2.5 recommended)`, m + 10, y);
                        y += 6;
                    }

                    y += 6;
                }

                y += 10;
            }

            // ═══════════════════════════════════════════════════════════════
            // UNIT-WISE COVERAGE (Structured Card Design)
            // ═══════════════════════════════════════════════════════════════
            if (coverage.units?.length > 0) {
                if (y + 100 > pageHeight - 20) {
                    doc.addPage();
                    fillPageBg();
                    y = m;
                }

                // Section Header
                doc.setTextColor(...C.primary);
                doc.setFontSize(16);
                doc.setFont("helvetica", "bold");
                doc.text("Unit-wise Coverage Analysis", m, y);
                y += 22;

                const units = coverage.units;

                units.slice(0, 8).forEach((unit, idx) => {
                    const cardH = 38;
                    if (y + cardH > pageHeight - 20) {
                        doc.addPage();
                        fillPageBg();
                        y = m;
                    }

                    const pct = Math.round(unit.coverage || 0);
                    const actualPct = Math.round(unit.actualPercent || 0);
                    const expectedPct = Math.round(unit.expectedPercent || 0);
                    const deviation = Math.round(unit.deviation || 0);

                    // Card background with shadow effect
                    doc.setFillColor(255, 255, 255);
                    doc.roundedRect(m, y, w, cardH, 3, 3, "F");

                    // Subtle shadow
                    doc.setDrawColor(226, 232, 240);
                    doc.setLineWidth(0.5);
                    doc.roundedRect(m, y, w, cardH, 3, 3, "S");

                    // Left accent border (color-coded by coverage)
                    const accentColor = pct >= 70 ? [16, 185, 129] : pct >= 40 ? [245, 158, 11] : [239, 68, 68];
                    doc.setFillColor(...accentColor);
                    doc.rect(m, y, 4, cardH, "F");

                    const cardX = m + 12;
                    const cardY = y + 8;

                    // ─── HEADER SECTION ───
                    // Unit Name (Bold, larger)
                    doc.setTextColor(...C.primary);
                    doc.setFontSize(10);
                    doc.setFont("helvetica", "bold");
                    const unitName = unit.name?.length > 50 ? unit.name.substring(0, 48) + ".." : (unit.name || `Unit ${unit.id}`);
                    doc.text(unitName, cardX, cardY);

                    // Status Badge (Top right)
                    const badgeX = m + w - 42;
                    if (Math.abs(deviation) <= 5) {
                        doc.setFillColor(220, 252, 231);
                        doc.roundedRect(badgeX, cardY - 5, 32, 10, 2, 2, "F");
                        doc.setTextColor(22, 163, 74);
                        doc.setFontSize(6.5);
                        doc.setFont("helvetica", "bold");
                        doc.text("BALANCED", badgeX + 16, cardY, { align: "center" });
                    } else {
                        const badgeBg = deviation > 0 ? [255, 237, 213] : [254, 226, 226];
                        const badgeFg = deviation > 0 ? [234, 88, 12] : [220, 38, 38];
                        const badgeText = deviation > 0 ? `+${deviation}% OVER` : `${Math.abs(deviation)}% UNDER`;

                        doc.setFillColor(...badgeBg);
                        doc.roundedRect(badgeX - 5, cardY - 5, 37, 10, 2, 2, "F");
                        doc.setTextColor(...badgeFg);
                        doc.setFontSize(6.5);
                        doc.setFont("helvetica", "bold");
                        doc.text(badgeText, badgeX + 13.5, cardY, { align: "center" });
                    }

                    // ─── METRICS SECTION (3 equal columns) ───
                    const metricsY = cardY + 10;

                    // Column 1: Coverage
                    doc.setTextColor(100, 116, 139);
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "normal");
                    doc.text("Coverage", cardX, metricsY);

                    doc.setTextColor(...accentColor);
                    doc.setFontSize(16);
                    doc.setFont("helvetica", "bold");
                    doc.text(`${pct}%`, cardX, metricsY + 10);

                    // Column 2: Contribution
                    const contribX = cardX + 50;

                    doc.setTextColor(100, 116, 139);
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "normal");
                    doc.text("Contribution", contribX, metricsY);

                    doc.setTextColor(...C.primary);
                    doc.setFontSize(16);
                    doc.setFont("helvetica", "bold");
                    doc.text(`${actualPct}%`, contribX, metricsY + 10);

                    doc.setTextColor(148, 163, 184);
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "normal");
                    doc.text(`/ ${expectedPct}%`, contribX + 22, metricsY + 10);

                    // Column 3: Questions
                    const qX = contribX + 60;

                    doc.setTextColor(100, 116, 139);
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "normal");
                    doc.text("Questions", qX, metricsY);

                    // ─── QUESTIONS SECTION ───
                    const qY = metricsY + 10;

                    const unitQuestions = [];
                    unit.topics?.forEach(topic => {
                        topic.questions?.forEach(q => {
                            if (!unitQuestions.find(uq => uq.index === q.index)) {
                                unitQuestions.push({ index: q.index, marks: q.marks });
                            }
                        });
                    });
                    unitQuestions.sort((a, b) => a.index - b.index);

                    if (unitQuestions.length > 0) {
                        let qnX = qX;
                        unitQuestions.forEach((q, i) => {
                            if (i >= 8) return; // Limit to 8 questions

                            const qText = `Q${q.index}`;
                            const qW = 11;

                            doc.setFillColor(99, 102, 241);
                            doc.roundedRect(qnX, qY - 5, qW, 9, 2, 2, "F");

                            doc.setTextColor(255, 255, 255);
                            doc.setFontSize(6);
                            doc.setFont("helvetica", "bold");
                            doc.text(qText, qnX + qW / 2, qY, { align: "center" });

                            qnX += qW + 2;
                        });

                        if (unitQuestions.length > 8) {
                            doc.setTextColor(100, 116, 139);
                            doc.setFont("helvetica", "italic");
                            doc.setFontSize(6);
                            doc.text(`+${unitQuestions.length - 8}`, qnX + 1, qY);
                        }
                    } else {
                        doc.setTextColor(148, 163, 184);
                        doc.setFont("helvetica", "italic");
                        doc.setFontSize(7);
                        doc.text("None", qX, qY);
                    }

                    y += cardH + 8;
                });

                y += 10;
            }

            // ═══════════════════════════════════════════════════════════════
            // UNCOVERED TOPICS (Structured Alert Box)
            // ═══════════════════════════════════════════════════════════════
            if (coverage.uncoveredTopics?.length > 0) {
                if (y + 60 > pageHeight - 20) {
                    doc.addPage();
                    fillPageBg();
                    y = m;
                }

                // Alert box background
                doc.setFillColor(254, 226, 226);
                doc.roundedRect(m, y, w, 12, 3, 3, "F");

                // Header
                doc.setTextColor(153, 27, 27);
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("⚠️  UNCOVERED TOPICS", m + 10, y + 8);

                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.text(`${coverage.uncoveredTopics.length} topics from syllabus not covered in this paper`, m + 85, y + 8);

                y += 18;

                // White content box
                const boxH = Math.min(coverage.uncoveredTopics.length * 6 + 10, 80);
                doc.setFillColor(255, 255, 255);
                doc.roundedRect(m, y, w, boxH, 2, 2, "F");
                doc.setDrawColor(254, 202, 202);
                doc.setLineWidth(0.5);
                doc.roundedRect(m, y, w, boxH, 2, 2, "S");

                // Topics in 3 columns
                const topics = coverage.uncoveredTopics.slice(0, 18);
                const colW = w / 3;

                let tY = y + 8;
                topics.forEach((t, i) => {
                    if (tY > y + boxH - 5) return;

                    const col = i % 3;
                    const tX = m + 10 + (col * colW);
                    const row = Math.floor(i / 3);
                    const actualY = y + 8 + (row * 12);

                    if (actualY > y + boxH - 5) return;

                    doc.setFillColor(220, 38, 38);
                    doc.circle(tX, actualY - 3, 1.5, "F");

                    doc.setTextColor(55, 65, 81);
                    doc.setFontSize(8);
                    doc.setFont("helvetica", "normal");
                    const name = t.name || t;
                    doc.text(name.substring(0, 30), tX + 5, actualY);
                });

                if (coverage.uncoveredTopics.length > 18) {
                    doc.setTextColor(127, 29, 29);
                    doc.setFont("helvetica", "italic");
                    doc.setFontSize(8);
                    doc.text(`... and ${coverage.uncoveredTopics.length - 18} more topics`, m + 10, y + boxH - 4);
                }

                y += boxH + 15;
            }
        }

        // ============ PAGE 3+: QUESTION DETAILS ============
        doc.addPage();
        fillPageBg();
        y = m;

        doc.setTextColor(...C.primary);
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Question-wise Issues", pageWidth / 2, y + 5, { align: "center" });
        y += 20;

        // Helper to collect issues for a question
        const getIssuesForQuestion = (qid, qIndex) => {
            const issues = [];
            const possibleIds = [qid, `Q${qIndex + 1}`, `q_${qIndex}`, String(qIndex + 1)];

            (qp.spelling?.errors || []).forEach(err => {
                if (possibleIds.includes(err.qid)) {
                    issues.push({ type: 'Typos', severity: 'low', issue: err.errors?.join(', ') || 'Spelling error' });
                }
            });

            (qp.clarity?.issues || []).forEach(issue => {
                if (possibleIds.includes(issue.qid)) {
                    issues.push({ type: 'Readability', severity: 'medium', issue: issue.issue });
                }
            });

            (qp.ambiguity?.flags || []).forEach(flag => {
                if (possibleIds.includes(flag.qid)) {
                    issues.push({ type: 'Unclear', severity: flag.severity, issue: flag.issue, suggestion: flag.suggestion });
                }
            });

            (qp.marks_effort?.warnings || []).forEach(warn => {
                if (possibleIds.includes(warn.qid)) {
                    issues.push({ type: 'Marks', severity: 'medium', issue: warn.reason, suggestion: `Adjust to ${warn.recommended_marks} marks` });
                }
            });

            (qp.or_conflicts?.issues || []).forEach(issue => {
                if (issue.pair?.some(pid => possibleIds.includes(pid))) {
                    issues.push({ type: 'OR Balance', severity: 'high', issue: issue.issue, suggestion: issue.recommendation });
                }
            });

            (qp.duplicates?.pairs || []).forEach(dup => {
                if (dup.pair?.some(pid => possibleIds.includes(pid))) {
                    issues.push({ type: 'Duplicates', severity: 'medium', issue: dup.explanation });
                }
            });

            (qp.evaluation_smoothness?.issues || []).forEach(issue => {
                if (possibleIds.includes(issue.qid)) {
                    issues.push({ type: 'Grading', severity: 'medium', issue: issue.issue });
                }
            });

            return issues;
        };

        // Render each question
        if (questions && questions.length > 0) {
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const issues = getIssuesForQuestion(q.qid, i);

                // Check if we need a new page
                if (y + 40 > pageHeight - 20) {
                    doc.addPage();
                    fillPageBg();
                    y = m;
                }

                // Question header
                doc.setFillColor(...(issues.length > 0 ? [254, 242, 242] : [240, 253, 244]));
                doc.roundedRect(m, y, w, 16, 4, 4, "F");

                const accentColor = issues.length > 0 ? C.danger : C.success;
                doc.setFillColor(...accentColor);
                doc.rect(m, y, 5, 16, "F");

                doc.setTextColor(...C.primary);
                doc.setFontSize(12);
                doc.setFont("helvetica", "bold");
                doc.text(`Question ${i + 1}`, m + 12, y + 11);

                doc.setTextColor(...accentColor);
                doc.setFontSize(10);
                doc.text(issues.length === 0 ? "No issues" : `${issues.length} issue${issues.length > 1 ? 's' : ''}`, m + w - 5, y + 11, { align: "right" });

                y += 20;

                // Question text (truncated)
                if (q.text) {
                    const cleanText = (q.text || "").replace(/\$/g, "").substring(0, 150);
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(...C.secondary);
                    const lines = doc.splitTextToSize(cleanText + (q.text.length > 150 ? "..." : ""), w - 10);
                    doc.text(lines.slice(0, 2), m + 5, y);
                    y += Math.min(lines.length, 2) * 4 + 5;
                }

                // Issues for this question
                if (issues.length > 0) {
                    issues.forEach(issue => {
                        if (y + 20 > pageHeight - 20) {
                            doc.addPage();
                            fillPageBg();
                            y = m;
                        }

                        const sevColor = issue.severity === 'high' ? C.danger : issue.severity === 'medium' ? C.warning : C.muted;

                        doc.setFillColor(...C.light);
                        doc.roundedRect(m + 10, y, w - 20, 16, 3, 3, "F");
                        doc.setFillColor(...sevColor);
                        doc.rect(m + 10, y, 3, 16, "F");

                        doc.setFontSize(9);
                        doc.setFont("helvetica", "bold");
                        doc.setTextColor(...sevColor);
                        doc.text(issue.type, m + 18, y + 6);

                        doc.setFont("helvetica", "normal");
                        doc.setTextColor(...C.secondary);
                        const issueLines = doc.splitTextToSize(issue.issue || "", w - 40);
                        doc.text(issueLines[0] || "", m + 18, y + 12);

                        y += 20;
                    });
                }

                y += 8;
            }
        }

        // Footer on last page
        doc.setFontSize(8);
        doc.setTextColor(...brand.lightGreen);
        doc.text("Generated by DASES QuickPass", m, pageHeight - 10);
        doc.text(new Date().toLocaleString(), pageWidth - m, pageHeight - 10, { align: "right" });

        // Generate PDF buffer
        const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="moderation-report-${paperId}.pdf"`,
            },
        });

    } catch (error) {
        console.error("Moderation report PDF error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
