import google.generativeai as genai
import os
import json

def analyze_prescription_with_gemini(image_bytes: bytes, mime_type: str = "image/png") -> dict:
    """
    Sends the preprocessed image bytes to Gemini 2.5 Flash to extract prescription details.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Fallback to loading from .env if not set in environment (dotenv is configured in main.py)
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("GEMINI_API_KEY")
        
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured in the environment.")

    # Configure Gemini SDK
    genai.configure(api_key=api_key)
    
    # Use gemini-2.5-flash (supported & working model)
    model = genai.GenerativeModel("gemini-2.5-flash")

    # Structuring prompt for extraction
    prompt = """You are a medical prescription reader AI. Analyze the uploaded prescription image carefully and extract the following information in valid JSON format. Do NOT include any markdown formatting, code fences, or extra text — return ONLY the raw JSON object.

Return this exact JSON structure:
{
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "dosage (e.g. 500mg, 1 tablet)",
      "frequency": "how often (e.g. twice a day, once at night)",
      "duration": "how long (e.g. 5 days, 1 week)",
      "instructions": "special instructions (e.g. take after food, avoid dairy)"
    }
  ],
  "tests": ["test name 1", "test name 2"],
  "ultrasounds": ["ultrasound name 1"],
  "precautions": ["precaution 1", "precaution 2"]
}

Rules:
- Only extract what is actually written on the prescription. Do NOT add anything extra.
- If a field is not mentioned on the prescription, use an empty string "" for that field.
- If no tests are mentioned, return an empty array [].
- If no ultrasounds are mentioned, return an empty array [].
- If no precautions are mentioned, return an empty array [].
- Return ONLY the JSON object, nothing else."""

    # Construct the image part for API payload
    image_part = {
        "mime_type": mime_type,
        "data": image_bytes
    }

    # Generate content using Gemini
    response = model.generate_content([prompt, image_part])
    text = response.text

    # Clean the response to ensure valid JSON parsing
    cleaned_text = text.replace("```json", "").replace("```", "").strip()
    
    try:
        data = json.loads(cleaned_text)
        return data
    except json.JSONDecodeError as e:
        print(f"Failed to parse Gemini response as JSON: {cleaned_text}")
        raise ValueError(f"Gemini response was not valid JSON: {e}")
