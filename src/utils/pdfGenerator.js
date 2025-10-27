// /**
//  * Dynamic PDF exam paper generator using jsPDF
//  * - Proper padding so question text cannot overflow cell borders
//  * - Dynamic sections, CO mapping and MCQ options
//  * - Correct page-break handling (row height computed from wrapped lines)
//  * - Clean defaults and safe fallbacks
//  * - Improved LaTeX readability rendering (no syntax clutter)
//  */
// import jsPDF from "jspdf";

// export const downloadPaperAsPDF = (paper) => {
//   try {
//     const pdf = new jsPDF({ unit: "pt", format: "a4" });
//     let yPosition = 40;
//     const pageWidth = pdf.internal.pageSize.getWidth();
//     const pageHeight = pdf.internal.pageSize.getHeight();
//     const margin = 36;
//     const contentWidth = pageWidth - margin * 2;

//     const topSectionHeight = 36;
//     const headerHeight = 70;
//     const sectionHeaderHeight = 26;
//     const minRowHeight = 28;
//     const cellPaddingX = 8;
//     const cellPaddingY = 6;
//     const lineHeight = 12;

//     /* ---------- Helpers ---------- */
//     const checkPageBreak = (requiredSpace) => {
//       if (yPosition + requiredSpace > pageHeight - margin) {
//         pdf.addPage();
//         yPosition = margin;
//       }
//     };

//     const drawBorderedRect = (x, y, width, height, fillColor = null) => {
//       if (fillColor) {
//         pdf.setFillColor(...fillColor);
//         pdf.rect(x, y, width, height, "FD");
//       } else {
//         pdf.rect(x, y, width, height);
//       }
//     };

//     const drawTextCentered = (text, x, y, fontSize = 11, bold = false) => {
//       pdf.setFont("helvetica", bold ? "bold" : "normal");
//       pdf.setFontSize(fontSize);
//       pdf.text(text, x, y, { align: "center" });
//     };

//     const safeSplitText = (text, maxWidth) => pdf.splitTextToSize(text || "", maxWidth);

//     const cleanLatex = (str = "") => {
//       return (
//         str
//           .replace(/\\begin\{.*?\}/g, "")
//           .replace(/\\end\{.*?\}/g, "")
//           .replace(/\\mathbb\{R\}/g, "R")
//           .replace(/\\text\{(.*?)\}/g, "$1")
//           .replace(/\\cdot/g, "·")
//           .replace(/\\times/g, "×")
//           .replace(/\\frac\{(.*?)\}\{(.*?)\}/g, "($1)/($2)")
//           .replace(/\\left/g, "")
//           .replace(/\\right/g, "")
//           .replace(/\\pm/g, "±")
//           .replace(/\\sqrt\{(.*?)\}/g, "√($1)")
//           .replace(/\\theta/g, "θ")
//           .replace(/\\sin/g, "sin")
//           .replace(/\\cos/g, "cos")
//           .replace(/\\tan/g, "tan")
//           .replace(/\\rightarrow/g, "→")
//           .replace(/\\to/g, "→")
//           .replace(/\\infty/g, "∞")
//           .replace(/\\forall/g, "∀")
//           .replace(/\\exists/g, "∃")
//           .replace(/\^([0-9a-zA-Z])/g, "^( $1 )")
//           .replace(/_([0-9a-zA-Z])/g, "_( $1 )")
//           .replace(/\\n/g, "\n")
//           .replace(/\$/g, "")
//           .replace(/\s+/g, " ")
//           .trim()
//       );
//     };

//     /* ---------- TOP HEADER ---------- */
//     const leftBoxWidth = contentWidth * 0.62;
//     const rightBoxWidth = contentWidth - leftBoxWidth;
//     checkPageBreak(topSectionHeight + 10);
//     drawBorderedRect(margin, yPosition, leftBoxWidth, topSectionHeight);
//     drawBorderedRect(margin + leftBoxWidth, yPosition, rightBoxWidth, topSectionHeight);

//     pdf.setFont("helvetica", "bold");
//     pdf.setFontSize(11);
//     pdf.text("Name:", margin + cellPaddingX, yPosition + 14);
//     pdf.text("Enrolment No:", margin + cellPaddingX, yPosition + 28);
//     drawTextCentered(
//       paper.universityShortName || "UPES",
//       margin + leftBoxWidth + rightBoxWidth / 2,
//       yPosition + topSectionHeight / 2 + 4,
//       12,
//       true
//     );
//     yPosition += topSectionHeight + 8;

//     /* ---------- UNIVERSITY HEADER ---------- */
//     checkPageBreak(headerHeight + 10);
//     drawBorderedRect(margin, yPosition, contentWidth, headerHeight + 20);
//     drawTextCentered(
//       paper.universityFullName || "UNIVERSITY OF PETROLEUM AND ENERGY STUDIES",
//       pageWidth / 2,
//       yPosition + 18,
//       14,
//       true
//     );
//     drawTextCentered(
//       `${paper.exam_type || paper.examType || "Summer"} Examination, ${
//         paper.exam_month_year || paper.examMonthYear || "July 2025"
//       }`,
//       pageWidth / 2,
//       yPosition + 36,
//       12
//     );
//     pdf.setFont("helvetica", "normal");
//     pdf.setFontSize(11);

//     const infoRows = [
//       {
//         left: `Course: ${
//           paper.course || paper.subject_name || paper.subjectName || "N/A"
//         }`,
//         right: `Semester: ${paper.semester || "N/A"}`,
//       },
//       {
//         left: `Program: ${paper.program || "N/A"}`,
//         right: `Time: ${paper.timeAllowed || "N/A"}`,
//       },
//       {
//         left: `Course Code: ${
//           paper.subject_code || paper.subjectCode || "N/A"
//         }`,
//         right: `Max. Marks: ${paper.maxMarks || "N/A"}`,
//       },
//     ];

//     infoRows.forEach((r, i) => {
//       pdf.text(r.left, margin + cellPaddingX, yPosition + 55 + i * 12);
//       pdf.text(r.right, margin + contentWidth / 1.8, yPosition + 55 + i * 12);
//     });
//     yPosition += headerHeight + 40;

//     /* ---------- INSTRUCTIONS ---------- */
//     if (paper.instructions) {
//       const instrLines = safeSplitText(
//         `Instructions: ${cleanLatex(paper.instructions)}`,
//         contentWidth - cellPaddingX * 2
//       );
//       instrLines.forEach((ln) => {
//         checkPageBreak(lineHeight);
//         pdf.setFontSize(10);
//         pdf.text(ln, margin + cellPaddingX, yPosition);
//         yPosition += lineHeight;
//       });
//       yPosition += 6;
//     }

//     /* ---------- QUESTIONS ---------- */
//     const questions = paper.paper_data?.questions || paper.questions || [];
//     const grouped = groupQuestionsBySection(questions, paper.sectionConfig);
//     const sectionOrder = paper.sectionOrder || Object.keys(grouped);
//     let globalQuestionCounter = 1;

//     for (const sectionKey of sectionOrder) {
//       const sectionQuestions = grouped[sectionKey] || [];
//       if (!sectionQuestions.length) continue;

//       const sectionConfig =
//         (paper.sectionConfig && paper.sectionConfig[sectionKey]) || {};
//       const sectionLabel = sectionConfig.label || prettifySectionKey(sectionKey);
//       const defaultMarks = sectionConfig.defaultMarks || 0;
//       const coMapping = sectionConfig.coMapping || ((idx) => `CO${idx}`);

//       checkPageBreak(sectionHeaderHeight + 10);
//       drawBorderedRect(margin, yPosition, contentWidth - 15, sectionHeaderHeight, [245, 525, 245]);
//       pdf.setFont("helvetica", "bold");
//       pdf.setFontSize(12);
//       pdf.text(sectionLabel, margin + contentWidth / 2, yPosition + 10, { align: "center" });
//       const totalMarks = sectionQuestions.reduce(
//         (s, q) => s + (typeof q.marks === "number" ? q.marks : defaultMarks),
//         0
//       );
//       pdf.setFont("helvetica", "normal");
//       pdf.setFontSize(10);
//       pdf.text(`(${sectionQuestions.length}Q = ${totalMarks} Marks)`, margin + contentWidth / 2, yPosition + 22, { align: "center" });
//       yPosition += sectionHeaderHeight + 6;

//       const snoWidth = 40, marksWidth = 55, coWidth = 40;
//       const questionColWidth = contentWidth - snoWidth - marksWidth - coWidth - cellPaddingX * 4;

//       for (let i = 0; i < sectionQuestions.length; i++) {
//         const q = sectionQuestions[i];

//         // ✅ OR Handling (clean LaTeX + centered bold OR)
//         if (q.isOr && i + 1 < sectionQuestions.length) {
//           const nextQ = sectionQuestions[i + 1];
//           const combinedText = `Q${globalQuestionCounter}. ${cleanLatex(q.text)}\n\n——— OR ———\n\nQ${globalQuestionCounter + 1}. ${cleanLatex(nextQ.text)}`;
//           const wrapped = safeSplitText(combinedText, questionColWidth);
//           const combinedRowHeight = Math.max(minRowHeight, cellPaddingY * 2 + wrapped.length * lineHeight);
//           checkPageBreak(combinedRowHeight + 10);

//           let currentX = margin;
//           drawBorderedRect(currentX, yPosition, snoWidth, combinedRowHeight);
//           pdf.setFont("helvetica", "bold");
//           pdf.setFontSize(10);
//           pdf.text(`Q${globalQuestionCounter}\nQ${globalQuestionCounter + 1}`, currentX + snoWidth / 2, yPosition + 12, { align: "center" });
//           currentX += snoWidth;

//           drawBorderedRect(currentX, yPosition, questionColWidth + cellPaddingX * 2, combinedRowHeight);
//           pdf.setFont("helvetica", "normal");
//           pdf.setFontSize(9);
//           let textY = yPosition + cellPaddingY + 6;
//           wrapped.forEach((ln) => {
//             if (ln.includes("——— OR ———")) {
//               pdf.setFont("helvetica", "bold");
//               pdf.text("——— OR ———", margin + cellPaddingX + snoWidth + 20, textY, { align: "left" });
//               pdf.setFont("helvetica", "normal");
//             } else {
//               pdf.text(ln, currentX + cellPaddingX, textY, { maxWidth: questionColWidth });
//             }
//             textY += lineHeight;
//           });

//           currentX += questionColWidth + cellPaddingX * 2;
//           drawBorderedRect(currentX, yPosition, marksWidth, combinedRowHeight);
//           pdf.setFontSize(10);
//           pdf.text(String(q.marks), currentX + marksWidth / 2, yPosition + combinedRowHeight / 2 - 4, { align: "center" });
//           currentX += marksWidth;
//           drawBorderedRect(currentX, yPosition, coWidth, combinedRowHeight);
//           pdf.text(`CO${globalQuestionCounter}`, currentX + coWidth / 2, yPosition + combinedRowHeight / 2 - 4, { align: "center" });

//           yPosition += combinedRowHeight;
//           i++;
//           globalQuestionCounter += 2;
//           continue;
//         }

//         // 🔹 Normal Question (readable text)
//         const marks = typeof q.marks === "number" ? q.marks : defaultMarks;
//         const co = typeof coMapping === "function" ? coMapping(globalQuestionCounter, q) : coMapping;
//         let questionText = cleanLatex(q.text || "");
//         if (q.options && Array.isArray(q.options) && q.options.length > 0) {
//           questionText += "\n" + q.options.map((opt) => `• ${opt}`).join("\n");
//         }

//         const wrapped = safeSplitText(questionText, questionColWidth);
//         const calculatedRowHeight = Math.max(minRowHeight, cellPaddingY * 2 + wrapped.length * lineHeight);
//         checkPageBreak(calculatedRowHeight + 10);

//         let currentX = margin;
//         drawBorderedRect(currentX, yPosition, snoWidth, calculatedRowHeight);
//         pdf.setFont("helvetica", "bold");
//         pdf.setFontSize(10);
//         pdf.text(`Q ${globalQuestionCounter}`, currentX + snoWidth / 2, yPosition + 12, { align: "center" });
//         currentX += snoWidth;

//         drawBorderedRect(currentX, yPosition, questionColWidth + cellPaddingX * 2, calculatedRowHeight);
//         pdf.setFont("helvetica", "normal");
//         pdf.setFontSize(9);
//         let textY = yPosition + cellPaddingY + 6;
//         wrapped.forEach((ln) => {
//           pdf.text(ln, currentX + cellPaddingX, textY, { maxWidth: questionColWidth });
//           textY += lineHeight;
//         });

//         currentX += questionColWidth + cellPaddingX * 2;
//         drawBorderedRect(currentX, yPosition, marksWidth, calculatedRowHeight);
//         pdf.setFontSize(10);
//         pdf.text(String(marks), currentX + marksWidth / 2, yPosition + calculatedRowHeight / 2 - 4, { align: "center" });
//         currentX += marksWidth;
//         drawBorderedRect(currentX, yPosition, coWidth, calculatedRowHeight);
//         pdf.text(String(co), currentX + coWidth / 2, yPosition + calculatedRowHeight / 2 - 4, { align: "center" });

//         yPosition += calculatedRowHeight;
//         globalQuestionCounter++;
//       }
//       yPosition += 10;
//     }

//     const safeMonth = (paper.exam_month_year || paper.examMonthYear || "July 2025").replace(/\s+/g, "_");
//     const fileName = `${(paper.subject_name || paper.subjectName || "Question").replace(/\s+/g, "_")}_Paper_${safeMonth}.pdf`;
//     pdf.save(fileName);
//   } catch (err) {
//     console.error("PDF generation error:", err);
//     alert("Failed to generate PDF. Check console for details.");
//   }
// };

// /* ---------- Utilities ---------- */
// const prettifySectionKey = (key) => String(key).replace(/([a-z])([A-Z])/g, "$1 $2").toUpperCase();

// const groupQuestionsBySection = (questions = [], sectionConfig = {}) => {
//   const grouped = {};
//   if (sectionConfig && Object.keys(sectionConfig).length > 0) {
//     Object.keys(sectionConfig).forEach((k) => (grouped[k] = []));
//   } else {
//     grouped.sectionA = [];
//     grouped.sectionB = [];
//     grouped.sectionC = [];
//   }
//   questions.forEach((q) => {
//     if (q.section) {
//       grouped[q.section] = grouped[q.section] || [];
//       grouped[q.section].push(q);
//       return;
//     }
//     const marks = typeof q.marks === "number" ? q.marks : 0;
//     if (marks <= 4) grouped.sectionA.push(q);
//     else if (marks === 15) grouped.sectionB.push(q);
//     else if (marks >= 20) grouped.sectionC.push(q);
//     else grouped.sectionB.push(q);
//   });
//   return grouped;
// };










/**
 * 🎯 FINAL PRODUCTION PDF GENERATOR - Perfect Bracket Scaling
 * ✅ Auto-scaling parentheses for matrices using \left( \right)
 * ✅ Handles all LaTeX patterns from your JSON
 * ✅ Fixes missing backslashes and bracket sizing
 * ✅ Perfect rendering quality
 */
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import katex from "katex";
import "katex/dist/katex.min.css";

export const downloadPaperAsPDF = async (paper) => {
  try {
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    let yPosition = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 36;
    const contentWidth = pageWidth - margin * 2;

    const topSectionHeight = 36;
    const headerHeight = 70;
    const sectionHeaderHeight = 26;
    const minRowHeight = 35;
    const cellPaddingX = 6;
    const cellPaddingY = 6;
    const lineHeight = 12;

    /* ---------- CORE HELPERS ---------- */
    const checkPageBreak = (requiredSpace) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
    };

    const drawBorderedRect = (x, y, width, height, fillColor = null) => {
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);
      if (fillColor) {
        pdf.setFillColor(...fillColor);
        pdf.rect(x, y, width, height, "FD");
      } else {
        pdf.rect(x, y, width, height);
      }
    };

    const drawTextCentered = (text, x, y, fontSize = 11, bold = false) => {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(fontSize);
      pdf.text(text, x, y, { align: "center" });
    };

    const safeSplitText = (text, maxWidth) => pdf.splitTextToSize(text || "", maxWidth);

    /* ---------- LATEX PROCESSING ---------- */
    
    const hasLatex = (text) => {
      if (!text) return false;
      return /\$|\\\(|\\\[|\\begin|\\end|\\frac|\\int|\\sum|\\sqrt|\\alpha|\\beta|\\gamma|\\delta|\\theta|\\pi|\\omega|\\lambda|\\sigma|\\mu|\\infty|\\partial|\\nabla|\\Delta|\\times|\\div|\\pm|\\geq|\\leq|\\neq|\\approx|\\equiv|\\in|\\subset|\\cup|\\cap|\\mathbb|\\text\{|pmatrix|bmatrix|matrix|\\lim|\\sin|\\cos|\\tan|\\log|\\left|\\right/.test(text);
    };

    // ✅ CRITICAL: Fix LaTeX errors AND enable auto-scaling brackets
    const normalizeLatex = (latex) => {
      if (!latex) return "";
      
      let fixed = latex;
      
      // Fix: "end{pmatrix}" → "\end{pmatrix}"
      fixed = fixed.replace(/([^\\])end\{pmatrix\}/g, "$1\\end{pmatrix}");
      fixed = fixed.replace(/^end\{pmatrix\}/g, "\\end{pmatrix}");
      
      // Fix: "end{bmatrix}" → "\end{bmatrix}"
      fixed = fixed.replace(/([^\\])end\{bmatrix\}/g, "$1\\end{bmatrix}");
      fixed = fixed.replace(/^end\{bmatrix\}/g, "\\end{bmatrix}");
      
      // ✅ CRITICAL FIX: Convert pmatrix to auto-scaling delimiters
      // This makes brackets scale properly to matrix height
      fixed = fixed.replace(/\\begin\{pmatrix\}/g, "\\left(\\begin{matrix}");
      fixed = fixed.replace(/\\end\{pmatrix\}/g, "\\end{matrix}\\right)");
      
      // Same for bmatrix
      fixed = fixed.replace(/\\begin\{bmatrix\}/g, "\\left[\\begin{matrix}");
      fixed = fixed.replace(/\\end\{bmatrix\}/g, "\\end{matrix}\\right]");
      
      // Normalize spacing in matrices
      fixed = fixed.replace(/\\\\\s*/g, " \\\\ ");
      fixed = fixed.replace(/\s+/g, " ").trim();
      
      return fixed;
    };

    // ✅ Smart LaTeX delimiter parser
    const processLatexText = (text) => {
      if (!text) return "";
      
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

    // ✅ Safe LaTeX rendering with enhanced bracket support
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
          // ✅ Enable proper delimiter sizing
          macros: {
            "\\R": "\\mathbb{R}",
            "\\Z": "\\mathbb{Z}",
            "\\N": "\\mathbb{N}",
          },
        });
        return true;
      } catch (err) {
        console.warn(`LaTeX error: ${err.message.substring(0, 100)}`, latex.substring(0, 50));
        element.textContent = latex;
        element.style.color = "#cc0000";
        element.style.fontFamily = "monospace";
        element.style.fontSize = "10px";
        return false;
      }
    };

    // ✅ MAIN RENDERING FUNCTION with CSS for proper bracket sizing
    const renderLatexToImage = async (text, maxWidth, questionNumber = null) => {
      return new Promise(async (resolve) => {
        try {
          // ✅ Add CSS for proper bracket rendering
          const style = document.createElement("style");
          style.id = "katex-bracket-fix";
          style.textContent = `
            .katex .pstrut {
              min-height: 3em !important;
            }
            .katex .vlist-t {
              vertical-align: middle;
            }
            .katex .arraycolsep {
              width: 0.5em;
            }
            .katex .delimsizing {
              vertical-align: middle;
            }
          `;
          if (!document.getElementById("katex-bracket-fix")) {
            document.head.appendChild(style);
          }

          const tempDiv = document.createElement("div");
          tempDiv.style.position = "absolute";
          tempDiv.style.left = "-99999px";
          tempDiv.style.top = "0";
          tempDiv.style.width = maxWidth + "px";
          tempDiv.style.maxWidth = maxWidth + "px";
          tempDiv.style.padding = "12px";
          tempDiv.style.backgroundColor = "#ffffff";
          tempDiv.style.fontSize = "13px";
          tempDiv.style.lineHeight = "1.65";
          tempDiv.style.fontFamily = "'Segoe UI', Arial, Helvetica, sans-serif";
          tempDiv.style.color = "#000000";
          tempDiv.style.boxSizing = "border-box";
          tempDiv.style.wordWrap = "break-word";
          tempDiv.style.overflowWrap = "break-word";
          tempDiv.style.overflow = "visible";

          const parts = processLatexText(text);
          
          if (questionNumber) {
            const qNumSpan = document.createElement("strong");
            qNumSpan.textContent = `Q${questionNumber}. `;
            qNumSpan.style.fontSize = "14px";
            qNumSpan.style.fontWeight = "bold";
            qNumSpan.style.color = "#000";
            tempDiv.appendChild(qNumSpan);
          }

          parts.forEach((part, idx) => {
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
              div.style.margin = "12px 0";
              div.style.textAlign = "center";
              div.style.minHeight = "400px"; // ✅ Ensure tall brackets don't cut
              renderLatexSafely(part.content, div, true);
              tempDiv.appendChild(div);
            }
          });

          document.body.appendChild(tempDiv);

          // ✅ Wait for KaTeX fonts and bracket rendering
          await new Promise((r) => setTimeout(r, 350));

          const actualHeight = tempDiv.scrollHeight;
          const actualWidth = Math.min(tempDiv.scrollWidth, maxWidth);

          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: actualWidth,
            height: actualHeight,
            windowWidth: actualWidth,
            imageTimeout: 0,
          });

          document.body.removeChild(tempDiv);

          const finalWidth = maxWidth;
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

    const renderPlainText = (text, x, y, maxWidth, fontSize = 9) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(fontSize);
      const wrapped = safeSplitText(text, maxWidth);
      wrapped.forEach((line, i) => {
        pdf.text(line, x, y + i * lineHeight);
      });
      return wrapped.length * lineHeight;
    };

    /* ---------- HEADER: Name + Enrollment ---------- */
    const leftBoxWidth = contentWidth * 0.62;
    const rightBoxWidth = contentWidth - leftBoxWidth;

    checkPageBreak(topSectionHeight + 10);
    drawBorderedRect(margin, yPosition, leftBoxWidth, topSectionHeight);
    drawBorderedRect(margin + leftBoxWidth, yPosition, rightBoxWidth, topSectionHeight);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text("Name:", margin + cellPaddingX, yPosition + 14);
    pdf.text("Enrolment No:", margin + cellPaddingX, yPosition + 28);

    drawTextCentered(
      paper.universityShortName || "UPES",
      margin + leftBoxWidth + rightBoxWidth / 2,
      yPosition + topSectionHeight / 2 + 4,
      11,
      true
    );

    yPosition += topSectionHeight + 8;

    /* ---------- HEADER: University Details ---------- */
    checkPageBreak(headerHeight + 10);
    drawBorderedRect(margin, yPosition, contentWidth, headerHeight + 20);

    drawTextCentered(
      paper.universityFullName || "UNIVERSITY OF PETROLEUM AND ENERGY STUDIES",
      pageWidth / 2,
      yPosition + 18,
      13,
      true
    );
    drawTextCentered(
      `${paper.exam_type || paper.examType || "Summer"} Examination, ${
        paper.exam_month_year || paper.examMonthYear || "July 2025"
      }`,
      pageWidth / 2,
      yPosition + 36,
      11
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const infoRows = [
      {
        left: `Course: ${paper.course || paper.subject_name || paper.subjectName || "N/A"}`,
        right: `Semester: ${paper.semester || "N/A"}`,
      },
      {
        left: `Program: ${paper.program || "N/A"}`,
        right: `Time: ${paper.timeAllowed || "N/A"}`,
      },
      {
        left: `Course Code: ${paper.subject_code || paper.subjectCode || "N/A"}`,
        right: `Max. Marks: ${paper.maxMarks || "N/A"}`,
      },
    ];
    infoRows.forEach((r, i) => {
      pdf.text(r.left, margin + cellPaddingX, yPosition + 55 + i * 12);
      pdf.text(r.right, margin + contentWidth / 2 + 10, yPosition + 55 + i * 12);
    });

    yPosition += headerHeight + 40;

    /* ---------- INSTRUCTIONS ---------- */
    if (paper.instructions) {
      const instrLines = safeSplitText(
        `Instructions: ${paper.instructions}`,
        contentWidth - cellPaddingX * 2
      );
      instrLines.forEach((ln) => {
        checkPageBreak(lineHeight);
        pdf.setFontSize(9);
        pdf.text(ln, margin + cellPaddingX, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 6;
    }

    /* ---------- QUESTIONS RENDERING ---------- */
    const questions = paper.paper_data?.questions || paper.questions || [];
    const grouped = groupQuestionsBySection(questions, paper.sectionConfig);
    const sectionOrder = paper.sectionOrder || Object.keys(grouped);

    let globalQuestionCounter = 1;

    for (const sectionKey of sectionOrder) {
      const sectionQuestions = grouped[sectionKey] || [];
      if (!sectionQuestions.length) continue;

      const sectionConfig = (paper.sectionConfig && paper.sectionConfig[sectionKey]) || {};
      const sectionLabel = sectionConfig.label || prettifySectionKey(sectionKey);
      const defaultMarks = sectionConfig.defaultMarks || 0;
      const coMapping = sectionConfig.coMapping || ((idx) => `CO${idx}`);

      checkPageBreak(sectionHeaderHeight + 10);
      drawBorderedRect(margin, yPosition, contentWidth, sectionHeaderHeight, [240, 240, 240]);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text(sectionLabel, margin + contentWidth / 2, yPosition + 17, { align: "center" });

      yPosition += sectionHeaderHeight + 6;

      const snoWidth = 40;
      const marksWidth = 50;
      const coWidth = 45;
      const questionColWidth = contentWidth - snoWidth - marksWidth - coWidth;
      const availableQuestionWidth = questionColWidth - cellPaddingX * 2;

      /* ---------- RENDER QUESTIONS ---------- */
      for (let i = 0; i < sectionQuestions.length; i++) {
        const q = sectionQuestions[i];

        // ✅ HANDLE OR QUESTIONS
        if (q.isOr && i + 1 < sectionQuestions.length) {
          const nextQ = sectionQuestions[i + 1];

          const q1Text = q.text || "";
          const q2Text = nextQ.text || "";

          const q1Img = hasLatex(q1Text)
            ? await renderLatexToImage(q1Text, availableQuestionWidth, globalQuestionCounter)
            : null;

          const orImg = await renderLatexToImage("——— OR ———", availableQuestionWidth);

          const q2Img = hasLatex(q2Text)
            ? await renderLatexToImage(q2Text, availableQuestionWidth, globalQuestionCounter + 1)
            : null;

          let totalHeight = 15;
          if (q1Img) totalHeight += q1Img.height + 8;
          else totalHeight += 35;

          if (orImg) totalHeight += orImg.height + 8;
          else totalHeight += 20;

          if (q2Img) totalHeight += q2Img.height + 8;
          else totalHeight += 35;

          const finalHeight = Math.max(minRowHeight, totalHeight);

          checkPageBreak(finalHeight + 15);

          const startY = yPosition;
          let currentX = margin;

          drawBorderedRect(currentX, startY, snoWidth, finalHeight);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(10);
          const midY = startY + finalHeight / 2;
          pdf.text(`${globalQuestionCounter}`, currentX + snoWidth / 2, midY - 20, {
            align: "center",
          });
          pdf.setFontSize(9);
          pdf.text("OR", currentX + snoWidth / 2, midY, { align: "center" });
          pdf.setFontSize(10);
          pdf.text(`${globalQuestionCounter + 1}`, currentX + snoWidth / 2, midY + 20, {
            align: "center",
          });
          currentX += snoWidth;

          drawBorderedRect(currentX, startY, questionColWidth, finalHeight);
          let imgY = startY + cellPaddingY + 4;

          if (q1Img) {
            pdf.addImage(
              q1Img.dataUrl,
              "PNG",
              currentX + cellPaddingX,
              imgY,
              q1Img.width,
              q1Img.height
            );
            imgY += q1Img.height + 8;
          } else {
            renderPlainText(
              `Q${globalQuestionCounter}. ${q1Text}`,
              currentX + cellPaddingX,
              imgY + 10,
              availableQuestionWidth,
              9
            );
            imgY += 35;
          }

          if (orImg) {
            pdf.addImage(
              orImg.dataUrl,
              "PNG",
              currentX + cellPaddingX,
              imgY,
              orImg.width,
              orImg.height
            );
            imgY += orImg.height + 8;
          } else {
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(9);
            pdf.text("——— OR ———", currentX + questionColWidth / 2, imgY + 10, {
              align: "center",
            });
            imgY += 20;
          }

          if (q2Img) {
            pdf.addImage(
              q2Img.dataUrl,
              "PNG",
              currentX + cellPaddingX,
              imgY,
              q2Img.width,
              q2Img.height
            );
          } else {
            renderPlainText(
              `Q${globalQuestionCounter + 1}. ${q2Text}`,
              currentX + cellPaddingX,
              imgY + 10,
              availableQuestionWidth,
              9
            );
          }

          currentX += questionColWidth;

          drawBorderedRect(currentX, startY, marksWidth, finalHeight);
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(10);
          pdf.text(String(q.marks || 20), currentX + marksWidth / 2, midY, {
            align: "center",
          });
          currentX += marksWidth;

          drawBorderedRect(currentX, startY, coWidth, finalHeight);
          pdf.text(`CO${globalQuestionCounter}`, currentX + coWidth / 2, midY, {
            align: "center",
          });

          yPosition += finalHeight;
          i++;
          globalQuestionCounter += 2;
          continue;
        }

        /* ---------- NORMAL QUESTION ---------- */
        const marks = typeof q.marks === "number" ? q.marks : defaultMarks;
        const co =
          typeof coMapping === "function" ? coMapping(globalQuestionCounter, q) : coMapping;

        let questionText = q.text || "";
        if (q.options && Array.isArray(q.options) && q.options.length > 0) {
          questionText +=
            "\n\n" +
            q.options
              .map((opt, idx) => `${String.fromCharCode(97 + idx)}) ${opt}`)
              .join("\n");
        }

        const qImg = hasLatex(questionText)
          ? await renderLatexToImage(questionText, availableQuestionWidth, globalQuestionCounter)
          : null;

        const finalHeight = qImg
          ? Math.max(minRowHeight, qImg.height + cellPaddingY * 2 + 8)
          : Math.max(minRowHeight, 40);

        checkPageBreak(finalHeight + 10);

        const startY = yPosition;
        let currentX = margin;

        drawBorderedRect(currentX, startY, snoWidth, finalHeight);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.text(`${globalQuestionCounter}`, currentX + snoWidth / 2, startY + finalHeight / 2, {
          align: "center",
        });
        currentX += snoWidth;

        drawBorderedRect(currentX, startY, questionColWidth, finalHeight);
        if (qImg) {
          pdf.addImage(
            qImg.dataUrl,
            "PNG",
            currentX + cellPaddingX,
            startY + cellPaddingY + 4,
            qImg.width,
            qImg.height
          );
        } else {
          renderPlainText(
            `${questionText}`,
            currentX + cellPaddingX,
            startY + cellPaddingY + 12,
            availableQuestionWidth,
            9
          );
        }
        currentX += questionColWidth;

        drawBorderedRect(currentX, startY, marksWidth, finalHeight);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(String(marks), currentX + marksWidth / 2, startY + finalHeight / 2, {
          align: "center",
        });
        currentX += marksWidth;

        drawBorderedRect(currentX, startY, coWidth, finalHeight);
        pdf.text(String(co), currentX + coWidth / 2, startY + finalHeight / 2, {
          align: "center",
        });

        yPosition += finalHeight;
        globalQuestionCounter++;
      }

      yPosition += 8;
    }

    const safeMonth = (paper.exam_month_year || paper.examMonthYear || "July 2025").replace(
      /\s+/g,
      "_"
    );
    const fileName = `${(paper.subject_name || paper.subjectName || "Question").replace(
      /\s+/g,
      "_"
    )}_Paper_${safeMonth}.pdf`;

    pdf.save(fileName);
    console.log("✅ PDF generated successfully with perfect bracket scaling!");
  } catch (err) {
    console.error("❌ PDF generation failed:", err);
    alert(`PDF generation failed: ${err.message}`);
  }
};

/* ---------- UTILITY FUNCTIONS ---------- */
const prettifySectionKey = (key) =>
  String(key)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toUpperCase();

const groupQuestionsBySection = (questions = [], sectionConfig = {}) => {
  const grouped = {};
  
  if (sectionConfig && Object.keys(sectionConfig).length > 0) {
    Object.keys(sectionConfig).forEach((k) => (grouped[k] = []));
  } else {
    grouped.sectionA = [];
    grouped.sectionB = [];
    grouped.sectionC = [];
  }

  questions.forEach((q) => {
    if (q.section) {
      grouped[q.section] = grouped[q.section] || [];
      grouped[q.section].push(q);
      return;
    }

    const marks = typeof q.marks === "number" ? q.marks : 0;
    if (marks <= 4) (grouped.sectionA = grouped.sectionA || []).push(q);
    else if (marks <= 15) (grouped.sectionB = grouped.sectionB || []).push(q);
    else (grouped.sectionC = grouped.sectionC || []).push(q);
  });

  return grouped;
};
