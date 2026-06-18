import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance

def detect_handwritten_or_printed(image_cv):
    """
    Detects if the image contains handwritten or printed text WITHOUT using ML.
    
    Logic: 
    Printed text usually has uniform character heights.
    Handwritten text characters vary a lot in size and height.
    We find text contours (letters) and check the standard deviation of their heights.
    """
    # 1. Convert to grayscale for processing
    gray = cv2.cvtColor(image_cv, cv2.COLOR_BGR2GRAY)
    
    # 2. Apply adaptive threshold to get black text on white background (binary image)
    thresh = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
    )
    
    # 3. Find contours (these represent characters or connected strokes)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    heights = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        # Filter out noise (very small dots or very large page boundaries)
        if 5 < h < 100 and 5 < w < 100:
            heights.append(h)
            
    # If we couldn't find enough text characters, default to printed
    if len(heights) < 10:
        return "printed"
        
    # 4. Calculate how much the heights vary
    height_std = np.std(heights)
    
    # 5. If height variance is high, it's likely handwritten
    if height_std > 8.0:
        return "handwritten"
    else:
        return "printed"

def enhance_image(image_path, output_dir="enhanced_images"):
    """
    Main function to enhance the image for better text readability.
    - Converts to grayscale
    - Removes noise
    - Adjusts contrast and sharpness dynamically based on text type
    """
    try:
        # Step 1: Check if input image exists
        if not os.path.exists(image_path):
            return {
                "status": "error", 
                "message": "Image file nahi mili.", 
                "enhanced_path": None
            }
            
        # Step 2: Read original image with OpenCV (Keeping original safe)
        img_cv = cv2.imread(image_path)
        if img_cv is None:
            return {
                "status": "error", 
                "message": "Image read nahi ho saki.", 
                "enhanced_path": None
            }
            
        # Step 3: Detect if the text is handwritten or printed
        text_type = detect_handwritten_or_printed(img_cv)
        
        # Step 4: Convert to Grayscale
        gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
        
        # Step 5: Remove noise based on text type
        if text_type == "handwritten":
            # Handwritten text is delicate, use lighter denoising
            # fastNlMeansDenoising is excellent for removing grain without destroying edges
            denoised = cv2.fastNlMeansDenoising(gray, None, h=10, templateWindowSize=7, searchWindowSize=21)
            
            # Setup Pillow enhancement levels (lighter so we don't over-process ink strokes)
            contrast_factor = 1.4
            sharpness_factor = 1.2
        else:
            # Printed text can handle stronger denoising
            denoised = cv2.fastNlMeansDenoising(gray, None, h=15, templateWindowSize=7, searchWindowSize=21)
            
            # Setup Pillow enhancement levels (stronger for crisp printed edges)
            contrast_factor = 1.8
            sharpness_factor = 1.6

        # Step 6: Convert OpenCV image back to Pillow format for final enhancements
        pil_img = Image.fromarray(denoised)
        
        # Step 7: Increase Contrast (Makes text darker and background whiter)
        contrast_enhancer = ImageEnhance.Contrast(pil_img)
        enhanced_img = contrast_enhancer.enhance(contrast_factor)
        
        # Step 8: Increase Sharpness (Makes text edges crisp and readable)
        sharpness_enhancer = ImageEnhance.Sharpness(enhanced_img)
        enhanced_img = sharpness_enhancer.enhance(sharpness_factor)
        
        # Step 9: Save the enhanced image to a separate folder (Original stays safe)
        os.makedirs(output_dir, exist_ok=True)
        filename = os.path.basename(image_path)
        # Save as PNG to avoid JPG compression artifacts on text
        enhanced_filename = f"enhanced_{os.path.splitext(filename)[0]}.png"
        enhanced_path = os.path.join(output_dir, enhanced_filename)
        
        enhanced_img.save(enhanced_path, "PNG")
        
        # Return success with the text type detected
        return {
            "status": "ok",
            "message": f"Image successfully enhance ho gayi. (Type detected: {text_type})",
            "text_type": text_type,
            "enhanced_path": enhanced_path
        }
        
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Enhancement mein masla hua: {str(e)}", 
            "enhanced_path": None
        }

# Optional testing block
if __name__ == "__main__":
    # Example usage:
    # res = enhance_image("sample_prescription.jpg")
    # print(res)
    pass
