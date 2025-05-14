import { NextResponse } from 'next/server';
import { getUser, getAuthorizedKeysWithDetails } from '@/lib/db';

// Route for getting keys by lockId
export async function GET(request) {
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
    const publicKey = authHeader.split(' ')[1];
    
    // Check if user exists and is admin
    const user = getUser(publicKey);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Admin access required' 
      }, { status: 403 });
    }
    
    // Get the lockId from the URL parameters
    const { searchParams } = new URL(request.url);
    const lockId = searchParams.get('lockId');
    
    if (!lockId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Lock ID is required' 
      }, { status: 400 });
    }
    
    // Get keys with details
    const result = getAuthorizedKeysWithDetails(lockId);
    
    if (!result) {
      return NextResponse.json({ 
        success: false, 
        error: 'Lock not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      keys: result.keys,
      accessLogs: result.accessLogs 
    });
  } catch (error) {
    console.error('Error fetching keys:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}