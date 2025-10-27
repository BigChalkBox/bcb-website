// src/utils/completePdfGenerator.js
/**
 * Professional PDF generator
 * Questions + Sample Answers + Rubrics + Suggestions
 * Simple, clean formatting
 */
import jsPDF from "jspdf";

export const downloadCompleteQuestionPaper = (paper) => {
  try {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    let yPosition = 50;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    const baseFontSize = 11;
    const lineHeight = baseFontSize * 1.4;

    /* ---------- Helpers ---------- */
    const checkPageBreak = (requiredSpace = 60) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    const safeSplitText = (text, maxWidth) =>
      pdf.splitTextToSize(text || "", maxWidth);

    const cleanText = (str) => {
      return str
        .replace(/→/g, "->")
        .replace(/[\u00A0\u2000-\u200B]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const sectionHeader = (title) => {
      checkPageBreak(28);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.text(title, pageWidth / 2, yPosition, { align: "center" });
      yPosition += 24;
    };

    const writeParagraph = (
      text,
      indent = 0,
      fontSize = baseFontSize,
      italic = false
    ) => {
      if (!text) return;

      pdf.setFont("times", italic ? "italic" : "normal");
      pdf.setFontSize(fontSize);

      const parts = text.split("\n");
      parts.forEach((part) => {
        const cleaned = cleanText(part);
        if (!cleaned) {
          yPosition += lineHeight;
          return;
        }

        if (cleaned.startsWith("*")) {
          const content = cleaned.replace(/^\*+/, "").trim();
          const lines = safeSplitText(content, contentWidth - (indent + 20));
          checkPageBreak(lines.length * lineHeight);
          pdf.text("•", margin + indent, yPosition);
          pdf.text(lines[0], margin + indent + 12, yPosition);
          yPosition += lineHeight;
          for (let i = 1; i < lines.length; i++) {
            pdf.text(lines[i], margin + indent + 12, yPosition);
            yPosition += lineHeight;
          }
        } else {
          const lines = safeSplitText(cleaned, contentWidth - indent);
          checkPageBreak(lines.length * lineHeight);
          lines.forEach((ln) => {
            pdf.text(ln, margin + indent, yPosition);
            yPosition += lineHeight;
          });
        }
      });

      yPosition += 6;
    };

    /* ---------- Normalize questions ---------- */
    const questions = paper.paper_data?.questions || paper.questions || [];

    /* ---------- HEADER ---------- */
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(
      paper.universityFullName || "UNIVERSITY OF PETROLEUM AND ENERGY STUDIES",
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 25;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text(
      `${paper.subject_name || paper.subjectName || "Subject"} (${
        paper.subject_code || paper.subjectCode || "Code"
      })`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 20;

    pdf.text(
      `Faculty: ${
        paper.faculty_name || paper.facultyName || "N/A"
      } | Year: ${paper.year || "N/A"} | Exam: ${
        paper.exam_month_year || paper.examMonthYear || "July 2025"
      }`,
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    yPosition += 35;

    /* ---------- QUESTIONS ---------- */
    sectionHeader("Questions with Sample Answers & Rubrics");

    let qCounter = 1;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      // 🟢 NEW: Handle OR grouping fully (with answers, rubrics, etc.)
      if (q.isOr && i + 1 < questions.length) {
        const nextQ = questions[i + 1];

        // ---------- FIRST QUESTION ----------
        checkPageBreak(50);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(`Q${qCounter}.`, margin, yPosition);
        pdf.text(`(${q.marks} Marks)`, pageWidth - margin - 60, yPosition);
        yPosition += 16;
        writeParagraph(q.text, 15, 11);

        if (q.suggestions) {
          pdf.setTextColor(100);
          writeParagraph(`Suggestion: ${q.suggestions}`, 25, 9, true);
          pdf.setTextColor(0);
        }

        // ✅ Render its samples and rubrics
        if (q.samples && q.samples.length > 0) {
          q.samples.forEach((s, si) => {
            sectionHeader(`Sample Answer ${si + 1}`);

            if (s.instructions)
              writeParagraph(`Instructions: ${s.instructions}`, 20, 9, true);
            if (s.answer) writeParagraph(s.answer, 20, 10, false);

            if (s.rubric && s.rubric.criteria) {
              sectionHeader("Rubric");
              const colWidths = [contentWidth * 0.75, contentWidth * 0.25];
              let x = margin;
              pdf.setFillColor(200);
              pdf.rect(x, yPosition, colWidths[0], 20, "F");
              pdf.rect(x + colWidths[0], yPosition, colWidths[1], 20, "F");
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(10);
              pdf.text("Criterion", x + 5, yPosition + 14);
              pdf.text("Weight", x + colWidths[0] + 5, yPosition + 14);
              yPosition += 22;

              pdf.setFont("helvetica", "normal");
              s.rubric.criteria.forEach((c) => {
                const critLines = safeSplitText(c.criterion, colWidths[0] - 10);
                const rowHeight = Math.max(22, critLines.length * lineHeight + 6);
                checkPageBreak(rowHeight + 10);

                pdf.rect(x, yPosition, colWidths[0], rowHeight);
                pdf.rect(x + colWidths[0], yPosition, colWidths[1], rowHeight);

                let textY = yPosition + 14;
                critLines.forEach((ln) => {
                  pdf.text(ln, x + 5, textY);
                  textY += lineHeight;
                });

                pdf.text(String(c.weight), x + colWidths[0] + 5, yPosition + 14);
                yPosition += rowHeight;
              });
              yPosition += 12;
            }
          });
        }

        // 🟢 Add OR divider
        checkPageBreak(30);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.text("— OR —", pageWidth / 2, yPosition, { align: "center" });
        yPosition += 25;

        // ---------- SECOND QUESTION ----------
        checkPageBreak(50);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(`Q${qCounter + 1}.`, margin, yPosition);
        pdf.text(`(${nextQ.marks} Marks)`, pageWidth - margin - 60, yPosition);
        yPosition += 16;
        writeParagraph(nextQ.text, 15, 11);

        if (nextQ.suggestions) {
          pdf.setTextColor(100);
          writeParagraph(`Suggestion: ${nextQ.suggestions}`, 25, 9, true);
          pdf.setTextColor(0);
        }

        // ✅ Render samples and rubrics for second question
        if (nextQ.samples && nextQ.samples.length > 0) {
          nextQ.samples.forEach((s, si) => {
            sectionHeader(`Sample Answer ${si + 1}`);

            if (s.instructions)
              writeParagraph(`Instructions: ${s.instructions}`, 20, 9, true);
            if (s.answer) writeParagraph(s.answer, 20, 10, false);

            if (s.rubric && s.rubric.criteria) {
              sectionHeader("Rubric");
              const colWidths = [contentWidth * 0.75, contentWidth * 0.25];
              let x = margin;
              pdf.setFillColor(200);
              pdf.rect(x, yPosition, colWidths[0], 20, "F");
              pdf.rect(x + colWidths[0], yPosition, colWidths[1], 20, "F");
              pdf.setFont("helvetica", "bold");
              pdf.setFontSize(10);
              pdf.text("Criterion", x + 5, yPosition + 14);
              pdf.text("Weight", x + colWidths[0] + 5, yPosition + 14);
              yPosition += 22;

              pdf.setFont("helvetica", "normal");
              s.rubric.criteria.forEach((c) => {
                const critLines = safeSplitText(c.criterion, colWidths[0] - 10);
                const rowHeight = Math.max(22, critLines.length * lineHeight + 6);
                checkPageBreak(rowHeight + 10);

                pdf.rect(x, yPosition, colWidths[0], rowHeight);
                pdf.rect(x + colWidths[0], yPosition, colWidths[1], rowHeight);

                let textY = yPosition + 14;
                critLines.forEach((ln) => {
                  pdf.text(ln, x + 5, textY);
                  textY += lineHeight;
                });

                pdf.text(String(c.weight), x + colWidths[0] + 5, yPosition + 14);
                yPosition += rowHeight;
              });
              yPosition += 12;
            }
          });
        }

        pdf.setFont("times", "italic");
        pdf.setFontSize(10);
        pdf.text(
          "Attempt any one of the above questions.",
          pageWidth / 2,
          yPosition,
          { align: "center" }
        );
        yPosition += 20;

        i++;
        qCounter += 2;
        continue;
      }

      // ---------- NORMAL QUESTION ----------
      checkPageBreak(50);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(`Q${qCounter}.`, margin, yPosition);
      pdf.text(`(${q.marks} Marks)`, pageWidth - margin - 60, yPosition);
      yPosition += 16;

      writeParagraph(q.text, 15, 11);

      if (q.suggestions) {
        pdf.setTextColor(100);
        writeParagraph(`Suggestion: ${q.suggestions}`, 25, 9, true);
        pdf.setTextColor(0);
      }

      if (q.samples && q.samples.length > 0) {
        q.samples.forEach((s, si) => {
          sectionHeader(`Sample Answer ${si + 1}`);

          if (s.instructions)
            writeParagraph(`Instructions: ${s.instructions}`, 20, 9, true);
          if (s.answer) writeParagraph(s.answer, 20, 10, false);

          if (s.rubric && s.rubric.criteria) {
            sectionHeader("Rubric");

            const colWidths = [contentWidth * 0.75, contentWidth * 0.25];
            let x = margin;

            pdf.setFillColor(200);
            pdf.rect(x, yPosition, colWidths[0], 20, "F");
            pdf.rect(x + colWidths[0], yPosition, colWidths[1], 20, "F");
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(10);
            pdf.text("Criterion", x + 5, yPosition + 14);
            pdf.text("Weight", x + colWidths[0] + 5, yPosition + 14);
            yPosition += 22;

            pdf.setFont("helvetica", "normal");
            s.rubric.criteria.forEach((c) => {
              const critLines = safeSplitText(c.criterion, colWidths[0] - 10);
              const rowHeight = Math.max(22, critLines.length * lineHeight + 6);
              checkPageBreak(rowHeight + 10);

              pdf.rect(x, yPosition, colWidths[0], rowHeight);
              pdf.rect(x + colWidths[0], yPosition, colWidths[1], rowHeight);

              let textY = yPosition + 14;
              critLines.forEach((ln) => {
                pdf.text(ln, x + 5, textY);
                textY += lineHeight;
              });

              pdf.text(String(c.weight), x + colWidths[0] + 5, yPosition + 14);

              yPosition += rowHeight;
            });
            yPosition += 12;
          }
        });
      }

      yPosition += 15;
      qCounter++;
    }

    /* ---------- SAVE ---------- */
    const safeMonth = (
      paper.exam_month_year ||
      paper.examMonthYear ||
      "July 2025"
    ).replace(/\s+/g, "_");
    const fileName = `${
      (paper.subject_name || paper.subjectName || "Question").replace(
        /\s+/g,
        "_"
      )
    }_PaperWithSamples_${safeMonth}.pdf`;
    pdf.save(fileName);
  } catch (err) {
    console.error("PDF generation error:", err);
    alert("Failed to generate PDF. Check console for details.");
  }
};
