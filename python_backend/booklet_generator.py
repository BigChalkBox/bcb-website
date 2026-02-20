
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

# Layout constants
PAGE_SIZES = {'A4': A4, 'letter': letter}
DEFAULT_PAGE_SIZE = 'A4'
MARGIN_DEFAULT = 20 * mm
LINE_MARGIN_LEFT = 25 * mm
LINE_MARGIN_RIGHT = 15 * mm
QR_SIZE = 22 * mm
HEADER_RULE = 0.4
LINE_GAP = 19
LINE_COUNT_DEFAULT = 50
FONT = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
QR_BORDER = 4
LIGHT_GRAY = colors.Color(0.7, 0.7, 0.7)

ERROR_LEVELS = {
    'L': ERROR_CORRECT_L,
    'M': ERROR_CORRECT_M,
    'Q': ERROR_CORRECT_Q,
    'H': ERROR_CORRECT_H
}

# Reduce logging noise
logging.getLogger().setLevel(logging.INFO)

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
        c.setLineWidth(1)
        c.setStrokeColor(LIGHT_GRAY)
        c.rect(x, y, size_pt, size_pt)
        c.drawImage(ImageReader(qr_img), x, y, width=size_pt, height=size_pt, preserveAspectRatio=True, mask='auto')
        c.setFillColor(colors.black)
    except Exception as e:
        print(f"Error drawing QR: {e}")
        raise

def draw_header_rule(c: canvas.Canvas, y: float, left: float, right: float):
    c.setLineWidth(HEADER_RULE)
    c.setStrokeColor(LIGHT_GRAY)
    c.line(left, y, right, y)

def draw_label_box(c, label, x, y, w, h, font=FONT_BOLD, fs=11, guide_text=None):
    c.setFont(font, fs)
    c.setFillColor(colors.Color(0.2, 0.2, 0.8))
    c.drawString(x, y + h + 4, label)
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
    c.setFont(FONT_BOLD, 22)
    c.drawCentredString(page_w / 2, top - 20, university_name.upper())
    c.setFont(FONT_BOLD, 16)
    c.drawCentredString(page_w / 2, top - 45, "SAMPLE EXAMINATION ANSWER BOOKLET")
    c.setFont(FONT, 12)
    c.drawCentredString(page_w / 2, top - 65, "(Candidate Details Page – binds identity to the entire booklet)")

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
        c.rect(x_value, y, value_w, row_h)
        if prefill:
            c.setFont(FONT, 12)
            c.drawString(x_value + 6, y + 4, prefill)
            c.setFont(FONT_BOLD, 12)
        y -= (row_h + gap)

    qr_x = right - QR_SIZE + 30
    qr_y = top - QR_SIZE - 50
    payload = {"exam_id": exam_id, "booklet_id": booklet_id, "page": "1"}
    draw_qr(c, payload, qr_x, qr_y, QR_SIZE, error_level)

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

    y -= 30
    c.setFont(FONT_BOLD, 11)
    c.drawString(left, y, "Total pages used (incl. extras):")
    c.rect(left + 180, y - 4, 25, 20)
    y -= 100
    c.drawString(left+290, y, "Candidate Signature:")
    c.drawString(left+290, y-20, "Date:")

    c.drawString(left, y, "Invigilator Signature:")
    c.drawString(left, y-20, "Date:")

    c.setFont(FONT, 9)
    c.setFillColor(LIGHT_GRAY)
    c.drawString(left, bottom + 1,
                 f"Note: Page 1 binds candidate identity to the QR. Booklet ID: {booklet_id}")
    c.setFillColor(colors.black)

def draw_answer_page(c, exam_id, booklet_id, page_label="2", lines=LINE_COUNT_DEFAULT, page_w=None, page_h=None, margin=MARGIN_DEFAULT, error_level=ERROR_CORRECT_M):
    if page_w is None or page_h is None:
        raise ValueError("page_w and page_h must be provided")
    left, bottom, right, top = content_frame(page_w, page_h, margin)
    c.setFont(FONT_BOLD, 11)
    c.drawString(left, top - 8, f"Exam ID: {exam_id}")
    box_w, box_h = 50, 24
    draw_label_box(c, "Q. No", left, top - 8 - box_h - 20, box_w, box_h, guide_text="")
    c.setFont(FONT_BOLD, 11)
    c.drawRightString(right - QR_SIZE - 8, top - 8, f"Page: {page_label}")
    qr_x = right - QR_SIZE
    qr_y = top - QR_SIZE - 6
    payload = {"exam_id": exam_id, "booklet_id": booklet_id, "page": str(page_label)}
    draw_qr(c, payload, qr_x, qr_y, QR_SIZE, error_level)
    draw_header_rule(c, top - QR_SIZE - 16, left, right)
    y = top - QR_SIZE - 48
    c.setLineWidth(0.4)
    c.setStrokeColor(LIGHT_GRAY)
    line_count = 0
    available_height = y - bottom
    max_lines = int(available_height / LINE_GAP)
    while line_count < min(lines, max_lines):
        c.line(LINE_MARGIN_LEFT, y, page_w - LINE_MARGIN_RIGHT, y)
        y -= LINE_GAP
        line_count += 1
    c.setStrokeColor(colors.black)
    c.setFont(FONT, 9)
    c.setFillColor(LIGHT_GRAY)
    c.drawString(left, bottom + 1, f"Booklet ID: {booklet_id}")
    c.setFillColor(colors.black)

def draw_extra_sheet(c, exam_id, booklet_id, x_index="X1", lines=LINE_COUNT_DEFAULT, page_w=None, page_h=None, margin=MARGIN_DEFAULT, error_level=ERROR_CORRECT_M):
    left, bottom, right, top = content_frame(page_w, page_h, margin)
    c.setFont(FONT_BOLD, 14)
    c.drawString(left, top - 8, "EXTRA SHEET")
    box_w, box_h = 50, 24
    draw_label_box(c, "Page", left+350, top - 40 - box_h - 2, box_w, box_h, guide_text="")
    draw_label_box(c, "Q. No", left, top - 40 - box_h - 2, box_w, box_h, guide_text="")
    qr_x = right - QR_SIZE
    qr_y = top - QR_SIZE - 6
    payload = {"exam_id": exam_id, "page": str(x_index)}
    draw_qr(c, payload, qr_x, qr_y, QR_SIZE, error_level)
    draw_header_rule(c, top - QR_SIZE - 16, left, right)
    y = top - QR_SIZE - 48
    c.setLineWidth(0.4)
    c.setStrokeColor(LIGHT_GRAY)
    line_count = 0
    available_height = y - bottom
    max_lines = int(available_height / LINE_GAP)
    while line_count < min(lines, max_lines):
        c.line(LINE_MARGIN_LEFT, y, page_w - LINE_MARGIN_RIGHT, y)
        y -= LINE_GAP
        line_count += 1
    c.setStrokeColor(colors.black)

def draw_objective_answers_page(c, exam_id, booklet_id, question_labels=None, start_q=1, end_q=15, page_w=None, page_h=None, margin=MARGIN_DEFAULT, error_level=ERROR_CORRECT_M):
    left, bottom, right, top = content_frame(page_w, page_h, margin)
    if question_labels:
        labels = question_labels
    else:
        labels = [str(i) for i in range(start_q, end_q + 1)]
    
    c.setFont(FONT_BOLD, 18)
    c.drawCentredString(page_w / 2, top - 20, "OBJECTIVE ANSWERS")
    c.setFont(FONT, 10)
    c.drawCentredString(page_w / 2, top - 38, "Write your answers clearly on the lines below")
    
    qr_x = right - QR_SIZE
    qr_y = top - QR_SIZE - 10
    if question_labels:
        page_indicator = f"OBJ-{labels[0]}-{labels[-1]}" if len(labels) > 1 else f"OBJ-{labels[0]}"
    else:
        page_indicator = f"OBJ{start_q}-{end_q}"
    payload = {"exam_id": exam_id, "booklet_id": booklet_id, "page": page_indicator}
    draw_qr(c, payload, qr_x, qr_y, QR_SIZE, error_level)
    
    c.setFont(FONT_BOLD, 11)
    c.drawString(left, top - 8, f"Exam ID: {exam_id}")
    draw_header_rule(c, top - QR_SIZE - 20, left, right)
    
    max_per_page = 12
    grid_top = top - QR_SIZE - 80
    grid_left = left + 20
    available_height = grid_top - bottom - 30
    row_height = available_height / max_per_page
    
    c.setFont(FONT_BOLD, 12)
    for i, label in enumerate(labels):
        y = grid_top - (i * row_height)
        c.setFillColor(colors.Color(0.1, 0.4, 0.1))
        display_label = f"Q{label}:" if not label[0].isalpha() else f"Q{label}:"
        c.drawString(grid_left, y + 6, display_label)
        c.setFillColor(colors.black)
        line_x = grid_left + 55
        c.setStrokeColor(LIGHT_GRAY)
        c.setLineWidth(1)
        c.line(line_x, y, right - 10, y)
        c.setStrokeColor(colors.black)

def generate_booklet_pdf(args_tuple):
    path, university_name, exam_id, subject, date_str, main_pages, extra_pages, lines, page_size, margin, error_level, num_objective_questions, objective_labels = args_tuple
    page_w, page_h = PAGE_SIZES[page_size]
    try:
        booklet_id = uuid.uuid4().hex
        c = canvas.Canvas(path, pagesize=(page_w, page_h))
        draw_candidate_details_page(c, university_name, exam_id, subject, date_str, booklet_id, page_w, page_h, margin, error_level)
        c.showPage()
        
        max_per_page = 12
        if objective_labels:
            labels = objective_labels
            num_obj_pages = (len(labels) + max_per_page - 1) // max_per_page
            for page_idx in range(num_obj_pages):
                start_idx = page_idx * max_per_page
                end_idx = min((page_idx + 1) * max_per_page, len(labels))
                page_labels = labels[start_idx:end_idx]
                draw_objective_answers_page(c, exam_id, booklet_id, question_labels=page_labels, page_w=page_w, page_h=page_h, margin=margin, error_level=error_level)
                c.showPage()
        elif num_objective_questions > 0:
            num_obj_pages = (num_objective_questions + max_per_page - 1) // max_per_page
            for page_idx in range(num_obj_pages):
                start_q = page_idx * max_per_page + 1
                end_q = min((page_idx + 1) * max_per_page, num_objective_questions)
                draw_objective_answers_page(c, exam_id, booklet_id, start_q=start_q, end_q=end_q, page_w=page_w, page_h=page_h, margin=margin, error_level=error_level)
                c.showPage()
        
        for p in range(2, 2 + main_pages):
            draw_answer_page(c, exam_id, booklet_id, page_label=str(p), lines=lines, page_w=page_w, page_h=page_h, margin=margin, error_level=error_level)
            c.showPage()
        for i in range(1, extra_pages + 1):
            draw_extra_sheet(c, exam_id, booklet_id, x_index=f"X{i}", lines=lines, page_w=page_w, page_h=page_h, margin=margin, error_level=error_level)
            c.showPage()
        c.save()
        return path, booklet_id
    except Exception as e:
        print(f"Error generating {path}: {e}")
        return None, None

def generate_batch_of_booklets(output_dir, university_name, exam_id, subject, date_str, num_students, main_pages=6, extra_pages=2, lines=50, objective_questions=0, objective_labels=""):
    os.makedirs(output_dir, exist_ok=True)
    
    tasks = []
    margin = 20 * mm
    error_level = ERROR_CORRECT_M
    parsed_objective_labels = [l.strip() for l in objective_labels.split(",") if l.strip()] if objective_labels else []

    generated_files = []
    
    for i in range(1, num_students + 1):
        filename = f"booklet_{i:04d}_{uuid.uuid4().hex[:6]}.pdf"
        out_path = os.path.join(output_dir, filename)
        
        args = (out_path, university_name, exam_id, subject, date_str, main_pages, extra_pages, lines, "A4", margin, error_level, objective_questions, parsed_objective_labels)
        path, bid = generate_booklet_pdf(args)
        if path:
            generated_files.append(path)
            
    return generated_files


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Exam Booklet PDF Generator")

    parser.add_argument("--output_dir", required=True)
    parser.add_argument("--university_name", required=True)
    parser.add_argument("--exam_id", required=True)
    parser.add_argument("--subject", required=True)
    parser.add_argument("--date", required=True)
    parser.add_argument("--students", type=int, required=True)

    parser.add_argument("--main_pages", type=int, default=6)
    parser.add_argument("--extra_pages", type=int, default=2)
    parser.add_argument("--lines", type=int, default=50)

    parser.add_argument("--objective_questions", type=int, default=0)
    parser.add_argument("--objective_labels", default="")

    args = parser.parse_args()

    generate_batch_of_booklets(
        output_dir=args.output_dir,
        university_name=args.university_name,
        exam_id=args.exam_id,
        subject=args.subject,
        date_str=args.date,
        num_students=args.students,
        main_pages=args.main_pages,
        extra_pages=args.extra_pages,
        lines=args.lines,
        objective_questions=args.objective_questions,
        objective_labels=args.objective_labels
    )

    print("✅ Booklets generated in:", args.output_dir)
