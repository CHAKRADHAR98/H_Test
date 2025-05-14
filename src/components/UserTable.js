'use client';

import { useState } from 'react';
import StatusMessage from './StatusMessage';

export default function UserTable({ users, adminKey, onRefresh }) {
  const [status, setStatus] = useState(null);
  const [statusType, setStatusType] = useState('info');
  
  // Function to shorten public key for display
  const shortenKey = (key) => {
    if (key.length <= 16) return key;
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };
  
  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };
  
  // Handle rename
  const handleRename = async (publicKey) => {
    const newName = prompt('Enter new name for this user:');
    
    if (!newName) return;
    
    try {
      setStatus('Renaming user...');
      setStatusType('info');
      
      const response = await fetch('/api/keys/rename', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          publicKey,
          name: newName
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus('User renamed successfully');
        setStatusType('success');
        
        // Refresh data
        if (onRefresh) onRefresh();
      } else {
        setStatus(`Failed to rename user: ${result.error || 'Unknown error'}`);
        setStatusType('error');
      }
    } catch (err) {
      setStatus(`Error renaming user: ${err.message}`);
      setStatusType('error');
    }
  };
  
  // Handle remove
  const handleRemove = async (publicKey) => {
    if (!confirm('Are you sure you want to remove this key?')) return;
    
    try {
      setStatus('Removing key...');
      setStatusType('info');
      
      const response = await fetch('/api/keys/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminKey}`
        },
        body: JSON.stringify({
          lockId: 'lock001',
          publicKey
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus('Key removed successfully');
        setStatusType('success');
        
        // Refresh data
        if (onRefresh) onRefresh();
      } else {
        setStatus(`Failed to remove key: ${result.error || 'Unknown error'}`);
        setStatusType('error');
      }
    } catch (err) {
      setStatus(`Error removing key: ${err.message}`);
      setStatusType('error');
    }
  };
  
  if (!users || users.length === 0) {
    return <p className="text-gray-500">No users found.</p>;
  }
  
  return (
    <div>
      {status && <StatusMessage message={status} type={statusType} />}
      
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">User Name</th>
              <th className="border px-4 py-2 text-left">Public Key</th>
              <th className="border px-4 py-2 text-left">Role</th>
              <th className="border px-4 py-2 text-left">Date Added</th>
              <th className="border px-4 py-2 text-left">Last Access</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.publicKey} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{user.name}</td>
                <td className="border px-4 py-2">{shortenKey(user.publicKey)}</td>
                <td className="border px-4 py-2">{user.isAdmin ? 'Admin' : 'Regular User'}</td>
                <td className="border px-4 py-2">{formatDate(user.dateAdded)}</td>
                <td className="border px-4 py-2">{user.lastAccess ? formatDate(user.lastAccess) : 'Never'}</td>
                <td className="border px-4 py-2">
                  <button 
                    onClick={() => handleRename(user.publicKey)}
                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-sm"
                  >
                    Rename
                  </button>
                  <button 
                    onClick={() => handleRemove(user.publicKey)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}