'use client';

import { useState } from 'react';
import Link from 'next/link';
import QRCodeGenerator from '@/components/QRCodeGenerator';
import WalletConnector from '@/components/WalletConnector';
import UnlockButton from '@/components/UnlockButton';

export default function Home() {
  const [requestData, setRequestData] = useState(null);
  const [walletKey, setWalletKey] = useState(null);
  
  // Handle when a request is created from QR generation
  const handleRequestCreated = (data) => {
    setRequestData(data);
  };
  
  // Handle when wallet is connected
  const handleWalletConnected = (publicKey) => {
    setWalletKey(publicKey);
  };
  
  return (
    <main className="max-w-lg mx-auto p-4">
      <div className="text-right mb-4">
        <Link href="/admin" className="text-blue-600 hover:underline">
          Admin Panel
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-center mb-6">Project Heimdall</h1>
      <h2 className="text-xl text-center mb-8">Smart Lock MVP</h2>
      
      <div className="space-y-8">
        {/* Step 1: Generate QR code */}
        <div>
          <h3 className="text-lg font-medium mb-2">Step 1: Generate QR Code</h3>
          <QRCodeGenerator onRequestCreated={handleRequestCreated} />
        </div>
        
        {/* Step 2: Connect wallet */}
        {requestData && (
          <div>
            <h3 className="text-lg font-medium mb-2">Step 2: Connect Wallet</h3>
            <WalletConnector onConnect={handleWalletConnected} />
          </div>
        )}
        
        {/* Step 3: Unlock */}
        {requestData && walletKey && (
          <div>
            <h3 className="text-lg font-medium mb-2">Step 3: Unlock</h3>
            <UnlockButton requestData={requestData} publicKey={walletKey} />
          </div>
        )}
      </div>
    </main>
  );
}