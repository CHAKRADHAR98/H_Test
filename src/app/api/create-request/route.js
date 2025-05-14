import { NextResponse } from 'next/server';
import { createRequest } from '@/lib/db';

export async function GET() {
  try {
    // Create a new access request for default lock
    const { requestId, expires } = createRequest();
    
    return NextResponse.json({
      success: true,
      requestId,
      expires
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}