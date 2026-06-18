import os
import io
import cv2
import numpy as np
from PIL import Image, ImageOps, ImageEnhance
import fitz  # PyMuPDF for PDF to Image conversion
import pytesseract  # Tesseract OCR for text rotation detection

def convert_pdf_to_images(pdf_bytes: bytes) -> bytes:
    """
    Converts the first page of a PDF document into PNG bytes.
    PyMuPDF (fitz) is used here because it is very fast and efficient.
    """
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    if len(doc) == 0:
        raise ValueError("The PDF document is empty.")
    
    page = doc.load_page(0)
    # Increase resolution by 2x for better readability during OCR/Processing
    pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0))
    png_bytes = pix.tobytes("png")
    return png_bytes

def check_blur(image_cv, threshold=100.0):
    """
    Check if the image is blurry using OpenCV.
    Calculates the variance of the Laplacian (edges). 
    Low variance means there are fewer edges, so the image is blurry.
    """
    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    return variance < threshold

def check_brightness(image_cv, dark_threshold=65.0, bright_threshold=215.0):
    """
    Check if the image is too dark or too bright.
    Calculates the average pixel intensity of the grayscale image using numpy.
    """
    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
    average_brightness = np.mean(gray)
    
    if average_brightness < dark_threshold:
        return "dark"
    elif average_brightness > bright_threshold:
        return "bright"
    
    return "ok"

def check_and_correct_rotation(image_bytes: bytes) -> bytes:
    """
    Uses Tesseract OSD (Orientation and Script Detection) to detect if the text
    in the image is rotated, and corrects its orientation automatically.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        # Detect the orientation of the text
        osd = pytesseract.image_to_osd(image)
        rotation_angle = 0.0
        
        for line in osd.split('\n'):
            if 'Rotate:' in line:
                rotation_angle = float(line.split(':')[1].strip())
                break
                
        if rotation_angle != 0.0:
            print(f"Rotation detected: {rotation_angle} degrees. Rotating image back...")
            # Pillow rotates counter-clockwise, OSD is clockwise, so we use negative angle
            image = image.rotate(-rotation_angle, expand=True)
            
            output_buffer = io.BytesIO()
            image.save(output_buffer, format="PNG")
            return output_buffer.getvalue()
            
        return image_bytes
    except Exception as e:
        # Tesseract throws an error if it can't find enough text, which is fine
        print(f"OSD rotation check skipped: {e}")
        return image_bytes

def preprocess_and_enhance_image(image_bytes: bytes) -> bytes:
    """
    Applies Pillow contrast, sharpness, and brightness enhancement
    to make the document text more readable for AI and OCR.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        
        contrast = ImageEnhance.Contrast(image)
        image = contrast.enhance(1.6)
        
        sharpness = ImageEnhance.Sharpness(image)
        image = sharpness.enhance(1.4)
        
        brightness = ImageEnhance.Brightness(image)
        image = brightness.enhance(1.05)
        
        output_buffer = io.BytesIO()
        image.save(output_buffer, format="PNG")
        return output_buffer.getvalue()
    except Exception as e:
        return image_bytes

def process_image(file_path, output_dir="output_images"):
    """
    Main function to process the uploaded image or PDF.
    - Handles PDF to Image conversion using PyMuPDF (fitz)
    - Fixes text rotation using Tesseract
    - Checks for blurriness and brightness issues using OpenCV
    Returns a dictionary with status, message, and processed file path.
    """
    try:
        # Read the file content
        with open(file_path, "rb") as f:
            file_bytes = f.read()
            
        # 1. If it's a PDF, convert it to an image first
        if file_path.lower().endswith(".pdf"):
            file_bytes = convert_pdf_to_images(file_bytes)

        # 2. Correct text rotation (using pytesseract)
        file_bytes = check_and_correct_rotation(file_bytes)
        
        # 3. Enhance image readability
        file_bytes = preprocess_and_enhance_image(file_bytes)

        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
        
        # Create output filename (change extension to .png if it was a PDF)
        filename = os.path.basename(file_path)
        if filename.lower().endswith(".pdf"):
            filename = filename[:-4] + ".png"
            
        processed_image_path = os.path.join(output_dir, f"processed_{filename}")
        
        # 4. Open with Pillow to fix any mobile camera EXIF rotation issues
        image = Image.open(io.BytesIO(file_bytes))
        image = ImageOps.exif_transpose(image)
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        # Save the final image to disk
        image.save(processed_image_path)
        
        # Convert Pillow image to OpenCV format (BGR array) for blur & brightness checks
        image_cv = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        
        # 5. Check for Blur
        if check_blur(image_cv):
            return {
                "status": "error",
                "message": "Image is blurry, please take a clear photo.",
                "processed_image_path": processed_image_path
            }
            
        # 6. Check for Brightness issues
        brightness_status = check_brightness(image_cv)
        if brightness_status == "dark":
            return {
                "status": "error",
                "message": "Image is too dark, please take a photo in better lighting.",
                "processed_image_path": processed_image_path
            }
        elif brightness_status == "bright":
            return {
                "status": "error",
                "message": "Image has too much glare, please retake the photo.",
                "processed_image_path": processed_image_path
            }
            
        # All checks passed successfully
        return {
            "status": "ok",
            "message": "Image is clear! Ready for processing.",
            "processed_image_path": processed_image_path
        }
        
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error processing image: {str(e)}",
            "processed_image_path": None
        }
