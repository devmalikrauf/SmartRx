import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Prescription from '@/models/Prescription';

// POST /api/analyze — Forwards the Cloudinary image/PDF URL to the Python FastAPI backend
// and saves the results in MongoDB if the user is authenticated.
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

    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:8000';
    console.log(`Connecting to Python backend at: ${pythonBackendUrl}`);

    // Call the Python FastAPI server
    const pythonRes = await fetch(`${pythonBackendUrl}/analyze`, {
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

    // Check if the user is authenticated and analysis was successful
    if (data.success) {
      const session = await getServerSession(authOptions);
      if (session && session.user && session.user.id) {
        console.log(`User ${session.user.id} is authenticated. Saving prescription to database...`);
        try {
          await dbConnect();
          const newPrescription = new Prescription({
            userId: session.user.id,
            imageUrl: data.imageUrl || imageUrl,
            medicines: data.medicines || [],
            tests: data.tests || [],
            ultrasounds: data.ultrasounds || [],
            precautions: data.precautions || [],
          });
          const savedPrescription = await newPrescription.save();
          data.prescriptionId = savedPrescription._id.toString();
          console.log(`Prescription saved with ID: ${data.prescriptionId}`);
        } catch (dbError) {
          console.error('Failed to save prescription to database:', dbError);
          // Do not fail the request if saving to database fails, return the AI results to user anyway.
        }
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route /api/analyze error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze prescription' },
      { status: 500 }
    );
  }
}
