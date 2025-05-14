'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import StatusMessage from '@/components/StatusMessage';
import { createSignMessage } from '@/lib/crypto';

export default function MobileAuthPage() {
  const searchParams = useSearchParams();
  const [requestId, setRequestId] = useState(null);
  const [lockId, setLockId] = useState('lock001');
  const [status, setStatus] = useState('Welcome to Project Heimdall mobile access.');
  const [statusType, setStatusType] = useState('info');
  const [step, setStep] = useState('request'); // 'request', 'connect', 'unlock'
  
  // When the page loads, check for URL parameters
  useEffect(() => {
    const reqId = searchParams.get('requestId');
    const lockIdParam = searchParams.get('lockId');
    
    if (reqId) {
      setRequestId(reqId);
      setStep('connect');
      
      if (lockIdParam) {
        setLockId(lockIdParam);
      }
    }
  }, [searchParams]);
  
  // Handle creating a new request
  const handleCreateRequest = async () => {
    try {
      setStatus('Creating unlock request...');
      setStatusType('info');
      
      const response = await fetch('/api/create-request');
      const data = await response.json();
      
      if (data.success) {
        setRequestId(data.requestId);
        setStatus('Request created. Connect your wallet to continue.');
        setStatusType('success');
        setStep('connect');
      } else {
        setStatus(`Failed to create request: ${data.error || 'Unknown error'}`);
        setStatusType('error');
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      setStatusType('error');
    }
  };
  
  // Handle connecting to wallet
  const handleConnectWallet = async () => {
    try {
      setStatus('Connecting to Phantom wallet...');
      setStatusType('info');
      
      // Check if Phantom is available
      const { solana } = window;
      if (!solana?.isPhantom) {
        throw new Error('Phantom wallet is not installed. Please install Phantom app.');
      }
      
      // Connect to the wallet
      await solana.connect();
      
      setStatus('Wallet connected successfully!');
      setStatusType('success');
      setStep('unlock');
    } catch (error) {
      setStatus(`Connection error: ${error.message}`);
      setStatusType('error');
    }
  };
  
  // Handle signing and unlocking
  const handleSignAndUnlock = async () => {
    try {
      setStatus('Preparing to sign message...');
      setStatusType('info');
      
      if (!requestId) {
        throw new Error('No active request. Please restart the process.');
      }
      
      // Get Phantom provider
      const { solana } = window;
      
      // Create the message to sign
      const message = createSignMessage(lockId, requestId);
      const encodedMessage = new TextEncoder().encode(message);
      
      // Request signature
      const { signature } = await solana.signMessage(encodedMessage, 'utf8');
      
      // Convert signature to hex
      const signatureHex = Array.from(signature)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      setStatus('Verifying signature...');
      
      // Send to server for verification
      const verifyResponse = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          publicKey: solana.publicKey.toString(),
          signature: signatureHex,
          message
        })
      });
      
      const result = await verifyResponse.json();
      
      if (result.success) {
        setStatus('✅ Access granted! The door is unlocking.');
        setStatusType('success');
      } else {
        setStatus(`❌ Access denied: ${result.error || 'Unknown error'}`);
        setStatusType('error');
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
      setStatusType('error');
    }
  };
  
  return (
    <main className="max-w-lg mx-auto p-4 text-center">
      <div className="text-6xl my-6">🔒</div>
      <h1 className="text-3xl font-bold mb-2">Project Heimdall</h1>
      <h2 className="text-xl mb-6">Smart Lock Access</h2>
      
      <StatusMessage message={status} type={statusType} autoHide={false} />
      
      <div className="mt-8">
        {step === 'request' && (
          <button
            onClick={handleCreateRequest}
            className="w-full bg-green-600 text-white py-4 px-6 rounded-md text-lg font-medium hover:bg-green-700"
          >
            Start Unlock Process
          </button>
        )}
        
        {step === 'connect' && (
          <button
            onClick={handleConnectWallet}
            className="w-full bg-purple-600 text-white py-4 px-6 rounded-md text-lg font-medium hover:bg-purple-700"
          >
            Connect Phantom Wallet
          </button>
        )}
        
        {step === 'unlock' && (
          <button
            onClick={handleSignAndUnlock}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-md text-lg font-medium hover:bg-blue-700"
          >
            Sign and Unlock
          </button>
        )}
      </div>
    </main>
  );
}