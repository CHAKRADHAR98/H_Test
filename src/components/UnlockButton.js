'use client';

import { useState } from 'react';
import StatusMessage from './StatusMessage';
import { createSignMessage } from '@/lib/crypto';

export default function UnlockButton({ requestData, publicKey }) {
  const [status, setStatus] = useState(null);
  const [statusType, setStatusType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  
  // No request data or public key, can't proceed
  if (!requestData || !publicKey) {
    return null;
  }
  
  const handleUnlock = async () => {
    if (!window?.solana) {
      setStatus('Phantom wallet not detected.');
      setStatusType('error');
      return;
    }
    
    try {
      setLoading(true);
      setStatus('Preparing signature request...');
      setStatusType('info');
      
      const provider = window.solana;
      
      // Create message to sign
      const message = createSignMessage(requestData.lockId, requestData.requestId);
      const encodedMessage = new TextEncoder().encode(message);
      
      setStatus('Please approve the signature request in your wallet...');
      
      // Request signature from wallet
      const { signature } = await provider.signMessage(encodedMessage, 'utf8');
      
      // Convert signature to hex string
      const signatureHex = Array.from(signature)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      setStatus('Signature created, verifying...');
      
      // Send to backend for verification
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestData.requestId,
          publicKey,
          signature: signatureHex,
          message
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus('✅ Access granted! Door unlocking...');
        setStatusType('success');
        setUnlocked(true);
      } else {
        setStatus(`❌ Access denied: ${result.error || 'Unknown error'}`);
        setStatusType('error');
      }
    } catch (err) {
      console.error('Failed to sign message:', err);
      setStatus(`Failed to sign message: ${err.message}`);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="my-4">
      <p className="mb-2">Sign and unlock:</p>
      <button
        onClick={handleUnlock}
        disabled={loading || unlocked}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Signing...' : unlocked ? 'Unlocked!' : 'Sign & Unlock'}
      </button>
      
      {status && (
        <StatusMessage 
          message={status} 
          type={statusType}
          autoHide={statusType !== 'success' && statusType !== 'error'}
        />
      )}
      
      {unlocked && (
        <div className="mt-4 p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-700 text-sm">
          <h3 className="font-bold">System Status</h3>
          <p>The system is now in active monitoring mode. The ESP32 controller is polling the server more frequently to ensure quick response times.</p>
          <p>This will automatically adjust back to normal polling after a period of inactivity to conserve resources.</p>
        </div>
      )}
    </div>
  );
}