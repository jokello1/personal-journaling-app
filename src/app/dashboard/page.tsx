'use client';

import { useRouter } from 'next/navigation';
import { EntryList } from '@/components/EntryList';

export default function DashboardPage() {
  const router = useRouter();
  
  const handleEntryClick = (entryId: string) => {
    router.push(`/dashboard/entries/${entryId}`);
  };
  
  const handleNewEntry = () => {
    router.push('/dashboard/entries/new');
  };
  
  return (
    <div>
      <EntryList onEntryClick={handleEntryClick} onNewEntry={handleNewEntry} />
    </div>
  );
}