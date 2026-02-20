
import os
import fitz  # PyMuPDF
from supabase import create_client, Client
import base64
import io
import asyncio
from dotenv import load_dotenv

# Load env vars
load_dotenv(dotenv_path="../.env.local")
load_dotenv()

# Initialize Supabase
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

async def process_pdf_submission(submission_id: str, extraction_mode: str):
    print(f"Processing PDF for {submission_id} (Mode: {extraction_mode})")
    
    # 1. Get submission details
    response = supabase.table("submissions").select("*").eq("id", submission_id).single().execute()
    submission = response.data
    file_path = submission["file_path"]

    if not file_path:
        raise Exception("No file_path found for submission")

    # 2. Download PDF
    print(f"Downloading {file_path}...")
    pdf_bytes = supabase.storage.from_("submissions").download(file_path)
    
    # 3. Load PDF
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    num_pages = len(doc)
    print(f"PDF loaded: {num_pages} pages")

    processed_pages = []
    
    # 4. Process Loop
    for i in range(num_pages):
        page_num = i + 1
        page = doc.load_page(i)
        
        # A. Render Full Image (High Quality)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom
        img_data = pix.tobytes("jpeg")
        
        # Upload Full Image to Supabase (Raw location)
        # We don't know the Q# yet, so put it in a temp/raw folder or unassigned
        # Better: Put it in 'unassigned' initially. Or a 'raw' folder.
        # User JS logic used "unassigned" if Q# unknown.
        storage_path = f"{submission_id}/unassigned/page_{page_num}.jpeg"
        
        supabase.storage.from_("submissions").upload(
            path=storage_path,
            file=img_data,
            file_options={"content-type": "image/jpeg", "upsert": "true"}
        )
        
        # B. Get Header Cut (for Detection)
        rect = page.rect
        header_rect = fitz.Rect(rect.x0, rect.y0, rect.x1, rect.height * 0.25)
        header_pix = page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), clip=header_rect)
        header_b64 = base64.b64encode(header_pix.tobytes("jpeg")).decode("utf-8")
        
        # C. Get Digital Text (Reliable in Python)
        digital_text = page.get_text()
        
        processed_pages.append({
            "page": page_num,
            "uploaded_path": storage_path,
            "header_base64": header_b64,
            "digital_text": digital_text
        })

    print(f"Processed {len(processed_pages)} pages.")
    return processed_pages
