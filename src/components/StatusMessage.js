'use client';

import { useState, useEffect } from 'react';

export default function StatusMessage({ message, type, autoHide = true }) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    // Reset visibility when message changes
    setVisible(true);
    
    // Auto-hide after 5 seconds if autoHide is true
    if (autoHide && message) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [message, autoHide]);
  
  if (!message || !visible) return null;
  
  const typeClasses = {
    success: 'bg-green-100 text-green-700 border-green-300',
    error: 'bg-red-100 text-red-700 border-red-300',
    info: 'bg-blue-100 text-blue-700 border-blue-300'
  };
  
  const classes = `p-4 mb-4 border rounded-md ${typeClasses[type] || typeClasses.info}`;
  
  return (
    <div className={classes} role="alert">
      {message}
    </div>
  );
}