from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import tempfile, subprocess, os

app = FastAPI()

# ✅ Allow CORS so your Vercel app can call this API freely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-booklets")
async def generate_booklets(req: Request):
    try:
        body = await req.json()
        tmpdir = tempfile.mkdtemp(prefix="booklets-")

        # ✅ Handle all parameters with safe defaults
        university_name = body.get("university_name", "University")
        exam_id = body.get("exam_id", "EXAM-2025")
        subject = body.get("subject", "Unknown Subject")
        date = body.get("date", "2025-10-26")
        num_students = str(body.get("num_students", 1))
        main_pages = str(body.get("main_pages", 6))
        extra_pages = str(body.get("extra_pages", 2))
        prefix = body.get("prefix", "booklet")
        lines_per_page = str(body.get("lines_per_page", 50))
        page_size = body.get("page_size", "A4")
        margin_mm = str(body.get("margin_mm", 20))
        qr_error_correction = body.get("qr_error_correction", "M")

        # ✅ Build Python command dynamically
        args = [
            "python3", "generate_booklets.py",
            "--university-name", university_name,
            "--exam-id", exam_id,
            "--subject", subject,
            "--date", date,
            "--num-students", num_students,
            "--main-pages", main_pages,
            "--extra-pages", extra_pages,
            "--lines-per-page", lines_per_page,
            "--page-size", page_size,
            "--margin-mm", margin_mm,
            "--qr-error-correction", qr_error_correction,
            "--output-dir", tmpdir,
            "--prefix", prefix,
            "--manifest"
        ]

        # ✅ Run the Python script
        subprocess.run(args, check=True)

        # ✅ Zip the output directory
        zip_path = os.path.join(tmpdir, f"{exam_id}.zip")
        subprocess.run(["zip", "-r", zip_path, tmpdir])

        return FileResponse(zip_path, filename=f"answer_sheets_{exam_id}.zip")

    except subprocess.CalledProcessError as e:
        raise HTTPException(status_code=500, detail=f"Python script failed: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))