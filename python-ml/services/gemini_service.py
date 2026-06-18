import google.generativeai as genai
import os
import json

def analyze_prescription_with_gemini(image_bytes: bytes, mime_type: str = "image/png", ocr_text: str = "") -> dict:
  """
  Sends the original image bytes and Tesseract OCR text reference to Gemini 1.5 Pro
  for highly accurate prescription detail extraction.
  """
  api_key = os.getenv("GEMINI_API_KEY")
  if not api_key:
    # Fallback to loading from .env if not set in environment
    from dotenv import load_dotenv
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
      
  if not api_key:
    raise ValueError("GEMINI_API_KEY is not configured in the environment.")

  # Configure Gemini SDK
  genai.configure(api_key=api_key)
  
  # Use gemini-1.5-pro for maximum reasoning and handwriting transcription accuracy
  model = genai.GenerativeModel("gemini-1.5-pro")

  # Structure prompt with medical context and OCR reference text
  prompt = f"""You are an expert medical prescription reader AI. Your task is to analyze the uploaded prescription image carefully and extract all information accurately in valid JSON format.

CRITICAL CORRECTIONS & RULES:
1. EXACT SPELLING FIX: You frequently misread "Dextop" as "Dexfop". If you read "Dexfop" or similar, YOU MUST change it to "Dextop". "Dexfop" is not a valid medicine, the correct spelling is "Dextop".
2. ULTRASOUND FIX: You frequently misread "U/S Abdomen" as "w/S Abdomen", "W/S Abdomen", "v/S Abdomen", etc. Any ultrasound of the abdomen MUST be transcribed exactly as "U/S Abdomen" or "Ultrasound Abdomen". NEVER use "w/S" or "W/S" or "V/S".
3. Use medical context to correct messy handwriting and typical OCR errors. Do not just copy visual misreadings blindly.
4. Do not assume or hallucinate. Only extract what is written, but correct clear visual misreadings using medical context.

We ran a traditional OCR engine on the image. Here is the raw text it extracted (it may contain typos or errors, but use it as a reference to help verify names and spellings):
---
{ocr_text}
---

Analyze the image and the reference OCR text, and return the following JSON structure. Do NOT include any markdown formatting, code fences, or extra text — return ONLY the raw JSON object.

JSON Structure:
{{
  "medicines": [
    {{
      "name": "medicine name",
      "dosage": "dosage (e.g. 500mg, 1 tablet)",
      "frequency": "how often (e.g. twice a day, once daily at night)",
      "duration": "how long (e.g. 5 days, 2 weeks)",
      "instructions": "special instructions (e.g. take after food)"
    }}
  ],
  "tests": ["test name 1", "test name 2"],
  "ultrasounds": ["ultrasound name 1"],
  "precautions": ["precaution 1", "precaution 2"]
}}

Rules:
- Return ONLY the raw JSON object, nothing else."""

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
    
    # Hardcoded post-processing fixes for known strict errors
    import re
    if "medicines" in data and isinstance(data["medicines"], list):
        for med in data["medicines"]:
            if isinstance(med, dict) and med.get("name"):
                med["name"] = re.sub(r'(?i)dexfop', 'Dextop', med["name"])
    
    def fix_us_abdomen(item_list):
        if not isinstance(item_list, list):
            return item_list
        return [re.sub(r'(?i)\b[vw]/s\b', 'U/S', item) if isinstance(item, str) else item for item in item_list]

    if "tests" in data:
        data["tests"] = fix_us_abdomen(data["tests"])
    if "ultrasounds" in data:
        data["ultrasounds"] = fix_us_abdomen(data["ultrasounds"])
        
    return data
  except json.JSONDecodeError as e:
    print(f"Failed to parse Gemini response as JSON: {cleaned_text}")
    raise ValueError(f"Gemini response was not valid JSON: {e}")
