#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate print-ready answer booklets (PDF) with neutral QR codes.
Enhanced for better visual design: improved spacing, hierarchy, and subtle styling.
Dependencies: pip install reportlab qrcode pillow
"""
import argparse
import os
import uuid
import json
import csv
import logging
import concurrent.futures
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
import qrcode
from qrcode.constants import ERROR_CORRECT_L, ERROR_CORRECT_M, ERROR_CORRECT_Q, ERROR_CORRECT_H
from PIL import Image

# Layout constants (enhanced for visuals)
PAGE_SIZES = {'A4': A4, 'letter': letter}
DEFAULT_PAGE_SIZE = 'A4'
MARGIN_DEFAULT = 20 * mm  # Increased for more white space
QR_SIZE = 22 * mm  # Smaller as per your change
HEADER_RULE = 0.4  # Thinner for subtlety
LINE_GAP = 19  # Wider for writing comfort
LINE_COUNT_DEFAULT = 50  # Adjusted, but capped dynamically to fit page
FONT = "Helvetica"  # Can change to "Arial" if preferred
FONT_BOLD = "Helvetica-Bold"
QR_BORDER = 4
LIGHT_GRAY = colors.Color(0.7, 0.7, 0.7)  # For subtle elements

# QR error correction mapping
ERROR_LEVELS = {
    'L': ERROR_CORRECT_L,
    'M': ERROR_CORRECT_M,
    'Q': ERROR_CORRECT_Q,
    'H': ERROR_CORRECT_H
}

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def content_frame(page_w, page_h, margin):
    left = margin
    right = page_w - margin
    top = page_h - margin
    bottom = margin
    return left, bottom, right, top

def draw_qr(c: canvas.Canvas, payload: dict, x: float, y: float, size_pt: float, error_level):
    try:
        data = json.dumps(payload, separators=(",", ":"))
        qr = qrcode.QRCode(version=1, error_correction=error_level, box_size=10, border=QR_BORDER)
        qr.add_data(data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white").convert('RGB')
        qr_img = qr_img.resize((int(size_pt), int(size_pt)), Image.NEAREST)
        c.setLineWidth(1)  # Thinner border
        c.setStrokeColor(LIGHT_GRAY)  # Subtle gray
        c.rect(x, y, size_pt, size_pt)
        c.drawImage(ImageReader(qr_img), x, y, width=size_pt, height=size_pt, preserveAspectRatio=True, mask='auto')
        c.setFont(FONT, 8)
        c.setFillColor(LIGHT_GRAY)
        # Optional: c.drawCentredString(x + size_pt / 2, y - 12, "Do not write in this area")
        c.setFillColor(colors.black)
    except Exception as e:
        logging.error(f"Error drawing QR: {e}")
        raise

def draw_header_rule(c: canvas.Canvas, y: float, left: float, right: float):
    c.setLineWidth(HEADER_RULE)
    c.setStrokeColor(LIGHT_GRAY)  # Subtle rule
    c.line(left, y, right, y)

def draw_label_box(c, label, x, y, w, h, font=FONT_BOLD, fs=11, guide_text=None):
    c.setFont(font, fs)
    c.setFillColor(colors.Color(0.2, 0.2, 0.8))  # Soft blue for labels
    c.drawString(x, y + h + 4, label)  # More space above
    c.setFillColor(colors.black)
    c.setLineWidth(0.5)
    c.setStrokeColor(LIGHT_GRAY)
    c.rect(x, y, w, h)
    if guide_text:
        c.setFont(FONT, 9)
        c.setFillColor(LIGHT_GRAY)
        c.drawString(x + 4, y + 4, guide_text)
        c.setFillColor(colors.black)

def draw_candidate_details_page(c, university_name, exam_id, subject, date_str,
                                booklet_id, page_w, page_h, margin, error_level):
    left, bottom, right, top = content_frame(page_w, page_h, margin)

    # ===== HEADER =====
    c.setFont(FONT_BOLD, 22)
    c.drawCentredString(page_w / 2, top - 20, university_name.upper())
    c.setFont(FONT_BOLD, 16)
    c.drawCentredString(page_w / 2, top - 45, "SAMPLE EXAMINATION ANSWER BOOKLET")
    c.setFont(FONT, 12)
    c.drawCentredString(page_w / 2, top - 65, "(Candidate Details Page – binds identity to the entire booklet)")

    # ===== DETAILS SECTION =====
    row_h = 20
    gap = 14
    y = top - 110

    fields = [
        ("Exam ID", exam_id),
        ("Subject", subject),
        ("Date", date_str),
        ("SAP ID", ""),
        ("Enrol No", ""),
        ("Course / Programme", ""),
        ("Year / Semester", ""),
        ("Batch", ""),
    ]

    label_w = 85 * mm
    value_w = (right - left) - label_w - QR_SIZE - 12
    x_label = left
    x_value = left + label_w

    c.setFont(FONT_BOLD, 12)
    for label, prefill in fields:
        c.drawString(x_label, y + 4, f"{label}:")
        c.setLineWidth(0.5)
        c.rect(x_value, y, value_w, row_h)  # box for student input
        if prefill:
            c.setFont(FONT, 12)
            c.drawString(x_value + 6, y + 4, prefill)
            c.setFont(FONT_BOLD, 12)
        y -= (row_h + gap)

    # ===== QR CODE =====
    qr_x = right - QR_SIZE + 30
    qr_y = top - QR_SIZE - 50
    payload = {"exam_id": exam_id, "booklet_id": booklet_id, "page": "1"}
    draw_qr(c, payload, qr_x, qr_y, QR_SIZE, error_level)

    # ===== INSTRUCTIONS =====
    y -= 25
    c.setFont(FONT_BOLD, 12)
    c.drawString(left, y, "Instructions:")
    y -= 20
    c.setFont(FONT, 10)
    bullets = [
        "Fill in all details clearly before starting.",
        "Write the Question Number in the boxed area on each page.",
        "Do not write in or over the QR code area.",
        "Use extra sheets only if required; attach them at the end.",
        "On your last used page, fill total pages and sign.",
    ]
    for b in bullets:
        c.setFillColor(LIGHT_GRAY)
        c.circle(left + 4, y + 4, 2, stroke=1, fill=1)
        c.setFillColor(colors.black)
        c.drawString(left + 12, y, b)
        y -= 18

    # ===== SIGNATURES & PAGE COUNT =====
    y -= 30
    c.setFont(FONT_BOLD, 11)
    c.drawString(left, y, "Total pages used (incl. extras):")
    c.rect(left + 180, y - 4, 25, 20)
    y -= 100
    c.drawString(left+290, y, "Candidate Signature:")
    c.drawString(left+290, y-20, "Date:")
    # c.line(left + 520, y - 4, 120, 20)

    c.drawString(left, y, "Invigilator Signature:")
    c.drawString(left, y-20, "Date:")
    # c.line(left, y, 150, 20)

    # ===== FOOTER =====
    c.setFont(FONT, 9)
    c.setFillColor(LIGHT_GRAY)
    c.drawString(left, bottom + 1,
                 f"Note: Page 1 binds candidate identity to the QR. Booklet ID: {booklet_id}")
    c.setFillColor(colors.black)

def draw_answer_page(c, exam_id, booklet_id, page_label="2", lines=LINE_COUNT_DEFAULT, page_w=None, page_h=None, margin=MARGIN_DEFAULT, error_level=ERROR_CORRECT_M):
    if page_w is None or page_h is None:
        raise ValueError("page_w and page_h must be provided")
    left, bottom, right, top = content_frame(page_w, page_h, margin)
    # Header left: Exam ID, Q. No box, Page label
    c.setFont(FONT_BOLD, 11)
    c.drawString(left, top - 8, f"Exam ID: {exam_id}")
    # Q. No box
    box_w, box_h = 50, 24
    draw_label_box(c, "Q. No", left, top - 8 - box_h - 20, box_w, box_h, guide_text="")
    # Page label
    c.setFont(FONT_BOLD, 11)
    c.drawRightString(right - QR_SIZE - 8, top - 8, f"Page: {page_label}")
    # QR top-right
    qr_x = right - QR_SIZE
    qr_y = top - QR_SIZE - 6
    payload = {"exam_id": exam_id, "booklet_id": booklet_id, "page": str(page_label)}
    draw_qr(c, payload, qr_x, qr_y, QR_SIZE, error_level)
    # Header rule
    draw_header_rule(c, top - QR_SIZE - 16, left, right)
    # Answer label (commented out as per your change)
    c.setFont(FONT_BOLD, 11)
    # c.drawString(left, top - QR_SIZE - 32, "Answer")
    # Ruled lines (full width, faint gray)
    y = top - QR_SIZE - 48
    c.setLineWidth(0.4)  # Faint
    c.setStrokeColor(LIGHT_GRAY)
    line_count = 0
    available_height = y - bottom
    max_lines = int(available_height / LINE_GAP)  # Dynamic cap to prevent overflow
    while line_count < min(lines, max_lines):
        c.line(0, y, page_w, y)  # Full page width
        y -= LINE_GAP
        line_count += 1
    c.setStrokeColor(colors.black)  # Reset


    # ===== FOOTER =====
    c.setFont(FONT, 9)
    c.setFillColor(LIGHT_GRAY)
    c.drawString(left, bottom + 1,
                 f"Booklet ID: {booklet_id}")
    c.setFillColor(colors.black)

def draw_extra_sheet(c, exam_id, booklet_id, x_index="X1", lines=LINE_COUNT_DEFAULT, page_w=None, page_h=None, margin=MARGIN_DEFAULT, error_level=ERROR_CORRECT_M):
    if page_w is None or page_h is None:
        raise ValueError("page_w and page_h must be provided")
    left, bottom, right, top = content_frame(page_w, page_h, margin)
    # Header left
    c.setFont(FONT_BOLD, 14)
    c.drawString(left, top - 8, "EXTRA SHEET")
    c.setFont(FONT_BOLD, 11)
    # c.drawRightString(right - QR_SIZE - 8, top - 8, f"Page: {x_index}")

    box_w, box_h = 50, 24
    draw_label_box(c, "Page", left+350, top - 40 - box_h - 2, box_w, box_h, guide_text="")


    # Q. No box (repeat same Q.No as continued answer)
    draw_label_box(c, "Q. No", left, top - 40 - box_h - 2, box_w, box_h, guide_text="")
    # QR top-right
    qr_x = right - QR_SIZE
    qr_y = top - QR_SIZE - 6
    payload = {"exam_id": exam_id, "page": str(x_index)}
    draw_qr(c, payload, qr_x, qr_y, QR_SIZE, error_level)
    # Header rule
    draw_header_rule(c, top - QR_SIZE - 16, left, right)
    c.setFont(FONT_BOLD, 11)
    # c.drawString(left, top - QR_SIZE - 32, "Answer (continuation):")
    # Lines (faint gray, respecting margins)
    y = top - QR_SIZE - 48
    c.setLineWidth(0.4)
    c.setStrokeColor(LIGHT_GRAY)
    line_count = 0
    available_height = y - bottom
    max_lines = int(available_height / LINE_GAP)
    while line_count < min(lines, max_lines):
        c.line(0, y, page_w, y)  # Full page width
        y -= LINE_GAP
        line_count += 1
    c.setStrokeColor(colors.black)

def generate_booklet_pdf(args_tuple):
    path, university_name, exam_id, subject, date_str, main_pages, extra_pages, lines, page_size, margin, error_level = args_tuple
    page_w, page_h = PAGE_SIZES[page_size]
    try:
        booklet_id = uuid.uuid4().hex
        c = canvas.Canvas(path, pagesize=(page_w, page_h))
        # Page 1: candidate details (no student data in QR)
        draw_candidate_details_page(c, university_name, exam_id, subject, date_str, booklet_id, page_w, page_h, margin, error_level)
        c.showPage()
        # Main answer pages: 2..(main_pages+1)
        for p in range(2, 2 + main_pages):
            draw_answer_page(c, exam_id, booklet_id, page_label=str(p), lines=lines, page_w=page_w, page_h=page_h, margin=margin, error_level=error_level)
            c.showPage()
        # Extra sheets: X1..Xn
        for i in range(1, extra_pages + 1):
            draw_extra_sheet(c, exam_id, booklet_id, x_index=f"X{i}", lines=lines, page_w=page_w, page_h=page_h, margin=margin, error_level=error_level)
            c.showPage()
        c.save()
        logging.info(f"Generated {path} with booklet_id={booklet_id}")
        return path, booklet_id
    except Exception as e:
        logging.error(f"Error generating {path}: {e}")
        return None, None

def main():
    parser = argparse.ArgumentParser(description="Generate print-ready answer booklets with neutral QR codes.")
    parser.add_argument("--university-name", required=True, help="University name (printed in header)")
    parser.add_argument("--exam-id", required=True, help="Exam ID (e.g., MATH101-2025)")
    parser.add_argument("--subject", required=True, help="Subject name (printed on Page 1)")
    parser.add_argument("--date", required=True, help="Exam date (printed on Page 1)")
    parser.add_argument("--num-students", type=int, required=True, help="Number of booklets to generate")
    parser.add_argument("--main-pages", type=int, default=6, help="Number of main answer pages per booklet (after Page 1)")
    parser.add_argument("--extra-pages", type=int, default=2, help="Number of extra sheets per booklet")
    parser.add_argument("--output-dir", default="./out", help="Output directory for PDFs")
    parser.add_argument("--prefix", default="booklet", help="Filename prefix for generated PDFs")
    parser.add_argument("--lines-per-page", type=int, default=LINE_COUNT_DEFAULT, help="Override ruled lines per page")
    parser.add_argument("--page-size", choices=PAGE_SIZES.keys(), default=DEFAULT_PAGE_SIZE, help="Page size")
    parser.add_argument("--margin-mm", type=float, default=20, help="Page margin in mm")
    parser.add_argument("--qr-error-correction", choices=ERROR_LEVELS.keys(), default='M', help="QR error correction level (L/M/Q/H)")
    parser.add_argument("--parallel", action='store_true', help="Generate booklets in parallel (for large batches)")
    parser.add_argument("--manifest", action='store_true', help="Generate a CSV manifest of all booklets")
    args = parser.parse_args()

    # Input validation
    if args.num_students < 1 or args.main_pages < 1 or args.extra_pages < 0 or args.lines_per_page < 1 or args.margin_mm < 0:
        parser.error("All page/student counts must be positive integers, and margins non-negative.")
    try:
        os.makedirs(args.output_dir, exist_ok=True)
    except OSError as e:
        logging.error(f"Error creating output directory: {e}")
        return

    logging.info(f"Generating {args.num_students} booklet(s) → {args.output_dir}")
    tasks = []
    manifest_data = []
    error_level = ERROR_LEVELS[args.qr_error_correction]
    margin = args.margin_mm * mm

    for i in range(1, args.num_students + 1):
        filename = f"{args.prefix}_{i:04d}.pdf"
        out_path = os.path.join(args.output_dir, filename)
        tasks.append((out_path, args.university_name, args.exam_id, args.subject, args.date, args.main_pages, args.extra_pages, args.lines_per_page, args.page_size, margin, error_level))
        manifest_data.append([filename, args.university_name, args.exam_id, args.subject, args.date, args.main_pages, args.extra_pages])  # Booklet ID added later

    if args.parallel:
        with concurrent.futures.ThreadPoolExecutor() as executor:
            results = list(executor.map(generate_booklet_pdf, tasks))
    else:
        results = [generate_booklet_pdf(task) for task in tasks]

    # Update manifest with booklet_ids
    for idx, (path, booklet_id) in enumerate(results):
        if booklet_id:
            manifest_data[idx].append(booklet_id)
        else:
            manifest_data[idx].append("FAILED")

    # Generate manifest if requested
    if args.manifest:
        manifest_path = os.path.join(args.output_dir, "manifest.csv")
        try:
            with open(manifest_path, 'w', newline='') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerow(["Filename", "University", "Exam ID", "Subject", "Date", "Main Pages", "Extra Pages", "Booklet ID"])
                writer.writerows(manifest_data)
            logging.info(f"Manifest generated: {manifest_path}")
        except Exception as e:
            logging.error(f"Error generating manifest: {e}")

    successful = sum(1 for r in results if r[1] is not None)
    logging.info(f"Done. {successful} booklets generated successfully. {args.num_students - successful} failures.")
    print("Done. Print these PDFs as separate booklets. Page 1 will bind identity at scan-time.")

if __name__ == "__main__":
    main()
