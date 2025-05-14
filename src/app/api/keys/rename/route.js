import { NextResponse } from 'next/server';
import { getUser, renameUser } from '@/lib/db';

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
    const { publicKey, name } = await request.json();
    
    // Validate inputs
    if (!publicKey || !name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Rename user
    const success = renameUser(publicKey, name);
    
    if (!success) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'User renamed successfully' 
    });
  } catch (error) {
    console.error('Error renaming user:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}