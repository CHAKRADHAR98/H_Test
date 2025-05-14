import { NextResponse } from 'next/server';
import { 
  getRequest, isRequestExpired, deleteRequest, 
  isUserAuthorized, setUnlockPending, logAccess 
} from '@/lib/db';
import { verifySignature } from '@/lib/crypto';

export async function POST(request) {
  try {
    const { requestId, publicKey, signature, message } = await request.json();
    
    // Check if request exists and is valid
    const req = getRequest(requestId);
    if (!req) {
      return NextResponse.json({ 
        success: false, 
        error: 'Access request not found' 
      }, { status: 404 });
    }
    
    // Check if request has expired
    if (isRequestExpired(requestId)) {
      deleteRequest(requestId);
      return NextResponse.json({ 
        success: false, 
        error: 'Access request has expired' 
      }, { status: 400 });
    }
    
    // Check if the public key is authorized
    if (!isUserAuthorized(req.lockId, publicKey)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized public key' 
      }, { status: 403 });
    }
    
    // Verify the signature
    const isValid = verifySignature(message, signature, publicKey);
    
    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid signature' 
      }, { status: 400 });
    }
    
    // Log the access
    logAccess(req.lockId, publicKey, requestId);
    
    // Mark request as approved and set unlock flag
    setUnlockPending(req.lockId, true);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Access granted' 
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}