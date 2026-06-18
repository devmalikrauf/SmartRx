import { NextResponse } from 'next/server';

// GET /api/prescriptions
export async function GET(req) {
  try {
    return NextResponse.json({ 
      success: true, 
      message: 'Fetch prescriptions history endpoint skeleton.' 
    });
  } catch (error) {
    console.error('Fetch Prescriptions API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
