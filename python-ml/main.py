import os
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
# Also try parent directory .env.local
parent_env = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env.local")
if os.path.exists(parent_env):
    load_dotenv(parent_env)

# Import Pydantic models
from models.prescription_model import AnalysisResponse, MedicineItem

# Import Services
from services.image_processor import (
    convert_pdf_to_images,
    check_image_blur,
    preprocess_and_enhance_image
)
from services.ocr_service import extract_text_from_image
from services.gemini_service import analyze_prescription_with_gemini
from services.validator import (
    validate_medicine_name,
    calculate_confidence_score
)

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
async def analyze_prescription(payload: AnalyzeRequest):
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
        
        # Check by extension if content-type is generic
        if "octet-stream" in content_type or not content_type:
            if image_url.lower().endswith(".pdf"):
                content_type = "application/pdf"
            elif image_url.lower().endswith(".png"):
                content_type = "image/png"
            elif image_url.lower().endswith(".webp"):
                content_type = "image/webp"
            else:
                content_type = "image/jpeg"
                
        # Step 3: Handle PDF to Image Conversion
        if "pdf" in content_type:
            print("PDF detected. Converting first page to PNG...")
            try:
                image_bytes = convert_pdf_to_images(file_bytes)
                mime_type = "image/png"
            except Exception as e:
                raise HTTPException(status_code=422, detail=f"Failed to convert PDF to image: {e}")
        else:
            image_bytes = file_bytes
            mime_type = content_type

        # Step 4: Quality Check (Blur Detection)
        print("Running blur detection check...")
        is_blurry, blur_variance = check_image_blur(image_bytes)
        print(f"Blur check complete. Blurry: {is_blurry}, Variance: {blur_variance}")

        # Step 5: Preprocessing and Enhancement
        print("Enhancing image contrast and sharpness...")
        enhanced_bytes = preprocess_and_enhance_image(image_bytes)

        # Step 6: OCR Text Extraction (for confidence calculation and verification)
        print("Running OCR text detection...")
        ocr_text = extract_text_from_image(enhanced_bytes)
        print(f"OCR extracted text length: {len(ocr_text)} characters")

        # Step 7: Parse with Gemini AI
        print("Sending prescription to Gemini AI for extraction...")
        extracted_data = analyze_prescription_with_gemini(enhanced_bytes, mime_type)
        
        # Step 8: Validate extracted medicines and compute confidence
        medicines_list = []
        for med in extracted_data.get("medicines", []):
            med_name = med.get("name", "")
            # Validate medicine name
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
            ocr_text_extracted=ocr_text[:500]  # Return first 500 chars of OCR text for UI display/debugging
        )

    except Exception as e:
        print(f"Server Error during analyze: {e}")
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
