import google.generativeai as genai
import os
import json
from PIL import Image

def analyze_prescription(image_path: str) -> dict:
    """
    Takes a prescription image path, sends it to Gemini 1.5 Flash API,
    and returns a structured JSON dictionary containing medicines, tests, etc.
    """
    try:
        # Step 1: Ensure the image file exists
        if not os.path.exists(image_path):
            return {"status": "error", "message": "Invalid image path, file not found."}

        # Step 2: Initialize Gemini API key
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            # Fallback to load from .env file if available
            from dotenv import load_dotenv
            load_dotenv()
            api_key = os.getenv("GEMINI_API_KEY")
            
        if not api_key:
            return {"status": "error", "message": "GEMINI_API_KEY environment variable is not configured."}

        # Step 3: Configure the genai library
        genai.configure(api_key=api_key)

        # Step 4: Use gemini-2.5-flash model
        model = genai.GenerativeModel("gemini-2.5-flash")

        # Open the image using Pillow to pass inline to the Gemini API
        img = Image.open(image_path)

        # Step 5: The Prompt Strategy
        # We use a highly detailed, strict system prompt here.
        # - We instruct it to be literal and avoid hallucinating (guessing) by enforcing "Not clearly visible".
        # - We provide the exact JSON skeleton it must fill out.
        # - We forbid it from using markdown fences (```json) so we can parse it directly using json.loads().
        prompt = """
        You are a highly strict and precise medical data extraction AI.
        Analyze the provided prescription image and extract the information based ONLY on what is clearly visible.
        
        CRITICAL RULES:
        1. Only extract what is CLEARLY visible in the image.
        2. Never assume, guess, or hallucinate any information.
        3. If something is not clearly readable, write "Not clearly visible".
        4. Always return valid JSON in the exact format shown below.
        5. Return ONLY the raw JSON object. No extra text, no markdown block formatting (like ```json or ```).

        EXACT JSON FORMAT REQUIRED:
        {
          "medicines": [
            {
              "name": "medicine name",
              "dosage": "exact dose",
              "frequency": "how many times per day",
              "duration": "how many days",
              "instructions": "before/after food etc"
            }
          ],
          "tests": [],
          "ultrasounds": [],
          "precautions": [],
          "confidence": "high or medium or low",
          "doctor_name": "if visible",
          "patient_name": "if visible",
          "date": "if visible"
        }
        """

        # Step 6: Send the request to Gemini API
        # We pass both the strict text prompt and the PIL image object
        response = model.generate_content([prompt, img])
        
        # Step 7: Clean up the response text to guarantee JSON parsing
        text = response.text.strip()
        
        # Failsafe: Just in case the model ignores the "no markdown" rule
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        text = text.strip()

        # Step 8: Parse the string into a Python Dictionary
        data = json.loads(text)
        
        # Ensure it returns the JSON directly
        return data

    except json.JSONDecodeError as e:
        # This triggers if Gemini returns something that isn't valid JSON
        print(f"JSON Parse Error: {str(e)}\nRaw Output: {text}")
        return {"status": "error", "message": "Gemini API did not return a valid JSON format."}
        
    except Exception as e:
        # This catches network errors, quota limits, API key issues, etc.
        print(f"API Error: {str(e)}")
        return {"status": "error", "message": f"Gemini API call failed: {str(e)}"}

# Optional testing block
if __name__ == "__main__":
    # result = analyze_prescription("sample.jpg")
    # print(json.dumps(result, indent=2))
    pass
