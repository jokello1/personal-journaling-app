'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CalendarIcon, Edit2Icon, Trash2Icon } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EntryEditor } from '@/components/EntryEditor';
import { Entry } from '@/app/lib/services/types/interfaces';

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const entryId = params.id as string;
  const queryClient = useQueryClient();

  const { data: entry, isLoading, error } = useQuery<Entry>({
    queryKey: ['entry', entryId],
    queryFn: async () => {
      const res = await fetch(`/api/entries/${entryId}`);
      if (!res.ok) throw new Error('Failed to fetch entry');
      return await res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete entry');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      router.push('/dashboard');
    },
  }
  );

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    queryClient.invalidateQueries({ queryKey: ['entry', entryId] });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-x-2">
            <Skeleton className="h-10 w-20 inline-block" />
            <Skeleton className="h-10 w-20 inline-block" />
          </div>
        </div>
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="p-4 text-red-500">
        Error loading entry. It may have been deleted or you don't have permission to view it.
      </div>
    );
  }

  if (isEditing) {
    const initialData = {
      id: entry.id,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      categoryIds: entry.categories.map((category) => category.category.id)||[],
      tagNames: entry.tags.map((tag) => tag.tag.name),
    }
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Edit Journal Entry</h1>
        <EntryEditor initialData={initialData} onSave={handleSave} onCancel={handleCancel} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-md transition-shadow p-6">
        {entry.categories && <div className='flex flex-wrap -mt-6 -ms-6 mb-0 gap-1'>
      {entry.categories?.map((category) =><div
                key={category.category.id}
                className="px-3 py-1 rounded-md text-sm w-max font-light "
                style={{
                  backgroundColor: `${category.category.color}20`,
                  color: category.category.color,
                }}
              >
               Category: {category.category.name}
              </div>
          )}</div>}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-0">
          <div>
            <h1 className="text-2xl font-bold">{entry.title}</h1>
            <div className="flex items-center text-slate-500 text-sm gap-4 mt-2">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} />
                <span>
                  Created {entry.createdAt && format(new Date(entry.createdAt), 'MMMM d, yyyy - h:mm a')}
                </span>
              </div>

              {entry.updatedAt && (
                <div>
                  Last edited {entry?.updatedAt && format(new Date(entry.updatedAt), 'MMMM d, yyyy - h:mm a')}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit} className="flex items-center gap-2">
              <Edit2Icon size={16} />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2"
            >
              <Trash2Icon size={16} />
              Delete
            </Button>
          </div>
        </div>
        <p className='py-4 border-t border-b divide-y font-light min-h-48'>{ entry.content }</p>

        <div className="gap-2">
          {entry.mood && (<div>Mood:
            <div className="px-3 py-1 bg-slate-100 rounded-md text-sm w-max mb-2 dark:bg-gray-600">
              {entry.mood}
            </div>
          </div>
          )}
          {entry.tags && entry.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <div
                    key={tag.tag.id}
                    className="px-3 py-1 bg-slate-100 rounded-full text-sm dark:bg-gray-600"
                  >
                    {tag.tag.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}