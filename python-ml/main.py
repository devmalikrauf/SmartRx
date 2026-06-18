import os
import requests
import tempfile
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
parent_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
if os.path.exists(parent_env):
    load_dotenv(parent_env)

# Import Pydantic models
from models.prescription_model import AnalysisResponse, MedicineItem

# Import Services
from services.pdf_converter import convert_pdf_to_jpg
from services.image_enhancer import enhance_image
from services.ocr_service import extract_text_from_image
from services.gemini_service import analyze_prescription
from services.validator import (
    validate_medicine_name,
    calculate_confidence_score
)
import cv2
import numpy as np

app = FastAPI(
    title="SmartRx AI/ML Server",
    description="Python FastAPI backend for image preprocessing, blur detection, OCR, and medicine validation.",
    version="1.0.0"
)

class AnalyzeRequest(BaseModel):
    imageUrl: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "gemini_configured": bool(os.getenv("GEMINI_API_KEY"))}

@app.post("/analyze", response_model=AnalysisResponse)
async def process_prescription(payload: AnalyzeRequest):
    image_url = payload.imageUrl
    
    if not image_url:
        raise HTTPException(status_code=400, detail="imageUrl is required.")
        
    try:
        # Step 1: Download the file from the Cloudinary URL
        print(f"Downloading prescription from: {image_url}")
        res = requests.get(image_url)
        if res.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Failed to download image from URL. Status code: {res.status_code}")
            
        file_bytes = res.content
        
        # Step 2: Determine file type
        content_type = res.headers.get("Content-Type", "").lower()
        if "octet-stream" in content_type or not content_type:
            if image_url.lower().endswith(".pdf"):
                content_type = "application/pdf"
            elif image_url.lower().endswith(".png"):
                content_type = "image/png"
            elif image_url.lower().endswith(".webp"):
                content_type = "image/webp"
            else:
                content_type = "image/jpeg"
                
        # Step 3: Handle Conversion to Path
        # The new services require file paths, so we save the downloaded bytes locally.
        if "pdf" in content_type:
            print("PDF detected. Using new pdf_converter...")
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf:
                tmp_pdf.write(file_bytes)
                tmp_pdf_path = tmp_pdf.name
                
            conv_res = convert_pdf_to_jpg(tmp_pdf_path)
            if conv_res["status"] == "error":
                raise HTTPException(status_code=422, detail=conv_res["message"])
            
            image_path = conv_res["image_path"]
            
            # pdf_converter automatically deletes the temp PDF
        else:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_img:
                tmp_img.write(file_bytes)
                image_path = tmp_img.name

        # Step 4: Quality Check (Blur Detection)
        print("Running blur detection check...")
        img_cv = cv2.imread(image_path)
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        blur_variance = cv2.Laplacian(gray, cv2.CV_64F).var()
        is_blurry = blur_variance < 100.0
        print(f"Blur check complete. Blurry: {is_blurry}, Variance: {blur_variance}")

        # Step 5: Preprocessing and Enhancement
        print("Enhancing image contrast and sharpness...")
        enh_res = enhance_image(image_path)
        if enh_res.get("status") == "ok":
            enhanced_path = enh_res["enhanced_path"]
        else:
            enhanced_path = image_path # Fallback to original

        with open(enhanced_path, "rb") as f:
            enhanced_bytes = f.read()

        # Step 6: OCR Text Extraction (for confidence calculation)
        print("Running OCR text detection...")
        ocr_text = extract_text_from_image(enhanced_bytes)
        print(f"OCR extracted text length: {len(ocr_text)} characters")

        # Step 7: Parse with Gemini AI
        print("Sending prescription to Gemini AI for extraction...")
        extracted_data = analyze_prescription(enhanced_path)
        if extracted_data.get("status") == "error":
            raise Exception(extracted_data.get("message"))
        
        # Cleanup temp files
        try:
            if os.path.exists(image_path):
                os.remove(image_path)
            if enhanced_path != image_path and os.path.exists(enhanced_path):
                os.remove(enhanced_path)
        except:
            pass
        
        # Step 8: Validate extracted medicines and compute confidence
        medicines_list = []
        for med in extracted_data.get("medicines", []):
            med_name = med.get("name", "")
            is_valid = validate_medicine_name(med_name)
            
            medicines_list.append(
                MedicineItem(
                    name=med_name,
                    dosage=med.get("dosage", ""),
                    frequency=med.get("frequency", ""),
                    duration=med.get("duration", ""),
                    instructions=med.get("instructions", "")
                )
            )

        print("Calculating extraction confidence score...")
        confidence = calculate_confidence_score(
            blur_variance=blur_variance,
            ocr_text=ocr_text,
            medicines=extracted_data.get("medicines", [])
        )
        print(f"Confidence score: {confidence}%")

        # Step 9: Build response
        return AnalysisResponse(
            success=True,
            imageUrl=image_url,
            medicines=medicines_list,
            tests=extracted_data.get("tests", []),
            ultrasounds=extracted_data.get("ultrasounds", []),
            precautions=extracted_data.get("precautions", []),
            confidence_score=confidence,
            is_blurry=is_blurry,
            blur_variance=blur_variance,
            ocr_text_extracted=ocr_text[:500]
        )

    except Exception as e:
        import traceback
        print(f"Server Error during analyze: {traceback.format_exc()}")
        return AnalysisResponse(
            success=False,
            imageUrl=image_url,
            medicines=[],
            tests=[],
            ultrasounds=[],
            precautions=[],
            confidence_score=0.0,
            is_blurry=False,
            blur_variance=0.0,
            ocr_text_extracted="",
            error=str(e)
        )
