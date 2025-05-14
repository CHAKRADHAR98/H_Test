'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StatusMessage from '@/components/StatusMessage';
import { createSignMessage } from '@/lib/crypto';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing your authentication...');
  const [statusType, setStatusType] = useState('info');
  const [additionalInfo, setAdditionalInfo] = useState('');
  
  useEffect(() => {
    // Get request parameters from URL
    const requestId = searchParams.get('requestId');
    const lockId = searchParams.get('lockId');
    
    if (!requestId || !lockId) {
      setStatus('Missing request parameters.');
      setStatusType('error');
      setAdditionalInfo('Please return to the main page and try again.');
      return;
    }
    
    // Process the authentication
    const processAuthentication = async () => {
      try {
        // Check if Phantom is available
        const { solana } = window;
        if (!solana?.isPhantom) {
          setStatus('Phantom wallet not detected. Please install Phantom wallet.');
          setStatusType('error');
          setAdditionalInfo('You can install Phantom wallet from https://phantom.app');
          return;
        }
        
        setStatus('Connecting to Phantom wallet...');
        
        // Connect to the wallet
        const response = await solana.connect();
        const publicKey = response.publicKey.toString();
        
        setStatus('Wallet connected. Preparing to sign...');
        
        // Create the message to sign
        const message = createSignMessage(lockId, requestId);
        const encodedMessage = new TextEncoder().encode(message);
        
        // Request signature
        const { signature } = await solana.signMessage(encodedMessage, 'utf8');
        
        // Convert signature to hex format
        const signatureHex = Array.from(signature)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        setStatus('Verifying signature...');
        
        // Verify with server
        const verifyResponse = await fetch('/api/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestId,
            publicKey,
            signature: signatureHex,
            message
          }),
        });
        
        const result = await verifyResponse.json();
        
        if (result.success) {
          setStatus('✅ Access granted! Door unlocking...');
          setStatusType('success');
          setAdditionalInfo('The lock has been notified and will unlock shortly. The system is now in active monitoring mode with more frequent polling.');
        } else {
          setStatus(`❌ Access denied: ${result.error || 'Unknown error'}`);
          setStatusType('error');
          setAdditionalInfo('Please try again or contact the administrator if the problem persists.');
        }
      } catch (err) {
        setStatus(`Authentication failed: ${err.message}`);
        setStatusType('error');
        setAdditionalInfo('Please try again or use the desktop interface.');
        console.error('Error details:', err);
      }
    };
    
    processAuthentication();
  }, [searchParams]);
  
  return (
    <main className="max-w-lg mx-auto p-4 text-center">
      <div className="text-6xl my-8">🔒</div>
      <h1 className="text-3xl font-bold mb-2">Project Heimdall</h1>
      <h2 className="text-xl mb-8">Authentication Status</h2>
      
      <StatusMessage message={status} type={statusType} autoHide={false} />
      
      {additionalInfo && (
        <p className="mt-4 text-gray-600 text-sm">{additionalInfo}</p>
      )}
    </main>
  );
}