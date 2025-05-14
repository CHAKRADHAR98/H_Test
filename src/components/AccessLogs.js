'use client';

export default function AccessLogs({ logs }) {
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
  
  if (!logs || logs.length === 0) {
    return <p className="text-gray-500">No access logs available.</p>;
  }
  
  return (
    <div className="max-h-[300px] overflow-y-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Time</th>
            <th className="border px-4 py-2 text-left">User</th>
            <th className="border px-4 py-2 text-left">Public Key</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{formatDate(log.timestamp)}</td>
              <td className="border px-4 py-2">{log.userName}</td>
              <td className="border px-4 py-2">{shortenKey(log.publicKey)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}