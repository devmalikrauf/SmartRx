import pytesseract
from PIL import Image
import io
import os

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
