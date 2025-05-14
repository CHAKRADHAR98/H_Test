import { NextResponse } from 'next/server';
import { getPollingResponse } from '@/lib/adaptive-polling';
import { getLock } from '@/lib/db';

export async function GET(request, { params }) {
  const { lockId } = params;
  
  // Check if the lock exists
  const lock = getLock(lockId);
  if (!lock) {
    return NextResponse.json({ 
      success: false, 
      error: 'Lock not found',
      nextCheckIn: 30 // Default check interval
    }, { status: 404 });
  }
  
  // Get adaptive polling response
  const response = getPollingResponse(lockId);
  
  return NextResponse.json(response);
}