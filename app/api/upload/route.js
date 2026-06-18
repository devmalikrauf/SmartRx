import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with credentials from .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/upload — Receives a file, uploads it to Cloudinary, returns the URL
export async function POST(req) {
  try {
    // Get the form data from the request
    const formData = await req.formData();
    const file = formData.get('file');

    // Check if a file was provided
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert the file into a base64 data URI so Cloudinary can accept it
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type; // e.g. "image/jpeg" or "application/pdf"
    const dataUri = `data:${mimeType};base64,${base64}`;

    // Upload to Cloudinary inside the "smartrx_prescriptions" folder
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'smartrx_prescriptions',
      resource_type: 'auto', // auto-detect image or PDF
    });

    // Return the secure URL of the uploaded file
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
