// Adaptive polling logic for ESP32
import { getAdaptivePollingInterval, isUnlockPending, setUnlockPending } from './db';

/**
 * Get the polling response for an ESP32 device
 * @param {string} lockId - The ID of the lock
 * @returns {Object} Response with unlock status and next check-in time
 */
export function getPollingResponse(lockId) {
  // Check if unlock is pending
  if (isUnlockPending(lockId)) {
    // Reset the unlock flag
    setUnlockPending(lockId, false);
    
    // Tell ESP32 to check back in 5 seconds (after it unlocks)
    return { 
      unlock: true,
      nextCheckIn: 5 // Check again in 5 seconds (after unlocking)
    };
  }
  
  // Get the next polling interval based on system state
  const nextCheckIn = getAdaptivePollingInterval(lockId);
  
  // Return the result with the next check-in time
  return { 
    unlock: false,
    nextCheckIn
  };
}