'use client';

import { useState, useEffect } from 'react';
import StatusMessage from './StatusMessage';

export default function WalletConnector({ onConnect }) {
  const [connected, setConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [error, setError] = useState(null);
  const [phantomInstalled, setPhantomInstalled] = useState(false);
  
  // Check if Phantom is available on page load
  useEffect(() => {
    const checkForPhantom = () => {
      const provider = window?.solana;
      setPhantomInstalled(provider?.isPhantom || false);
    };
    
    // Check immediately
    checkForPhantom();
    
    // Also check after a short delay in case the wallet injects later
    const timer = setTimeout(checkForPhantom, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const connectWallet = async () => {
    try {
      setError(null);
      
      if (!window?.solana) {
        throw new Error('Phantom wallet not detected. Please install Phantom.');
      }
      
      const provider = window.solana;
      const response = await provider.connect();
      const key = response.publicKey.toString();
      
      setPublicKey(key);
      setConnected(true);
      
      // Call the callback with the public key
      if (onConnect) {
        onConnect(key);
      }
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    }
  };
  
  if (!phantomInstalled) {
    return (
      <div className="my-4">
        <StatusMessage 
          message="Phantom wallet not detected. Please install Phantom wallet extension."
          type="error"
          autoHide={false}
        />
        <a 
          href="https://phantom.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          Install Phantom Wallet
        </a>
      </div>
    );
  }
  
  if (connected) {
    return (
      <div className="my-4">
        <StatusMessage 
          message={`Wallet connected: ${publicKey}`} 
          type="success" 
          autoHide={false}
        />
      </div>
    );
  }
  
  return (
    <div className="my-4">
      <p className="mb-2">Connect your Phantom wallet:</p>
      <button
        onClick={connectWallet}
        className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700"
      >
        Connect Phantom Wallet
      </button>
      
      {error && <StatusMessage message={error} type="error" />}
    </div>
  );
}