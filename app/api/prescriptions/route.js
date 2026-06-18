import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Prescription from '@/models/Prescription';

// GET /api/prescriptions — Fetches all prescriptions for the logged-in user
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please log in first.' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find prescriptions by userId, sorted by newest first
    const prescriptions = await Prescription.find({ userId: session.user.id }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      prescriptions,
    });
  } catch (error) {
    console.error('Fetch Prescriptions API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prescription history.' },
      { status: 500 }
    );
  }
}
