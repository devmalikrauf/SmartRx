import { NextResponse } from 'next/server';

// POST /api/analyze — Forwards the Cloudinary image/PDF URL to the Python FastAPI backend
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

    console.log(`Forwarding analysis request for ${imageUrl} to Python backend...`);
    
    // Call the Python FastAPI server running on port 8000
    const pythonRes = await fetch('http://127.0.0.1:8000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl }),
    });

    if (!pythonRes.ok) {
      const errorText = await pythonRes.text();
      throw new Error(`Python server responded with error: ${errorText}`);
    }

    const data = await pythonRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route /api/analyze error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze prescription' },
      { status: 500 }
    );
  }
}
