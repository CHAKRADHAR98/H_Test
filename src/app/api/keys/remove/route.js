import { NextResponse } from 'next/server';
import { getUser, removeKeyFromLock } from '@/lib/db';

export async function POST(request) {
  try {
    // Extract authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authorization required' 
      }, { status: 401 });
    }
    
    // Extract public key from Bearer token
    const adminKey = authHeader.split(' ')[1];
    
    // Check if user exists and is admin
    const adminUser = getUser(adminKey);
    if (!adminUser || !adminUser.isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 });
    }
    
    // Parse request body
    const { lockId, publicKey } = await request.json();
    
    // Validate inputs
    if (!lockId || !publicKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Remove key from lock
    const success = removeKeyFromLock(lockId, publicKey);
    
    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to remove key or cannot remove the last admin key' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Key removed successfully' 
    });
  } catch (error) {
    console.error('Error removing key:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}