'use client';

import { useRouter } from 'next/navigation';
import { EntryForm } from '@/components/EntryForm';

export default function NewEntryPage() {
  const router = useRouter();
  
  const handleSave = () => {
    router.push('/dashboard');
  };
  
  const handleCancel = () => {
    router.push('/dashboard');
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Journal Entry</h1>
      <EntryForm onSave={handleSave} onCancel={handleCancel} />
    </div>
  );
}