import os
import fitz  # PyMuPDF library for checking PDF properties
from pdf2image import convert_from_path

def convert_pdf_to_jpg(pdf_path, temp_dir="temp_images"):
    """
    Converts the first page of a PDF file to a high-quality JPG image.
    - Uses PyMuPDF to check for password protection.
    - Uses pdf2image to convert the first page with 300 DPI.
    - Deletes the original PDF file after processing.
    """
    try:
        # Step 1: Verify the PDF file exists
        if not os.path.exists(pdf_path):
            return {
                "status": "error", 
                "message": "PDF file not found.", 
                "image_path": None
            }
            
        # Step 2: Use PyMuPDF (fitz) to check if PDF is password protected
        try:
            doc = fitz.open(pdf_path)
            
            # Check for password protection
            if doc.needs_pass:
                doc.close()
                return {
                    "status": "error", 
                    "message": "PDF is password protected and cannot be processed.", 
                    "image_path": None
                }
            
            # Check if document has at least one page
            if len(doc) == 0:
                doc.close()
                return {
                    "status": "error", 
                    "message": "PDF file is empty.", 
                    "image_path": None
                }
                
            doc.close()
        except Exception as e:
            return {
                "status": "error", 
                "message": f"Failed to read PDF: {str(e)}", 
                "image_path": None
            }

        # Step 3: Create the temporary directory if it doesn't exist
        os.makedirs(temp_dir, exist_ok=True)
        
        # Step 4: Use pdf2image to convert the FIRST page to a high-quality JPG (300 DPI)
        try:
            # first_page=1, last_page=1 ensures we only convert the first page (handles multi-page PDFs)
            images = convert_from_path(
                pdf_path, 
                dpi=300, 
                first_page=1, 
                last_page=1, 
                fmt="jpg"
            )
            
            if not images:
                return {
                    "status": "error", 
                    "message": "Failed to convert PDF to image.", 
                    "image_path": None
                }
                
            first_page_image = images[0]
            
            # Step 5: Save the converted image to the temp folder
            filename = os.path.basename(pdf_path)
            # Create a new filename with .jpg extension
            image_filename = f"{os.path.splitext(filename)[0]}_page1.jpg"
            image_path = os.path.join(temp_dir, image_filename)
            
            # Save the image as JPEG
            first_page_image.save(image_path, "JPEG")
            
        except Exception as e:
            return {
                "status": "error", 
                "message": f"Image conversion failed (Poppler might be missing): {str(e)}", 
                "image_path": None
            }

        # Step 6: Delete the original temp PDF file after successful processing
        try:
            os.remove(pdf_path)
        except Exception as e:
            print(f"Warning: Failed to delete original PDF: {str(e)}")
            
        # Step 7: Return the path of the converted image
        return {
            "status": "ok", 
            "message": "PDF successfully converted to high-quality JPG.", 
            "image_path": image_path
        }
        
    except Exception as e:
        # Catch any other unexpected errors
        return {
            "status": "error", 
            "message": f"Unexpected error: {str(e)}", 
            "image_path": None
        }

# Optional testing block
if __name__ == "__main__":
    # Example usage:
    # result = convert_pdf_to_jpg("sample.pdf")
    # print(result)
    pass
