import cv2
import numpy as np
import fitz  # PyMuPDF
from PIL import Image, ImageEnhance
import io

def convert_pdf_to_images(pdf_bytes: bytes) -> bytes:
    """
    Converts the first page of a PDF document into PNG bytes.
    """
    # Open the PDF from bytes using PyMuPDF
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    if len(doc) == 0:
        raise ValueError("The PDF document is empty.")
    
    # Load the first page
    page = doc.load_page(0)
    
    # Render page to a pixmap (image)
    pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))  # 2.0x scale for higher OCR/AI resolution
    
    # Convert to PNG bytes
    png_bytes = pix.tobytes("png")
    return png_bytes

def check_image_blur(image_bytes: bytes, threshold: float = 100.0) -> tuple[bool, float]:
    """
    Detects if an image is blurry using the Laplacian variance method.
    Returns a tuple: (is_blurry, variance)
    """
    try:
        # Convert bytes to numpy array for OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        
        if img is None:
            return False, 0.0
            
        # Calculate Laplacian variance
        variance = cv2.Laplacian(img, cv2.CV_64F).var()
        is_blurry = variance < threshold
        return bool(is_blurry), float(variance)
    except Exception as e:
        print(f"Error in check_image_blur: {e}")
        return False, 0.0

def preprocess_and_enhance_image(image_bytes: bytes) -> bytes:
    """
    Applies Pillow contrast, sharpness, and brightness enhancement
    to make text more readable for OCR and Gemini AI.
    """
    try:
        # Load image with Pillow
        image = Image.open(io.BytesIO(image_bytes))
        
        # 1. Enhance Contrast (makes text stand out from background)
        contrast = ImageEnhance.Contrast(image)
        image = contrast.enhance(1.6)
        
        # 2. Enhance Sharpness (helps edge detection for letters)
        sharpness = ImageEnhance.Sharpness(image)
        image = sharpness.enhance(1.4)
        
        # 3. Enhance Brightness slightly
        brightness = ImageEnhance.Brightness(image)
        image = brightness.enhance(1.05)
        
        # Convert back to PNG bytes
        output_buffer = io.BytesIO()
        image.save(output_buffer, format="PNG")
        return output_buffer.getvalue()
    except Exception as e:
        print(f"Error in preprocess_and_enhance_image: {e}")
        return image_bytes  # Fallback to original bytes
