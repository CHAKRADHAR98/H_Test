import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { createRequest } from '@/lib/db';

export async function GET() {
  try {
    // Create a new access request
    const { requestId, expires } = createRequest();
    
    // Get the base URL from environment variable or use a fallback
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    // Create URL to mobile page instead of deep link
    const mobileUrl = `${baseUrl}/mobile-auth?requestId=${requestId}&lockId=lock001`;
    
    // Generate QR code for the URL
    const qrCodeDataUrl = await QRCode.toDataURL(mobileUrl);
    
    return NextResponse.json({
      success: true,
      requestId,
      qrCode: qrCodeDataUrl,
      expires
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}