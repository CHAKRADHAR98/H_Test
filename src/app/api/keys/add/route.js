import { NextResponse } from 'next/server';
import { getUser, addUser, addKeyToLock } from '@/lib/db';

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
    const { lockId, publicKey, name, isAdmin = false } = await request.json();
    
    // Validate inputs
    if (!lockId || !publicKey || !name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Add user data
    addUser(publicKey, name, isAdmin);
    
    // Add key to lock
    const success = addKeyToLock(lockId, publicKey);
    
    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to add key or key is already authorized' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Key added successfully' 
    });
  } catch (error) {
    console.error('Error adding key:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}