'use client';

import { useState, useEffect } from 'react';
import StatusMessage from './StatusMessage';
import UserTable from './UserTable';
import AccessLogs from './AccessLogs';
import WalletConnector from './WalletConnector';

export default function AdminPanel() {
  const [adminKey, setAdminKey] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [userName, setUserName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState(null);
  const [statusType, setStatusType] = useState('info');
  const [loading, setLoading] = useState(false);
  
  // When admin connects wallet, load the data
  useEffect(() => {
    if (adminKey) {
      loadData();
    }
  }, [adminKey]);
  
  // Load data from API
  const loadData = async () => {
    try {
      setLoading(true);
      setStatus('Loading data...');
      setStatusType('info');
      
      const response = await fetch('/api/keys?lockId=lock001', {
        headers: {
          'Authorization': `Bearer ${adminKey}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.keys);
        setLogs(data.accessLogs);
        setStatus('Data loaded successfully');
        setStatusType('success');
      } else {
        setStatus(`Failed to load data: ${data.error || 'Unknown error'}`);
        setStatusType('error');
      }
    } catch (err) {
      setStatus(`Error loading data: ${err.message}`);
      setStatusType('error');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle wallet connection
  const handleWalletConnect = (publicKey) => {
    setAdminKey(publicKey);
  };
  
  // Handle scan wallet button
  const handleScanWallet = async () => {
    try {
      setStatus('Connecting to wallet for scanning...');
      setStatusType('info');
      
      if (!window?.solana) {
        throw new Error('Phantom wallet is not installed');
      }
      
      const provider = window.solana;
      const response = await provider.connect();
      const scannedKey = response.publicKey.toString();
      
      // Fill in the key field
      setNewKey(scannedKey);
      
      setStatus('Wallet public key captured');
      setStatusType('success');
    } catch (err) {
      setStatus(`Failed to scan wallet: ${err.message}`);
      setStatusType('error');
    }
  };
  
  // Handle add key
  const handleAddKey = async () => {
    if (!newKey || !userName) {
      setStatus('Please fill in all fields');
      setStatusType('error');
      return;
    }
    
    try {
      setStatus('Adding new key...');
      setStatusType('info');
      
      const response = await fetch('/api/keys/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          lockId: 'lock001',
          publicKey: newKey,
          name: userName,
          isAdmin: isAdmin
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus('Key added successfully');
        setStatusType('success');
        
        // Clear form
        setNewKey('');
        setUserName('');
        setIsAdmin(false);
        
        // Refresh data
        loadData();
      } else {
        setStatus(`Failed to add key: ${result.error || 'Unknown error'}`);
        setStatusType('error');
      }
    } catch (err) {
      setStatus(`Error adding key: ${err.message}`);
      setStatusType('error');
    }
  };
  
  // If admin is not connected, show connector
  if (!adminKey) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <p className="mb-4">Connect your Phantom wallet to manage authorized keys.</p>
        <WalletConnector onConnect={handleWalletConnect} />
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Authorized Keys for Lock: <span className="font-normal">Smart Lock</span></h2>
      
      <div className="mb-6 p-4 bg-gray-50 border-l-4 border-blue-500 text-blue-700 text-sm">
        <strong>System Status:</strong> When you use the admin panel, the system enters active monitoring mode, and the ESP32 polls more frequently for better responsiveness.
      </div>
      
      {status && <StatusMessage message={status} type={statusType} />}
      
      <div className="mb-8 p-4 border rounded">
        <h3 className="text-xl font-bold mb-4">Add New Key</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="newKeyInput" className="block mb-1">Public Key:</label>
            <input 
              id="newKeyInput"
              type="text" 
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Enter Solana public key"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="newKeyName" className="block mb-1">User Name:</label>
            <input 
              id="newKeyName"
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter user name"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="isAdmin" className="block mb-1">Admin Privileges:</label>
            <select 
              id="isAdmin"
              value={isAdmin.toString()}
              onChange={(e) => setIsAdmin(e.target.value === 'true')}
              className="w-full p-2 border rounded"
            >
              <option value="false">Regular User</option>
              <option value="true">Admin User</option>
            </select>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleAddKey}
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Add Key
            </button>
            <button 
              onClick={handleScanWallet}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Scan Wallet QR
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Authorized Keys List</h3>
        <UserTable 
          users={users} 
          adminKey={adminKey} 
          onRefresh={loadData} 
        />
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Recent Access Logs</h3>
        <AccessLogs logs={logs} />
      </div>
      
      <div className="mt-8 text-center">
        <button 
          onClick={loadData} 
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
}