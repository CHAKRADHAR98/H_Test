'use client';

import Link from 'next/link';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  return (
    <main className="p-4">
      <div className="max-w-4xl mx-auto mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          &larr; Back to Lock Interface
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-center mb-8">Smart Lock Admin Panel</h1>
      
      <AdminPanel />
    </main>
  );
}