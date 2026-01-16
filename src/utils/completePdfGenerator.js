// src/utils/completePdfGenerator.js
/**
 * Premium PDF Generator - "Academic Premium" Design
 * Clean, structured layout with proper typography and LaTeX rendering support
 */
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import katex from "katex";
import "katex/dist/katex.min.css";

export const downloadCompleteQuestionPaper = async (paper) => {
  try {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 55;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // ═══════════════════════════════════════════════════════════════
    // DESIGN TOKENS - Professional Color Palette
    // ═══════════════════════════════════════════════════════════════
    const COLORS = {
      // Brand
      primary: [16, 82, 28],        // Deep forest green (DASES)
      accent: [34, 139, 34],         // Forest green

      // Neutrals (Slate palette)
      dark: [15, 23, 42],            // Slate 900
      text: [30, 41, 59],            // Slate 800
      secondary: [51, 65, 85],       // Slate 700
      muted: [100, 116, 139],        // Slate 500
      light: [241, 245, 249],        // Slate 100
      lighter: [248, 250, 252],      // Slate 50
      border: [203, 213, 225],       // Slate 300

      // Status colors
      white: [255, 255, 255],
      success: [21, 128, 61],        // Green 700
      warning: [202, 138, 4],        // Yellow 700
      danger: [185, 28, 28],         // Red 700
      info: [29, 78, 216],           // Blue 700

      // Accents
      purple: [109, 40, 217],        // Purple 700
      amber: [245, 158, 11],         // Amber 500
    };

    // Typography scale
    const FONT = {
      heading: "helvetica",
      body: "times",
      mono: "courier",
    };

    const SIZES = {
      h1: 16,
      h2: 14,
      h3: 12,
      h4: 11,
      body: 11,
      small: 9,
      tiny: 8,
    };

    // Spacing rhythm (multiples of 4)
    const SPACE = {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 28,
    };

    // ═══════════════════════════════════════════════════════════════
    // UTILITY FUNCTIONS
    // ═══════════════════════════════════════════════════════════════
    const setColor = (colorArr) => {
      pdf.setTextColor(...colorArr);
      return { fill: () => pdf.setFillColor(...colorArr), draw: () => pdf.setDrawColor(...colorArr) };
    };

    const newPage = () => {
      pdf.addPage();
      y = margin;
    };

    const checkSpace = (needed) => {
      if (y + needed > pageHeight - margin) {
        newPage();
        return true;
      }
      return false;
    };

    const splitText = (text, width) => pdf.splitTextToSize(String(text || ""), width);

    // Helper to detect LaTeX content
    const hasLatex = (text) => {
      if (!text) return false;
      return /\$|\\frac|\\sqrt|\\int|\\sum|\\alpha|\\beta|\\gamma|\\delta|\\theta|\\pi|\\omega|\\lambda|\\sigma|\\mu|\\infty|\\partial|\\nabla|\\Delta|\\times|\\div|\\pm|\\geq|\\leq|\\neq|\\approx|\\equiv|\\in|\\subset|\\cup|\\cap|\\mathbb|\\text\{|pmatrix|bmatrix|matrix|\\lim|\\sin|\\cos|\\tan|\\log|\\left|\\right|\\cdot/.test(text);
    };

    // LaTeX-aware string cleaning - preserves math expressions
    const cleanStr = (s) => {
      const text = String(s || "");

      // If contains LaTeX, preserve delimiters and commands
      if (hasLatex(text)) {
        return text
          .replace(/[→]/g, "->")
          .replace(/[\u00A0]/g, " ")  // Only remove non-breaking spaces
          .replace(/[\u2000-\u200B]/g, "")  // Remove other special spaces
          .trim();
      }

      // Otherwise, clean aggressively
      return text
        .replace(/[→]/g, "->")
        .replace(/[\u00A0\u2000-\u200B]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    // ═══════════════════════════════════════════════════════════════
    // LATEX RENDERING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    // Fix common LaTeX errors and enable auto-scaling brackets
    const normalizeLatex = (latex) => {
      if (!latex) return "";
      let fixed = latex;

      // Fix missing backslashes
      fixed = fixed.replace(/([^\\])end\{pmatrix\}/g, "$1\\end{pmatrix}");
      fixed = fixed.replace(/^end\{pmatrix\}/g, "\\end{pmatrix}");
      fixed = fixed.replace(/([^\\])end\{bmatrix\}/g, "$1\\end{bmatrix}");
      fixed = fixed.replace(/^end\{bmatrix\}/g, "\\end{bmatrix}");

      // Convert pmatrix to auto-scaling delimiters
      fixed = fixed.replace(/\\begin\{pmatrix\}/g, "\\left(\\begin{matrix}");
      fixed = fixed.replace(/\\end\{pmatrix\}/g, "\\end{matrix}\\right)");
      fixed = fixed.replace(/\\begin\{bmatrix\}/g, "\\left[\\begin{matrix}");
      fixed = fixed.replace(/\\end\{bmatrix\}/g, "\\end{matrix}\\right]");

      // Normalize spacing
      fixed = fixed.replace(/\\\\\s*/g, " \\\\ ");
      fixed = fixed.replace(/\s+/g, " ").trim();

      return fixed;
    };

    // Parse text to extract LaTeX and plain text parts
    const processLatexText = (text) => {
      if (!text) return [];
      const parts = [];
      let currentPos = 0;
      let i = 0;

      while (i < text.length) {
        // Display math $$...$$
        if (text[i] === "$" && text[i + 1] === "$") {
          if (i > currentPos) {
            parts.push({ type: "text", content: text.substring(currentPos, i) });
          }
          const endIdx = text.indexOf("$$", i + 2);
          if (endIdx !== -1) {
            const latex = text.substring(i + 2, endIdx);
            parts.push({ type: "display", content: normalizeLatex(latex) });
            i = endIdx + 2;
            currentPos = i;
            continue;
          }
        }

        // Inline math $...$
        if (text[i] === "$") {
          if (i > currentPos) {
            parts.push({ type: "text", content: text.substring(currentPos, i) });
          }
          const endIdx = text.indexOf("$", i + 1);
          if (endIdx !== -1) {
            const latex = text.substring(i + 1, endIdx);
            parts.push({ type: "inline", content: normalizeLatex(latex) });
            i = endIdx + 1;
            currentPos = i;
            continue;
          }
        }

        i++;
      }

      if (currentPos < text.length) {
        parts.push({ type: "text", content: text.substring(currentPos) });
      }

      return parts;
    };

    // Render LaTeX using KaTeX
    const renderLatexSafely = (latex, element, displayMode = false) => {
      try {
        katex.render(latex, element, {
          throwOnError: false,
          displayMode: displayMode,
          output: "html",
          strict: false,
          trust: true,
          maxSize: 500,
          maxExpand: 1000,
          fleqn: false,
          macros: {
            "\\R": "\\mathbb{R}",
            "\\Z": "\\mathbb{Z}",
            "\\N": "\\mathbb{N}",
          },
        });
        return true;
      } catch (err) {
        console.warn(`LaTeX error: ${err.message}`);
        element.textContent = latex;
        element.style.color = "#cc0000";
        element.style.fontFamily = "monospace";
        element.style.fontSize = "10px";
        return false;
      }
    };

    // Convert LaTeX text to image for PDF embedding
    const renderLatexToImage = async (text, maxWidth) => {
      return new Promise(async (resolve) => {
        try {
          // Add CSS for proper rendering
          const style = document.createElement("style");
          style.id = "katex-complete-pdf-fix";
          style.textContent = `
            .katex .pstrut { min-height: 3em !important; }
            .katex .vlist-t { vertical-align: middle; }
            .katex .arraycolsep { width: 0.5em; }
            .katex .delimsizing { vertical-align: middle; }
          `;
          if (!document.getElementById("katex-complete-pdf-fix")) {
            document.head.appendChild(style);
          }

          const tempDiv = document.createElement("div");
          tempDiv.style.position = "absolute";
          tempDiv.style.left = "-99999px";
          tempDiv.style.top = "0";
          tempDiv.style.width = maxWidth + "px";
          tempDiv.style.maxWidth = maxWidth + "px";
          tempDiv.style.padding = "0px";
          tempDiv.style.backgroundColor = "#ffffff";
          tempDiv.style.fontSize = "11px";
          tempDiv.style.lineHeight = "1.6";
          tempDiv.style.fontFamily = "'Times New Roman', Times, serif";
          tempDiv.style.color = "#1e293b";
          tempDiv.style.boxSizing = "border-box";
          tempDiv.style.wordWrap = "break-word";
          tempDiv.style.overflowWrap = "break-word";

          const parts = processLatexText(text);

          parts.forEach((part) => {
            if (part.type === "text") {
              const lines = part.content.split("\n");
              lines.forEach((line, lineIdx) => {
                if (line.trim()) {
                  const textSpan = document.createElement("span");
                  textSpan.textContent = line;
                  tempDiv.appendChild(textSpan);
                }
                if (lineIdx < lines.length - 1) {
                  tempDiv.appendChild(document.createElement("br"));
                }
              });
            } else if (part.type === "inline") {
              const span = document.createElement("span");
              span.style.display = "inline-block";
              span.style.margin = "0 3px";
              span.style.verticalAlign = "middle";
              renderLatexSafely(part.content, span, false);
              tempDiv.appendChild(span);
            } else if (part.type === "display") {
              const div = document.createElement("div");
              div.style.display = "block";
              div.style.margin = "8px 0";
              div.style.textAlign = "left";
              div.style.minHeight = "30px";
              renderLatexSafely(part.content, div, true);
              tempDiv.appendChild(div);
            }
          });

          document.body.appendChild(tempDiv);

          // Wait for KaTeX rendering
          await new Promise((r) => setTimeout(r, 300));

          const actualHeight = tempDiv.scrollHeight;
          const actualWidth = tempDiv.scrollWidth;  // Use full natural width

          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: actualWidth,
            height: actualHeight,
          });

          document.body.removeChild(tempDiv);

          // Scale to fit maxWidth if needed, but preserve all content
          const finalWidth = Math.min(actualWidth, maxWidth);
          const finalHeight = (canvas.height / canvas.width) * finalWidth;

          resolve({
            dataUrl: canvas.toDataURL("image/png", 0.95),
            width: finalWidth,
            height: finalHeight,
          });
        } catch (err) {
          console.error("LaTeX rendering error:", err);
          resolve(null);
        }
      });
    };

    // Helper to split very long text into manageable chunks for page-sized rendering
    const splitLongContent = (text, maxHeight) => {
      // Split by paragraphs (double newlines) and display math blocks
      const parts = [];
      const segments = text.split(/(\n\n|\$\$[\s\S]*?\$\$)/);

      let currentChunk = "";

      for (const segment of segments) {
        if (!segment.trim()) continue;

        // If adding this segment might exceed max, save current chunk and start new one
        const testChunk = currentChunk + segment;

        // Rough estimation: 15px per line, ~50 chars per line
        const estimatedLines = testChunk.length / 50;
        const estimatedHeight = estimatedLines * 15;

        if (estimatedHeight > maxHeight && currentChunk) {
          parts.push(currentChunk.trim());
          currentChunk = segment;
        } else {
          currentChunk += segment;
        }
      }

      if (currentChunk.trim()) {
        parts.push(currentChunk.trim());
      }

      return parts.length > 0 ? parts : [text];
    };

    // ═══════════════════════════════════════════════════════════════
    // DRAWING PRIMITIVES
    // ═══════════════════════════════════════════════════════════════

    // Subtle page background
    const fillPageBg = () => {
      pdf.setFillColor(253, 253, 252); // Warm white
      pdf.rect(0, 0, pageWidth, pageHeight, "F");
    };

    // Draw a colored badge (replaces emoji icons)
    const drawBadge = (label, color, x) => {
      const badgeW = pdf.getTextWidth(label) + SPACE.md;
      pdf.setFillColor(...color);
      pdf.roundedRect(x, y - 10, badgeW, 16, 4, 4, "F");
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(SIZES.tiny);
      setColor(COLORS.white);
      pdf.text(label, x + SPACE.sm - 2, y);
      return badgeW + SPACE.sm;
    };

    // Draw a horizontal divider
    const drawRule = () => {
      pdf.setDrawColor(...COLORS.border);
      pdf.setLineWidth(1);
      pdf.line(margin, y, margin + contentWidth, y);
      y += SPACE.lg;
    };

    // Draw a vector warning triangle (replaces emoji ⚠)
    const drawWarningIcon = (x, yPos, size = 12) => {
      const h = size * 0.866; // Height of equilateral triangle
      pdf.setFillColor(...COLORS.warning);
      pdf.setDrawColor(...COLORS.warning);

      // Triangle points (pointing up)
      pdf.triangle(
        x + size / 2, yPos - h,           // Top
        x, yPos,                           // Bottom left
        x + size, yPos,                    // Bottom right
        "F"
      );

      // Exclamation mark (white)
      pdf.setFillColor(...COLORS.white);
      const cx = x + size / 2;
      const exclTop = yPos - h + 3;
      pdf.rect(cx - 1, exclTop, 2, h - 8, "F");     // Stem
      pdf.circle(cx, yPos - 3, 1.2, "F");           // Dot
    };

    // Draw prominent section title
    const sectionTitle = (title, subtitle = "") => {
      checkSpace(50);
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(SIZES.h1);
      setColor(COLORS.dark);
      pdf.text(title, margin, y);
      y += SPACE.sm;

      // Accent underline
      pdf.setFillColor(...COLORS.primary);
      pdf.rect(margin, y, 80, 3, "F");
      y += SPACE.lg;

      if (subtitle) {
        pdf.setFont(FONT.heading, "normal");
        pdf.setFontSize(SIZES.small);
        setColor(COLORS.muted);
        pdf.text(subtitle, margin, y);
        y += SPACE.lg;
      }
    };

    // Draw a card container with shadow effect
    const drawCard = (height, hasStroke = false) => {
      // Shadow (offset)
      pdf.setFillColor(0, 0, 0, 0.03);
      pdf.roundedRect(margin + 2, y + 2, contentWidth, height, 6, 6, "F");

      // Main card
      pdf.setFillColor(...COLORS.white);
      pdf.roundedRect(margin, y, contentWidth, height, 6, 6, "F");

      if (hasStroke) {
        pdf.setDrawColor(...COLORS.border);
        pdf.setLineWidth(1);
        pdf.roundedRect(margin, y, contentWidth, height, 6, 6, "S");
      }
    };

    // ═══════════════════════════════════════════════════════════════
    // COVER PAGE
    // ═══════════════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════════════
    // COVER PAGE
    // ═══════════════════════════════════════════════════════════════
    const drawCoverPage = () => {
      fillPageBg();

      // Swiss Modern Header with Diagonal Cut
      const headerLeftY = 145;
      const headerRightY = 120;

      // Diagonal header shape (approximates clip-path: polygon)
      pdf.setFillColor(...COLORS.primary);
      pdf.moveTo(0, 0);
      pdf.lineTo(pageWidth, 0);
      pdf.lineTo(pageWidth, headerRightY);
      pdf.lineTo(0, headerLeftY);
      pdf.fill();

      // Green accent line following diagonal edge
      pdf.setFillColor(...COLORS.accent);
      pdf.moveTo(0, headerLeftY);
      pdf.lineTo(pageWidth, headerRightY);
      pdf.lineTo(pageWidth, headerRightY + 4);
      pdf.lineTo(0, headerLeftY + 4);
      pdf.fill();

      // DASES Branding
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(36);
      setColor(COLORS.white);
      pdf.text("DASES", margin, 50);

      pdf.setFont(FONT.heading, "normal");
      pdf.setFontSize(SIZES.h4);
      pdf.setTextColor(255, 255, 255, 0.85);
      pdf.text("Digital Assessment & Syllabus Evaluation System", margin, 70);

      // Tagline
      pdf.setFont(FONT.body, "italic");
      pdf.setFontSize(SIZES.small);
      pdf.setTextColor(220, 250, 230); // Light green-white for visibility
      pdf.text("Empowering Academic Excellence", margin, 88);

      y = 185;

      // Report Title
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(30);
      setColor(COLORS.dark);
      pdf.text("COMPREHENSIVE", margin, y);
      y += 30;
      setColor(COLORS.primary);
      pdf.text("PAPER REPORT", margin, y);
      y += 45;

      // Metadata values (with truncation for long values)
      const truncate = (str, maxLen) => str.length > maxLen ? str.substring(0, maxLen - 2) + ".." : str;

      // Map database fields correctly
      const institute = String(paper.institute || paper.institution || "Institute Name");
      const teacherName = truncate(String(paper.teacher_name || paper.teacherName || "—"), 20);
      const teacherId = truncate(String(paper.teacher_id || "—"), 15);
      const subjectName = String(paper.subject_name || "Subject");
      const facultyName = truncate(String(paper.faculty_name || paper.faculty || "—"), 18);
      const yearVal = String(paper.year || new Date().getFullYear());
      const examPeriod = truncate(String(paper.exam_month_year || "—"), 18);
      const totalQuestions = String((paper.paper_data?.questions || []).length);

      // Info Card with shadow
      const cardHeight = 215;
      const cardPadding = 35;
      const cardX = margin;
      const cardW = contentWidth;

      // Shadow
      pdf.setFillColor(0, 0, 0, 0.03);
      pdf.roundedRect(cardX + 1, y + 1, cardW, cardHeight, 8, 8, "F");

      // Main card
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(229, 231, 235); // e5e7eb
      pdf.setLineWidth(1);
      pdf.roundedRect(cardX, y, cardW, cardHeight, 8, 8, "FD");

      const cardY = y;
      y += cardPadding;

      // Row 1: Institute
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(SIZES.tiny);
      setColor(COLORS.muted);
      pdf.text("INSTITUTE", cardX + cardPadding, y);

      y += 14;
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(SIZES.h3);
      setColor(COLORS.dark);
      pdf.text(institute, cardX + cardPadding, y);

      // Divider
      y += 20;
      pdf.setDrawColor(243, 244, 246); // f3f4f6
      pdf.setLineWidth(1);
      pdf.line(cardX + cardPadding, y, cardX + cardW - cardPadding, y);
      y += 22;

      // Row 2: Subject / Course
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(SIZES.tiny);
      setColor(COLORS.muted);
      pdf.text("SUBJECT / COURSE", cardX + cardPadding, y);

      y += 14;
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(18);
      setColor(COLORS.primary);
      pdf.text(subjectName, cardX + cardPadding, y);

      // Divider
      y += 20;
      pdf.setDrawColor(243, 244, 246);
      pdf.line(cardX + cardPadding, y, cardX + cardW - cardPadding, y);
      y += 22;

      // Grid helper
      const colWidth = (cardW - cardPadding * 2) / 3;
      let xPos;

      // Row 3: Faculty | Exam Period | Year
      xPos = cardX + cardPadding;
      [
        { label: "FACULTY", value: facultyName },
        { label: "EXAM PERIOD", value: examPeriod },
        { label: "YEAR", value: yearVal },
      ].forEach((item) => {
        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(SIZES.tiny);
        setColor(COLORS.muted);
        pdf.text(item.label, xPos, y);

        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(SIZES.h3);
        setColor(COLORS.dark);
        pdf.text(item.value, xPos, y + 14);

        xPos += colWidth;
      });

      y += 38;

      // Row 4: Total Questions | Teacher ID (no Instructor)
      xPos = cardX + cardPadding;
      [
        { label: "TOTAL QUESTIONS", value: totalQuestions },
        { label: "TEACHER ID", value: teacherId },
      ].forEach((item) => {
        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(SIZES.tiny);
        setColor(COLORS.muted);
        pdf.text(item.label, xPos, y);

        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(SIZES.h3);
        setColor(COLORS.dark);
        pdf.text(item.value, xPos, y + 14);

        xPos += colWidth;
      });

      y = cardY + cardHeight + 30;

      // Document contents
      sectionTitle("Document Contents");
      const contents = [
        ["Complete Question Paper", "All questions with marks and details"],
        ["Sample Answers & Rubrics", "Model answers with marking criteria"],
        ["QuickPass Analysis", "Automated quality checks and issues"],
        ["Syllabus Coverage", "Topic coverage and unit breakdown"],
        ["Bloom's Taxonomy", "Cognitive level distribution"],
      ];

      pdf.setFont(FONT.body, "normal");
      pdf.setFontSize(SIZES.body);
      contents.forEach(([title, desc], idx) => {
        setColor(COLORS.text);
        pdf.setFont(FONT.heading, "bold");
        pdf.text(`${idx + 1}.`, margin, y);
        pdf.text(title, margin + 20, y);
        y += 14;

        pdf.setFont(FONT.heading, "italic");
        pdf.setFontSize(SIZES.small);
        setColor(COLORS.muted);
        pdf.text(desc, margin + 24, y);
        pdf.setFontSize(SIZES.body);
        y += 20;
      });

      // Footer
      pdf.setFont(FONT.heading, "normal");
      pdf.setFontSize(SIZES.small);
      setColor(COLORS.muted);
      pdf.text(`Generated: ${new Date().toLocaleDateString("en-GB")}`, margin, pageHeight - 30);
      pdf.text("Powered by DASES", pageWidth - margin - 90, pageHeight - 30);
    };

    // ═══════════════════════════════════════════════════════════════
    // QUESTIONS SECTION (Complete per-question details)
    // ═══════════════════════════════════════════════════════════════
    const drawCompleteQuestions = async () => {
      newPage();
      sectionTitle("Complete Question Paper");

      const questions = paper.paper_data?.questions || [];
      const qp = paper.intelligence?.quickpass;

      // Helper to get issues for a question
      const getQIssues = (qNum) => {
        if (!qp) return [];
        const qid = `Q${qNum}`;
        const issues = [];
        qp.ambiguity?.flags?.filter(f => f.qid === qid).forEach(f =>
          issues.push({ type: "CLARITY", msg: f.issue, severity: f.severity }));
        qp.marks_effort?.warnings?.filter(w => w.qid === qid).forEach(w =>
          issues.push({ type: "MARKS", msg: w.reason, severity: w.severity || "medium" }));
        qp.or_conflicts?.issues?.filter(i => i.qid === qid).forEach(i =>
          issues.push({ type: "OR", msg: i.issue || i.reason, severity: i.severity || "medium" }));
        qp.evaluation_smoothness?.issues?.filter(i => i.qid === qid).forEach(i =>
          issues.push({ type: "MARKING", msg: i.issue, severity: i.severity || "low" }));
        return issues;
      };

      // Helper to draw samples and rubrics for a question
      const drawSamplesAndRubrics = async (q) => {
        if (!q.samples || q.samples.length === 0) return;

        // Add significant spacing before samples section to avoid overlap with quality boxes
        y += 40;
        checkSpace(80); // Ensure we have space, move to new page if needed

        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(10);
        setColor(COLORS.primary);
        pdf.text("Sample Answers & Rubrics", margin + 30, y);
        y += 20; // More space after the header

        for (let sIdx = 0; sIdx < q.samples.length; sIdx++) {
          const sample = q.samples[sIdx];

          if (sIdx > 0) {
            y += 15;
            pdf.setFont(FONT.heading, "bold");
            pdf.setFontSize(9);
            setColor(COLORS.muted);
            pdf.text(`Alternative ${sIdx + 1}`, margin + 35, y);
            y += 12;
          }

          // Instructions
          if (sample.instructions) {
            checkSpace(40);
            pdf.setFont(FONT.heading, "italic");
            pdf.setFontSize(9);
            setColor(COLORS.muted);
            const instrLines = splitText(cleanStr(sample.instructions), contentWidth - 70);
            instrLines.forEach((line) => {
              pdf.text(line, margin + 35, y);
              y += 12;
            });
            y += 8;
          }

          // Answer text - with LaTeX rendering
          if (sample.answer) {
            const cleanedAnswer = cleanStr(sample.answer);

            // Check if answer contains LaTeX 
            if (hasLatex(cleanedAnswer)) {
              // Calculate max height for one page with comfortable margin
              const maxChunkHeight = pageHeight - margin * 2 - 150; // More conservative for better margins

              // Split content if it's very long
              const contentChunks = splitLongContent(cleanedAnswer, maxChunkHeight);

              for (let chunkIdx = 0; chunkIdx < contentChunks.length; chunkIdx++) {
                const chunk = contentChunks[chunkIdx];

                // Render each chunk to image
                const answerImg = await renderLatexToImage(chunk, contentWidth - 70);

                if (answerImg) {
                  // Calculate space needed with comfortable buffer
                  const spaceNeeded = answerImg.height + 80; // Larger buffer for better margins
                  const spaceAvailable = pageHeight - margin - y;

                  // For first chunk, try to fit on same page as question
                  // For subsequent chunks, start on new page
                  if (chunkIdx === 0) {
                    // First chunk: only move to new page if really doesn't fit
                    if (spaceNeeded > spaceAvailable) {
                      newPage();
                      fillPageBg();
                    }
                  } else {
                    // Subsequent chunks: always start on new page for clarity
                    newPage();
                    fillPageBg();
                  }

                  // Add the image
                  pdf.addImage(
                    answerImg.dataUrl,
                    "PNG",
                    margin + 35,
                    y,
                    answerImg.width,
                    answerImg.height
                  );
                  y += answerImg.height + 8; // Smaller gap between chunks
                }
              }

              y += 12; // Final spacing after all chunks
            } else {
              // Plain text answer
              pdf.setFont(FONT.body, "normal");
              pdf.setFontSize(10);
              setColor(COLORS.text);
              const ansLines = splitText(cleanedAnswer, contentWidth - 70);
              ansLines.forEach((line) => {
                checkSpace(14);
                pdf.text(line, margin + 35, y);
                y += 13;
              });
              y += 12;
            }
          }

          // Rubric table
          if (sample.rubric?.criteria?.length > 0) {
            checkSpace(50);
            pdf.setFont(FONT.heading, "bold");
            pdf.setFontSize(9);
            setColor(COLORS.dark);
            pdf.text("Marking Rubric", margin + 35, y);
            y += 12;

            // Table header
            const tableX = margin + 35;
            const tableW = contentWidth - 70;
            const col1W = tableW * 0.75;
            const col2W = tableW * 0.25;

            pdf.setFillColor(...COLORS.primary);
            pdf.rect(tableX, y, col1W, 16, "F");
            pdf.rect(tableX + col1W, y, col2W, 16, "F");

            pdf.setFont(FONT.heading, "bold");
            pdf.setFontSize(8);
            setColor(COLORS.white);
            pdf.text("CRITERION", tableX + 6, y + 11);
            pdf.text("WEIGHT", tableX + col1W + 6, y + 11);
            y += 18;

            // Table rows
            sample.rubric.criteria.forEach((crit, idx) => {
              const critLines = splitText(cleanStr(crit.criterion), col1W - 12);
              const rowH = Math.max(18, critLines.length * 11 + 6);
              checkSpace(rowH);

              // Zebra stripe
              if (idx % 2 === 0) {
                pdf.setFillColor(...COLORS.light);
                pdf.rect(tableX, y, tableW, rowH, "F");
              }
              pdf.setDrawColor(...COLORS.border);
              pdf.rect(tableX, y, col1W, rowH);
              pdf.rect(tableX + col1W, y, col2W, rowH);

              pdf.setFont(FONT.body, "normal");
              pdf.setFontSize(9);
              setColor(COLORS.text);
              critLines.forEach((line, li) => {
                pdf.text(line, tableX + 6, y + 11 + li * 11);
              });

              pdf.setFont(FONT.heading, "bold");
              setColor(COLORS.primary);
              pdf.text(String(crit.weight || crit.marks || "—"), tableX + col1W + 6, y + 11);

              y += rowH;
            });
            y += 12;
          }
        }
      };

      let qNum = 1;
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        // Start each question on a new page
        if (qNum > 1) {
          newPage();
          fillPageBg();
        }

        // Question number and marks
        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(SIZES.h3);
        setColor(COLORS.dark);
        pdf.text(`Q${qNum}.`, margin, y);

        pdf.setFont(FONT.heading, "normal");
        pdf.setFontSize(SIZES.small);
        setColor(COLORS.muted);
        const marksText = `[${q.marks} Marks]`;
        pdf.text(marksText, pageWidth - margin - pdf.getTextWidth(marksText), y);
        y += SPACE.md;

        // Question text (serif font for academic feel, monospace for LaTeX)
        const cleanedQuestion = cleanStr(q.text);

        if (hasLatex(cleanedQuestion)) {
          pdf.setFont(FONT.mono, "normal");
          pdf.setFontSize(10);
        } else {
          pdf.setFont(FONT.body, "normal");
          pdf.setFontSize(SIZES.body);
        }

        setColor(COLORS.text);
        const qLines = splitText(cleanedQuestion, contentWidth - 60);
        qLines.forEach((line) => {
          y += 15;
          pdf.text(line, margin + 35, y);
        });
        y += SPACE.lg;

        // QuickPass Issues (if any)
        const issues = getQIssues(qNum);
        if (issues.length > 0) {
          const boxX = margin + 35;
          const boxW = contentWidth - 70;
          const textAreaWidth = boxW - 30; // 15px padding on each side

          // Calculate box height based on actual content (header + padding + issues)
          let totalIssueHeight = 55; // Header space + padding
          issues.forEach(issue => {
            const msgLines = splitText(cleanStr(issue.msg || "Issue detected"), textAreaWidth);
            totalIssueHeight += msgLines.length * 14 + 16;
          });

          checkSpace(totalIssueHeight + 15);

          // Draw issues box with softer amber
          pdf.setFillColor(255, 253, 245); // Very pale amber
          pdf.setDrawColor(217, 164, 6);   // Darker amber border
          pdf.setLineWidth(1.5);
          pdf.roundedRect(boxX, y, boxW, totalIssueHeight, 6, 6, "FD");

          // Header area
          y += 20;

          // Draw vector warning triangle
          drawWarningIcon(boxX + 15, y + 2, 14);

          // Header text
          pdf.setFont(FONT.heading, "bold");
          pdf.setFontSize(SIZES.small);
          setColor(COLORS.dark);
          pdf.text("QUALITY ISSUES DETECTED", boxX + 35, y);
          y += 18;

          // Subtle divider line
          pdf.setDrawColor(230, 200, 100);
          pdf.setLineWidth(0.5);
          pdf.line(boxX + 15, y, boxX + boxW - 15, y);
          y += 15;

          issues.forEach((issue) => {
            const badgeColor = issue.severity === "high" ? COLORS.danger :
              issue.severity === "medium" ? COLORS.warning : COLORS.info;
            const offset = drawBadge(issue.type, badgeColor, boxX + 15);

            pdf.setFont(FONT.heading, "normal");
            pdf.setFontSize(SIZES.small);
            setColor(COLORS.text);

            // Calculate available width for text (box width - left/right padding)
            const textAreaWidth = boxW - 30; // 15px padding on each side
            const firstLineWidth = textAreaWidth - offset - 8; // Account for badge on first line

            const fullText = cleanStr(issue.msg || "Issue detected");
            const firstLineText = splitText(fullText, firstLineWidth);

            // Draw first line after badge
            if (firstLineText.length > 0) {
              pdf.text(firstLineText[0], boxX + 15 + offset + 8, y);
              y += 14;
            }

            // If there's remaining text, wrap it at full width
            if (firstLineText.length > 1) {
              // Get remaining text after first line
              const remainingLines = splitText(fullText, textAreaWidth);
              remainingLines.slice(1).forEach((line) => {
                pdf.text(line, boxX + 15, y);
                y += 14;
              });
            }
            y += 8;
          });
          y += 15;
        }

        // Sample answers and rubrics for this question
        await drawSamplesAndRubrics(q);

        // OR handling
        if (q.isOr && i + 1 < questions.length) {
          y += 15;
          pdf.setFont(FONT.heading, "bold");
          pdf.setFontSize(10);
          setColor(COLORS.muted);
          pdf.text("— OR —", margin + contentWidth / 2 - 20, y);
          y += 15;

          const nextQ = questions[i + 1];

          // Next question number and marks
          pdf.setFont(FONT.heading, "bold");
          pdf.setFontSize(11);
          setColor(COLORS.dark);
          pdf.text(`Q${qNum + 1}.`, margin, y);
          pdf.setFont(FONT.heading, "normal");
          pdf.setFontSize(10);
          setColor(COLORS.muted);
          const nextMarks = `[${nextQ.marks} Marks]`;
          pdf.text(nextMarks, pageWidth - margin - pdf.getTextWidth(nextMarks), y);
          y += 5;

          // Next question text (with LaTeX detection)
          const cleanedNextQ = cleanStr(nextQ.text);

          if (hasLatex(cleanedNextQ)) {
            pdf.setFont(FONT.mono, "normal");
            pdf.setFontSize(10);
          } else {
            pdf.setFont(FONT.body, "normal");
            pdf.setFontSize(11);
          }

          setColor(COLORS.text);
          const nextLines = splitText(cleanedNextQ, contentWidth - 80);
          nextLines.forEach((line) => {
            y += 14;
            pdf.text(line, margin + 30, y);
          });
          y += 10;

          // Next question issues
          const nextIssues = getQIssues(qNum + 1);
          if (nextIssues.length > 0) {
            const boxX = margin + 35;
            const boxW = contentWidth - 70;
            const textAreaWidth = boxW - 30; // 15px padding on each side

            // Calculate box height based on actual content (header + padding + issues)
            let totalIssueHeight = 55; // Header space + padding
            nextIssues.forEach(issue => {
              const msgLines = splitText(cleanStr(issue.msg || "Issue detected"), textAreaWidth);
              totalIssueHeight += msgLines.length * 14 + 16;
            });

            checkSpace(totalIssueHeight + 15);

            // Draw issues box with softer amber
            pdf.setFillColor(255, 253, 245); // Very pale amber
            pdf.setDrawColor(217, 164, 6);   // Darker amber border
            pdf.setLineWidth(1.5);
            pdf.roundedRect(boxX, y, boxW, totalIssueHeight, 6, 6, "FD");

            // Header area
            y += 20;

            // Draw vector warning triangle
            drawWarningIcon(boxX + 15, y + 2, 14);

            // Header text
            pdf.setFont(FONT.heading, "bold");
            pdf.setFontSize(SIZES.small);
            setColor(COLORS.dark);
            pdf.text("QUALITY ISSUES DETECTED", boxX + 35, y);
            y += 18;

            // Subtle divider line
            pdf.setDrawColor(230, 200, 100);
            pdf.setLineWidth(0.5);
            pdf.line(boxX + 15, y, boxX + boxW - 15, y);
            y += 15;

            nextIssues.forEach((issue) => {
              const badgeColor = issue.severity === "high" ? COLORS.danger :
                issue.severity === "medium" ? COLORS.warning : COLORS.info;
              const offset = drawBadge(issue.type, badgeColor, boxX + 15);

              pdf.setFont(FONT.heading, "normal");
              pdf.setFontSize(SIZES.small);
              setColor(COLORS.text);

              // Calculate available width for text
              const firstLineWidth = textAreaWidth - offset - 8;
              const fullText = cleanStr(issue.msg || "Issue detected");
              const firstLineText = splitText(fullText, firstLineWidth);

              // Draw first line after badge
              if (firstLineText.length > 0) {
                pdf.text(firstLineText[0], boxX + 15 + offset + 8, y);
                y += 14;
              }

              // If there's remaining text, wrap it at full width
              if (firstLineText.length > 1) {
                const remainingLines = splitText(fullText, textAreaWidth);
                remainingLines.slice(1).forEach((line) => {
                  pdf.text(line, boxX + 15, y);
                  y += 14;
                });
              }
              y += 8;
            });
            y += 15;
          }

          // Sample answers and rubrics for OR question
          await drawSamplesAndRubrics(nextQ);

          qNum += 2;
          i++; // Skip next question as we handled it
        } else {
          qNum++;
        }

        // Divider between question blocks
        y += 15;
        drawRule();
        y += 5;
      }
    };

    // ═══════════════════════════════════════════════════════════════
    // QUICKPASS ANALYSIS
    // ═══════════════════════════════════════════════════════════════
    const drawQuickPass = () => {
      const qp = paper.intelligence?.quickpass;
      if (!qp) return;

      newPage();
      sectionTitle("QuickPass Quality Analysis");

      // Collect all issues
      const allIssues = [];
      qp.ambiguity?.flags?.forEach(f => allIssues.push({ cat: "Clarity", ...f, msg: f.issue }));
      qp.or_conflicts?.issues?.forEach(i => allIssues.push({ cat: "OR Fairness", ...i, msg: i.issue || i.reason }));
      qp.marks_effort?.warnings?.forEach(w => allIssues.push({ cat: "Marks", ...w, msg: w.reason }));
      qp.duplicates?.pairs?.forEach(p => allIssues.push({ cat: "Duplicates", qid: p.questions?.join(", "), msg: p.reason || "Similar questions", severity: "medium" }));
      qp.evaluation_smoothness?.issues?.forEach(i => allIssues.push({ cat: "Marking", ...i, msg: i.issue }));

      // Health score
      const checks = [
        { name: "Question Clarity", passed: qp.ambiguity?.safe },
        { name: "OR Question Fairness", passed: qp.or_conflicts?.safe },
        { name: "Marks Allocation", passed: qp.marks_effort?.balanced },
        { name: "No Duplicates", passed: !qp.duplicates?.pairs?.length },
        { name: "Marking Consistency", passed: qp.evaluation_smoothness?.safe },
      ];
      const passedCount = checks.filter(c => c.passed).length;
      const healthPct = Math.round((passedCount / 5) * 100);

      // Health score card
      drawCard(70, true);

      // Score badge
      const scoreColor = healthPct >= 80 ? COLORS.success : healthPct >= 50 ? COLORS.warning : COLORS.danger;
      pdf.setFillColor(...scoreColor);
      pdf.roundedRect(margin + 20, y + 20, 80, 35, 5, 5, "F");
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(20);
      setColor(COLORS.white);
      pdf.text(`${healthPct}%`, margin + 60, y + 45, { align: "center" });

      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(12);
      setColor(COLORS.dark);
      pdf.text("Health Score", margin + 120, y + 35);
      pdf.setFont(FONT.heading, "normal");
      pdf.setFontSize(10);
      setColor(COLORS.muted);
      pdf.text(`${passedCount} of 5 quality checks passed`, margin + 120, y + 52);

      y += 85;

      // Checks list
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(10);
      setColor(COLORS.dark);
      pdf.text("Quality Checks", margin, y);
      y += 18;

      checks.forEach((check) => {
        checkSpace(18);
        const statusColor = check.passed ? COLORS.success : COLORS.danger;
        pdf.setFillColor(...statusColor);
        pdf.circle(margin + 8, y - 3, 4, "F");

        pdf.setFont(FONT.body, "normal");
        pdf.setFontSize(10);
        setColor(COLORS.text);
        pdf.text(check.name, margin + 20, y);

        pdf.setFont(FONT.heading, "normal");
        setColor(check.passed ? COLORS.success : COLORS.danger);
        pdf.text(check.passed ? "Passed" : "Issues Found", margin + 200, y);
        y += 18;
      });

      y += 20;

      // Issues breakdown
      if (allIssues.length > 0) {
        checkSpace(40);
        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(10);
        setColor(COLORS.danger);
        pdf.text(`${allIssues.length} Issues Identified`, margin, y);
        y += 20;

        // Group by category
        const grouped = {};
        allIssues.forEach(i => {
          if (!grouped[i.cat]) grouped[i.cat] = [];
          grouped[i.cat].push(i);
        });

        Object.entries(grouped).forEach(([cat, issues]) => {
          checkSpace(30 + issues.length * 18);

          pdf.setFont(FONT.heading, "bold");
          pdf.setFontSize(10);
          setColor(COLORS.dark);
          pdf.text(`${cat} (${issues.length})`, margin, y);
          y += 15;

          issues.forEach((issue) => {
            checkSpace(18);
            const sevColor = issue.severity === "high" ? COLORS.danger :
              issue.severity === "medium" ? COLORS.warning : COLORS.info;
            pdf.setFillColor(...sevColor);
            pdf.circle(margin + 15, y - 3, 3, "F");

            pdf.setFont(FONT.heading, "normal");
            pdf.setFontSize(9);
            setColor(COLORS.muted);
            pdf.text(`[${issue.qid || "—"}]`, margin + 25, y);

            pdf.setFont(FONT.body, "normal");
            setColor(COLORS.text);
            const msgLines = splitText(cleanStr(issue.msg || "Issue detected"), contentWidth - 80);
            pdf.text(msgLines[0], margin + 60, y);
            y += 16;
          });
          y += 10;
        });
      }
    };

    // ═══════════════════════════════════════════════════════════════
    // COVERAGE ANALYSIS
    // ═══════════════════════════════════════════════════════════════
    const drawCoverage = () => {
      const cov = paper.coverage_analysis;
      if (!cov) return;

      newPage();
      sectionTitle("Syllabus Coverage Analysis");

      // Overall score card
      const covPct = cov.overall || 0;
      const covColor = covPct >= 70 ? COLORS.success : covPct >= 40 ? COLORS.warning : COLORS.danger;

      drawCard(70, true);

      pdf.setFillColor(...covColor);
      pdf.roundedRect(margin + 20, y + 20, 80, 35, 5, 5, "F");
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(20);
      setColor(COLORS.white);
      pdf.text(`${covPct}%`, margin + 60, y + 45, { align: "center" });

      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(12);
      setColor(COLORS.dark);
      pdf.text("Syllabus Coverage", margin + 120, y + 35);
      pdf.setFont(FONT.heading, "normal");
      pdf.setFontSize(10);
      setColor(COLORS.muted);
      pdf.text(`${cov.coveredTopics || 0} of ${cov.totalTopics || 0} topics covered`, margin + 120, y + 52);

      y += 85;

      // Unit breakdown table
      if (cov.units?.length > 0) {
        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(10);
        setColor(COLORS.dark);
        pdf.text("Unit Breakdown", margin, y);
        y += 18;

        const col1W = contentWidth * 0.55;
        const col2W = contentWidth * 0.22;
        const col3W = contentWidth * 0.23;

        // Header
        pdf.setFillColor(...COLORS.primary);
        pdf.rect(margin, y, col1W, 18, "F");
        pdf.rect(margin + col1W, y, col2W, 18, "F");
        pdf.rect(margin + col1W + col2W, y, col3W, 18, "F");

        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(9);
        setColor(COLORS.white);
        pdf.text("UNIT", margin + 8, y + 12);
        pdf.text("COVERAGE", margin + col1W + 8, y + 12);
        pdf.text("TOPICS", margin + col1W + col2W + 8, y + 12);
        y += 20;

        cov.units.forEach((unit, idx) => {
          checkSpace(22);
          const coveredTopics = unit.topics?.filter(t => t.status === "covered" || t.status === "partial").length || 0;
          const totalTopics = unit.topics?.length || 0;
          const unitPct = unit.coverage || 0;

          if (idx % 2 === 0) {
            pdf.setFillColor(...COLORS.light);
            pdf.rect(margin, y, contentWidth, 20, "F");
          }
          pdf.setDrawColor(...COLORS.border);
          pdf.line(margin, y + 20, margin + contentWidth, y + 20);

          pdf.setFont(FONT.body, "normal");
          pdf.setFontSize(9);
          setColor(COLORS.text);
          const unitName = (unit.name || "").substring(0, 45);
          pdf.text(unitName, margin + 8, y + 13);

          const pctColor = unitPct >= 70 ? COLORS.success : unitPct >= 40 ? COLORS.warning : COLORS.danger;
          pdf.setFont(FONT.heading, "bold");
          setColor(pctColor);
          pdf.text(`${unitPct}%`, margin + col1W + 8, y + 13);

          pdf.setFont(FONT.body, "normal");
          setColor(COLORS.muted);
          pdf.text(`${coveredTopics}/${totalTopics}`, margin + col1W + col2W + 8, y + 13);

          y += 20;
        });
        y += 15;
      }

      // Recommendations
      if (cov.recommendations?.length > 0) {
        checkSpace(40);
        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(10);
        setColor(COLORS.dark);
        pdf.text("Recommendations", margin, y);
        y += 18;

        cov.recommendations.forEach((rec) => {
          checkSpace(30);
          const sevColor = rec.severity === "error" ? COLORS.danger : rec.severity === "warning" ? COLORS.warning : COLORS.success;
          pdf.setFillColor(...sevColor);
          pdf.circle(margin + 8, y - 3, 3, "F");

          pdf.setFont(FONT.body, "normal");
          pdf.setFontSize(10);
          setColor(COLORS.text);
          const msgLines = splitText(cleanStr(rec.message), contentWidth - 30);
          pdf.text(msgLines[0], margin + 20, y);
          y += 14;

          if (rec.suggestion) {
            pdf.setFont(FONT.body, "italic");
            pdf.setFontSize(9);
            setColor(COLORS.muted);
            const suggLines = splitText(cleanStr(rec.suggestion), contentWidth - 40);
            pdf.text(suggLines[0], margin + 25, y);
            y += 12;
          }
          y += 5;
        });
      }
    };

    // ═══════════════════════════════════════════════════════════════
    // BLOOM'S TAXONOMY
    // ═══════════════════════════════════════════════════════════════
    const drawBlooms = () => {
      const blooms = paper.coverage_analysis?.blooms;
      if (!blooms) return;

      newPage();
      sectionTitle("Bloom's Taxonomy Analysis");

      // Quality badge
      const quality = blooms.insights?.quality || "N/A";
      const qualityColor = quality === "Good" ? COLORS.success : quality === "Average" ? COLORS.warning : COLORS.danger;

      drawCard(55, true);

      pdf.setFillColor(...qualityColor);
      pdf.roundedRect(margin + 20, y + 15, 90, 28, 4, 4, "F");
      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(11);
      setColor(COLORS.white);
      pdf.text(`${quality} Quality`, margin + 65, y + 34, { align: "center" });

      pdf.setFont(FONT.heading, "bold");
      pdf.setFontSize(11);
      setColor(COLORS.dark);
      pdf.text("Paper Quality Rating", margin + 130, y + 30);
      pdf.setFont(FONT.heading, "normal");
      pdf.setFontSize(9);
      setColor(COLORS.muted);
      pdf.text("Based on cognitive level distribution", margin + 130, y + 44);

      y += 70;

      // Distribution table
      if (blooms.distribution) {
        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(10);
        setColor(COLORS.dark);
        pdf.text("Cognitive Level Distribution", margin, y);
        y += 18;

        const levels = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
        const levelColors = [
          [148, 163, 184], [96, 165, 250], [52, 211, 153],
          [251, 191, 36], [249, 115, 22], [168, 85, 247],
        ];
        const totalQ = Object.values(blooms.distribution).reduce((a, b) => a + b, 0) || 1;

        levels.forEach((level, i) => {
          checkSpace(22);
          const count = blooms.distribution[level] || 0;
          const pct = Math.round((count / totalQ) * 100);

          if (i % 2 === 0) {
            pdf.setFillColor(...COLORS.light);
            pdf.rect(margin, y, contentWidth, 20, "F");
          }

          pdf.setFont(FONT.body, "normal");
          pdf.setFontSize(10);
          setColor(COLORS.text);
          pdf.text(level, margin + 10, y + 13);

          // Progress bar
          const barX = margin + 120;
          const barW = 180;
          const fillW = (pct / 100) * barW;
          pdf.setFillColor(230, 230, 230);
          pdf.roundedRect(barX, y + 5, barW, 10, 3, 3, "F");
          pdf.setFillColor(...levelColors[i]);
          pdf.roundedRect(barX, y + 5, fillW, 10, 3, 3, "F");

          pdf.setFont(FONT.heading, "bold");
          pdf.setFontSize(9);
          setColor(levelColors[i]);
          pdf.text(String(count), barX + barW + 15, y + 13);

          setColor(COLORS.muted);
          pdf.text(`${pct}%`, barX + barW + 40, y + 13);

          y += 20;
        });
        y += 15;
      }

      // AI Insights
      if (blooms.insights?.summary) {
        const boxX = margin;
        const boxW = contentWidth;
        const boxPadding = 20;
        const textAreaWidth = boxW - (boxPadding * 2);

        checkSpace(60);
        pdf.setFillColor(250, 245, 255);
        pdf.setDrawColor(168, 85, 247);

        // Calculate box height based on actual content
        const insightLines = splitText(cleanStr(blooms.insights.summary), textAreaWidth);
        let suggestionLinesTotal = 0;
        if (blooms.insights.suggestions?.length > 0) {
          blooms.insights.suggestions.forEach(s => {
            const sLines = splitText("• " + cleanStr(s), textAreaWidth - 10);
            suggestionLinesTotal += sLines.length;
          });
        }
        const boxH = 50 + insightLines.length * 13 + suggestionLinesTotal * 13 + 20;

        pdf.roundedRect(boxX, y, boxW, boxH, 5, 5, "FD");

        y += 22;
        pdf.setFont(FONT.heading, "bold");
        pdf.setFontSize(SIZES.h4);
        setColor([139, 92, 246]);
        pdf.text("AI Insights", boxX + boxPadding, y);
        y += 18;

        pdf.setFont(FONT.body, "italic");
        pdf.setFontSize(SIZES.small);
        setColor(COLORS.text);
        insightLines.forEach((line) => {
          pdf.text(line, boxX + boxPadding, y);
          y += 13;
        });
        y += 10;

        if (blooms.insights.suggestions?.length > 0) {
          pdf.setFont(FONT.heading, "bold");
          pdf.setFontSize(SIZES.small);
          setColor(COLORS.muted);
          pdf.text("Suggestions:", boxX + boxPadding, y);
          y += 14;

          pdf.setFont(FONT.body, "normal");
          pdf.setFontSize(SIZES.small);
          setColor(COLORS.text);
          blooms.insights.suggestions.forEach((s) => {
            const sLines = splitText("• " + cleanStr(s), textAreaWidth - 10);
            sLines.forEach((line) => {
              pdf.text(line, boxX + boxPadding + 5, y);
              y += 13;
            });
          });
        }
      }
    };

    // ═══════════════════════════════════════════════════════════════
    // GENERATE PDF
    // ═══════════════════════════════════════════════════════════════
    drawCoverPage();
    await drawCompleteQuestions();
    drawQuickPass();
    drawCoverage();
    drawBlooms();

    // Save
    const safeName = (paper.subject_name || paper.subjectName || "Paper").replace(/\s+/g, "_");
    const safeMonth = (paper.exam_month_year || paper.examMonthYear || "Report").replace(/\s+/g, "_");
    pdf.save(`${safeName}_ComprehensiveReport_${safeMonth}.pdf`);

  } catch (err) {
    console.error("PDF generation error:", err);
    alert("Failed to generate PDF. Check console for details.");
  }
};
