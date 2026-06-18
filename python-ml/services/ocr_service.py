import pytesseract
from PIL import Image
import io
import os
import re

# Try common Windows Tesseract installation paths
COMMON_TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
]

tesseract_configured = False
for path in COMMON_TESSERACT_PATHS:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        tesseract_configured = True
        print(f"Tesseract OCR path configured: {path}")
        break

if not tesseract_configured:
    print("WARNING: Tesseract OCR binary not found in standard paths. OCR text validation will run in fallback mode.")

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Extracts text from image bytes using PyTesseract.
    Returns an empty string if Tesseract is not installed or fails.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"OCR Exception (Tesseract might not be installed or in PATH): {e}")
        return ""

# Medical and prescription keywords to confirm document validity
PRESCRIPTION_KEYWORDS = [
    'rx', 'doctor', 'dr.', 'patient', 'tablet', 'tab', 'capsule', 'cap', 'mg', 
    'syrup', 'syr', 'ml', 'take', 'dosage', 'frequency', 'instruction', 
    'prescription', 'medicine', 'twice', 'daily', 'night', 'morning', 'evening', 
    'food', 'capsules', 'tablets', 'symptoms', 'clinical', 'pharmacy', 'diagnosis'
]

def verify_is_prescription(ocr_text: str) -> tuple[bool, float]:
    """
    Analyzes OCR text for medical keywords to confirm if the document is a prescription.
    Returns (is_prescription, score)
    """
    if not ocr_text:
        # If OCR returned empty (e.g. Tesseract not installed or failed), 
        # we return True as fallback with a 0.0 score so we don't block analysis.
        return True, 0.0
        
    ocr_lower = ocr_text.lower()
    matched_words = []
    
    for word in PRESCRIPTION_KEYWORDS:
        # Use regex to search for word boundary of the keyword
        if re.search(r'\b' + re.escape(word) + r'\b', ocr_lower):
            matched_words.append(word)
            
    # Calculate score based on number of unique medical keyword matches
    score = len(matched_words)
    # If we find at least 2 unique keywords, or "rx" is explicitly present, we confirm it is a prescription
    is_prescription = score >= 2 or 'rx' in matched_words
    return is_prescription, float(score)

