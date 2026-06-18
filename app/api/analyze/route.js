import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI client with the API key from .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/analyze — Receives a Cloudinary image URL, sends to Gemini AI, returns extracted data
export async function POST(req) {
  try {
    // Get the image URL from the request body
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'No image URL provided' },
        { status: 400 }
      );
    }

    // Fetch the image from Cloudinary and convert it to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Determine the mime type from the URL (supports jpg, png, webp, pdf)
    let mimeType = 'image/jpeg'; // default
    if (imageUrl.includes('.png')) mimeType = 'image/png';
    else if (imageUrl.includes('.webp')) mimeType = 'image/webp';
    else if (imageUrl.includes('.pdf')) mimeType = 'application/pdf';

    // Use Gemini 2.5 Flash model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // The prompt that tells Gemini exactly what to extract from the prescription
    const prompt = `You are a medical prescription reader AI. Analyze the uploaded prescription image carefully and extract the following information in valid JSON format. Do NOT include any markdown formatting, code fences, or extra text — return ONLY the raw JSON object.

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
- Return ONLY the JSON object, nothing else.`;

    // Send the image + prompt to Gemini AI
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    // Get the text response from Gemini
    const response = await result.response;
    const text = response.text();

    // Clean the response — remove any markdown code fences if Gemini adds them
    const cleanedText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse the JSON response from Gemini
    const prescriptionData = JSON.parse(cleanedText);

    // Return the extracted prescription data along with the image URL
    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      medicines: prescriptionData.medicines || [],
      tests: prescriptionData.tests || [],
      ultrasounds: prescriptionData.ultrasounds || [],
      precautions: prescriptionData.precautions || [],
    });
  } catch (error) {
    console.error('Gemini Analyze Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze prescription' },
      { status: 500 }
    );
  }
}
