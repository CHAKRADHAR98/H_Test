'use client';

import { useState } from 'react';
import Image from 'next/image';
import StatusMessage from './StatusMessage';

export default function QRCodeGenerator({ onRequestCreated }) {
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/qrcode');
      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
        // Call the callback with the request data
        if (onRequestCreated) {
          onRequestCreated({
            requestId: data.requestId,
            lockId: 'lock001',
            expires: data.expires
          });
        }
      } else {
        setError(data.error || 'Failed to generate QR code');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="my-4">
      <p className="mb-2">Generate a QR code for your lock:</p>
      <button
        onClick={generateQRCode}
        disabled={loading}
        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate QR Code'}
      </button>
      
      {error && <StatusMessage message={error} type="error" />}
      
      {qrCode && (
        <div className="mt-4">
          <div className="border p-4 inline-block">
            <Image
              src={qrCode}
              alt="QR Code"
              width={200}
              height={200}
              className="mx-auto"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Scan this QR code with your phone&apos;s camera to open the mobile interface and unlock the door.
          </p>
        </div>
      )}
    </div>
  );
}