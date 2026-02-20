
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import uvicorn
import os
import shutil
import uuid
from dotenv import load_dotenv
from processor import process_pdf_submission
from booklet_generator import generate_batch_of_booklets

# Load env vars
load_dotenv(dotenv_path="../.env.local")
load_dotenv() 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProcessRequest(BaseModel):
    submissionId: str
    paperId: str = None
    extractionMode: str = "digital"

class BookletRequest(BaseModel):
    university_name: str
    exam_id: str
    subject: str
    date: str
    num_students: int
    main_pages: int = 6
    extra_pages: int = 2
    objective_questions: int = 0
    objective_labels: str = ""

def cleanup_files(paths):
    for path in paths:
        try:
            if os.path.isdir(path):
                shutil.rmtree(path)
            elif os.path.isfile(path):
                os.remove(path)
        except Exception as e:
            print(f"Error cleaning up {path}: {e}")

@app.get("/")
def health_check():
    return {"status": "ok", "service": "DASES Python Backend"}

@app.post("/process_pdf")
async def process_pdf(request: ProcessRequest):
    print(f"Received request for submission: {request.submissionId}, mode: {request.extractionMode}")
    try:
        result = await process_pdf_submission(
            submission_id=request.submissionId,
            extraction_mode=request.extractionMode
        )
        return {"success": True, "data": result}
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/generate_booklet")
async def generate_booklet(req: BookletRequest, background_tasks: BackgroundTasks):
    temp_id = uuid.uuid4().hex
    temp_dir = f"temp_booklets_{temp_id}"
    
    try:
        print(f"Generating {req.num_students} booklets for {req.exam_id}...")
        files = generate_batch_of_booklets(
            temp_dir, 
            req.university_name, 
            req.exam_id, 
            req.subject, 
            req.date, 
            req.num_students, 
            req.main_pages, 
            req.extra_pages,
            lines=50,
            objective_questions=req.objective_questions,
            objective_labels=req.objective_labels
        )
        
        # Zip
        zip_base_name = f"booklets_{req.exam_id}_{temp_id}"
        shutil.make_archive(zip_base_name, 'zip', temp_dir)
        zip_path = f"{zip_base_name}.zip"
        
        # Add cleanup tasks
        background_tasks.add_task(cleanup_files, [temp_dir, zip_path])
        
        return FileResponse(
            zip_path, 
            filename=f"booklets_{req.exam_id}.zip", 
            media_type="application/zip"
        )
        
    except Exception as e:
        print(f"Booklet Generation Error: {e}")
        # cleanup if error
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
