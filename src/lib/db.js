// In-memory database for the Smart Lock system
import { v4 as uuidv4 } from 'uuid';

// Main data stores
const pendingRequests = new Map(); // requestId -> request data
const lockStatus = new Map(); // lockId -> lock data
const users = new Map(); // publicKey -> user data

// Initialize with a hardcoded lock and admin user
const LOCK_ID = "lock001";
const ADMIN_KEY = "6NTeQigYN8FBKxoZWYhoUbMGdSJY8nx9kto5JvKb6Dbn"; // Admin key

// Set up the initial admin user
users.set(ADMIN_KEY, {
  name: "Admin",
  isAdmin: true,
  dateAdded: new Date(),
  lastAccess: null
});

// Initialize lock with the admin key
lockStatus.set(LOCK_ID, { 
  name: "Test Lock",
  unlockPending: false,
  lastAccess: null,
  authorizedKeys: [ADMIN_KEY],  // Array of authorized keys
  accessLogs: [],  // Store access history
  // Adaptive polling system
  activeSession: false,
  lastActivity: new Date()
});

// Helper functions for request management
export function createRequest(lockId = LOCK_ID) {
  const requestId = uuidv4();
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 5); // 5 minute expiration
  
  // Store request in memory
  pendingRequests.set(requestId, {
    lockId,
    timestamp: new Date(),
    expires,
    status: 'pending'
  });
  
  // Update the lock's activity timestamp
  const lock = lockStatus.get(lockId);
  if (lock) {
    lock.lastActivity = new Date();
    lock.activeSession = true;
  }
  
  return {
    requestId,
    expires
  };
}

// Get a pending request
export function getRequest(requestId) {
  return pendingRequests.get(requestId);
}

// Update request status
export function updateRequest(requestId, status) {
  const request = pendingRequests.get(requestId);
  if (request) {
    request.status = status;
    return true;
  }
  return false;
}

// Check if request is expired
export function isRequestExpired(requestId) {
  const request = pendingRequests.get(requestId);
  if (!request) return true;
  return new Date() > request.expires;
}

// Delete a request
export function deleteRequest(requestId) {
  return pendingRequests.delete(requestId);
}

// Helper functions for lock management
export function getLock(lockId) {
  return lockStatus.get(lockId);
}

// Mark a lock for unlocking
export function setUnlockPending(lockId, status) {
  const lock = lockStatus.get(lockId);
  if (lock) {
    lock.unlockPending = status;
    lock.lastAccess = new Date();
    lock.lastActivity = new Date();
    lock.activeSession = true;
    
    // Set an expiration for the unlock request (30 seconds)
    if (status) {
      lock.unlockExpiration = new Date(Date.now() + 30000);
    } else {
      lock.unlockExpiration = null;
    }
    return true;
  }
  return false;
}

// Check if unlock is pending and not expired
export function isUnlockPending(lockId) {
  const lock = lockStatus.get(lockId);
  if (!lock) return false;
  
  return lock.unlockPending && 
         (!lock.unlockExpiration || new Date() < lock.unlockExpiration);
}

// Log access to a lock
export function logAccess(lockId, publicKey, requestId) {
  const lock = lockStatus.get(lockId);
  const user = users.get(publicKey);
  
  if (lock) {
    // Update user's last access time
    if (user) {
      user.lastAccess = new Date();
    }
    
    // Log the access
    lock.accessLogs.push({
      timestamp: new Date(),
      publicKey,
      userName: user?.name || 'Unknown User',
      requestId
    });
    
    return true;
  }
  return false;
}

// Helper functions for user management
export function getUser(publicKey) {
  return users.get(publicKey);
}

// Check if a user is authorized for a lock
export function isUserAuthorized(lockId, publicKey) {
  const lock = lockStatus.get(lockId);
  if (!lock) return false;
  
  return lock.authorizedKeys.includes(publicKey);
}

// Add a new user
export function addUser(publicKey, name, isAdmin = false) {
  // Add user data
  users.set(publicKey, {
    name,
    isAdmin: Boolean(isAdmin),
    dateAdded: new Date(),
    lastAccess: null
  });
  
  return true;
}

// Add a key to a lock
export function addKeyToLock(lockId, publicKey) {
  const lock = lockStatus.get(lockId);
  if (!lock) return false;
  
  // Check if key is already authorized
  if (lock.authorizedKeys.includes(publicKey)) {
    return false;
  }
  
  // Add key to authorized list
  lock.authorizedKeys.push(publicKey);
  lock.lastActivity = new Date();
  lock.activeSession = true;
  
  return true;
}

// Remove a key from a lock
export function removeKeyFromLock(lockId, publicKey) {
  const lock = lockStatus.get(lockId);
  if (!lock) return false;
  
  // Update activity timestamp
  lock.lastActivity = new Date();
  lock.activeSession = true;
  
  // Find key index
  const keyIndex = lock.authorizedKeys.indexOf(publicKey);
  if (keyIndex === -1) return false;
  
  // Don't allow removing the last admin key
  const isRemovingAdmin = users.get(publicKey)?.isAdmin || false;
  if (isRemovingAdmin) {
    // Count remaining admin keys
    const remainingAdmins = lock.authorizedKeys.filter(key => 
      key !== publicKey && users.get(key)?.isAdmin
    ).length;
    
    if (remainingAdmins === 0) {
      return false;
    }
  }
  
  // Remove key from authorized list
  lock.authorizedKeys.splice(keyIndex, 1);
  return true;
}

// Rename a user
export function renameUser(publicKey, name) {
  const user = users.get(publicKey);
  if (!user) return false;
  
  // Update name
  user.name = name;
  
  // Update activity timestamps for all locks with this key
  for (const [_, lock] of lockStatus.entries()) {
    if (lock.authorizedKeys.includes(publicKey)) {
      lock.lastActivity = new Date();
      lock.activeSession = true;
    }
  }
  
  return true;
}

// Get authorized keys for a lock with full user details
export function getAuthorizedKeysWithDetails(lockId) {
  const lock = lockStatus.get(lockId);
  if (!lock) return null;
  
  // Update activity state
  lock.lastActivity = new Date();
  lock.activeSession = true;
  
  // Get user details for each key
  const keyDetails = lock.authorizedKeys.map(key => {
    const user = users.get(key) || { name: 'Unknown User' };
    return {
      publicKey: key,
      name: user.name,
      isAdmin: user.isAdmin || false,
      dateAdded: user.dateAdded,
      lastAccess: user.lastAccess
    };
  });
  
  return {
    keys: keyDetails,
    accessLogs: lock.accessLogs.slice(-20) // Return the last 20 access logs
  };
}

// Get adaptive polling interval based on system state
export function getAdaptivePollingInterval(lockId) {
  const lock = lockStatus.get(lockId);
  if (!lock) return 30; // Default to 30 seconds
  
  // Determine the next polling interval based on system state
  let nextCheckIn = 30; // Default to 30 seconds
  
  // Check if we have an active authentication session
  if (lock.activeSession) {
    // Check how long since the last activity
    const timeSinceActivity = Date.now() - lock.lastActivity.getTime();
    
    if (timeSinceActivity < 2 * 60 * 1000) { // Less than 2 minutes
      // If recent activity, check more frequently
      nextCheckIn = 5; // Check every 5 seconds
    } else if (timeSinceActivity < 5 * 60 * 1000) { // Less than 5 minutes
      // If some recent activity, check somewhat frequently
      nextCheckIn = 15; // Check every 15 seconds
    } else {
      // No recent activity, end the active session
      lock.activeSession = false;
    }
  }
  
  // Check for pending requests for this lock
  const pendingRequestsForLock = Array.from(pendingRequests.entries())
    .filter(([_, req]) => req.lockId === lockId && req.status === 'pending')
    .filter(([_, req]) => new Date() < req.expires); // Only consider non-expired requests
  
  // If there are pending requests, check more frequently
  if (pendingRequestsForLock.length > 0) {
    nextCheckIn = Math.min(nextCheckIn, 10); // Check at least every 10 seconds
  }
  
  return nextCheckIn;
}