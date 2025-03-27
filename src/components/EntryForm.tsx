import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Lightbulb } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import debounce from 'lodash/debounce';
import { Category, EntryFormProps } from '@/app/lib/services/types/interfaces';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Textarea } from './ui/textarea';


export function EntryForm({ initialData, onSave, onCancel }: EntryFormProps) {
  const [content, setContent] = useState(initialData?.content || '');
  const [mood, setMood] = useState(initialData?.mood || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags?.map((t) => t.tag.name) || []);
  const [tagInput, setTagInput] = useState('');
  const [showAiSuggestions, setShowAiSuggestions] = React.useState(false);
  const [title, setTitle] = useState(initialData?.title || '');
  const [primaryCategory, setPrimaryCategory] = useState(initialData?.categoryIds[0] || '');
  const [categoriesData, setCategoriesData] = useState<Category[] | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(initialData?.categoryIds || []);

  const queryClient = useQueryClient();
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Write something amazing...'
      })
    ],
    content: initialData?.content || ""
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json() as Promise<Category[]>;
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      content: string;
      mood?: string;
      categoryIds: string[];
      tagNames: string[];
    }) => {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("An error occurred while saving the entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      onSave();
      toast("Journal created successfully");
    },
    onError: (error: Error) => {
      console.log("Error creating entries: ",error);
      toast(error.message);
    }
  });

  interface UpdateEntryMutationData {
    id: string;
    title: string;
    content: string;
    mood?: string;
    categoryIds: string[];
    tagNames: string[];
  }
  const updateEntryMutation = useMutation({
    mutationFn: async (data: UpdateEntryMutationData) => {
      const response = await fetch(`/api/entries/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error("An error occurred while updating the entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      onSave();
      toast("Journal updated successfully");
    },
    onError: (error: Error) => {
      toast(error.message);
    }
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast("Please enter a title for your entry");
      return;
    }


    const entryData = {
      title,
      content: content,
      mood: mood || undefined,
      categoryIds: selectedCategoryIds,
      tagNames: tags
    }

    if (initialData?.id) {
      updateEntryMutation.mutate({
        id: initialData?.id,
        ...entryData
      } as UpdateEntryMutationData);
    } else {
      createEntryMutation.mutate(entryData);
    }
  }

  const debouncedAnalyze = React.useCallback(
    debounce((content: string) => {
      if (content.length > 100) {
        analyzeContent();
      }
    }, 1500),
    [tags]
  );

  useEffect(() => {
    debouncedAnalyze(content);
      setSelectedCategoryIds([primaryCategory]);
    if (categories){
      setCategoriesData(categories);
      setCategoriesLoading(false);
    }

  }, [content, debouncedAnalyze,categories,primaryCategory]);

  const {
    data: analysis,
    isLoading: isAnalyzing,
    refetch: analyzeContent,
  } = useQuery({
    queryKey: ['entryAnalysis', content.substring(0, 100)],
    queryFn: async () => {
      if (content.length < 100) return null;

      const res = await fetch('/api/entries/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          existingTags: tags,
        }),
      });

      if (!res.ok) throw new Error('Failed to analyze content');
      return res.json();
    },
    enabled: false,
  });

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const addSuggestedTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const applyMoodSuggestion = () => {
    if (analysis?.suggestedMood) {
      setMood(analysis.suggestedMood);
    }
  };


  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Entry title"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="content">Content</Label>

          {content.length > 100 && (
            <Popover open={showAiSuggestions} onOpenChange={setShowAiSuggestions}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                >
                  <Lightbulb size={16} />
                  AI Suggestions
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Content Analysis</h4>

                  {isAnalyzing ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Detected Mood:</span>
                          <span className="font-medium">{analysis?.suggestedMood || 'Neutral'}</span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={applyMoodSuggestion}
                          disabled={!analysis?.suggestedMood}
                        >
                          Apply Suggested Mood
                        </Button>
                      </div>

                      {analysis?.suggestedTags && analysis.suggestedTags.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm">Suggested Tags:</div>
                          <div className="flex flex-wrap gap-1">
                            {analysis.suggestedTags.map((tag:string) => (
                              <Button
                                key={tag}
                                variant="secondary"
                                size="sm"
                                className="text-xs"
                                onClick={() => addSuggestedTag(tag)}
                              >
                                + {tag}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <div className="space-y-2">
          <div className="border rounded-md p-3 min-h-[200px]">
            {/* <EditorContent editor={editor} className="prose max-w-none" /> */}
            <Textarea value={content} className='min-h-[196px] w-full' onChange={(e)=>setContent(e.target.value)}/>
          
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="primary-category">Primary Category</Label>
          <Select
            value={primaryCategory}
            onValueChange={setPrimaryCategory}
          >
            <SelectTrigger id="primary-category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent >
              {categoriesLoading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : categoriesData ? (
                categoriesData.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="error" disabled>
                  No categories found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mood">Mood</Label>
          <Select value={mood} onValueChange={setMood}>
            <SelectTrigger id="mood">
              <SelectValue placeholder="How are you feeling?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Happy">Happy</SelectItem>
              <SelectItem value="Calm">Calm</SelectItem>
              <SelectItem value="Productive">Productive</SelectItem>
              <SelectItem value="Excited">Excited</SelectItem>
              <SelectItem value="Anxious">Anxious</SelectItem>
              <SelectItem value="Sad">Sad</SelectItem>
              <SelectItem value="Tired">Tired</SelectItem>
              <SelectItem value="Angry">Angry</SelectItem>
              <SelectItem value="Stressed">Stressed</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tags"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" onClick={addTag}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-slate-500 hover:text-slate-700"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={()=>handleSave()}
          disabled={createEntryMutation.status === 'pending' || updateEntryMutation.status === 'pending'}
        >
          {createEntryMutation.status === 'pending' || updateEntryMutation.status === 'pending'
            ? 'Saving...'
            : initialData?.id
              ? 'Update Entry'
              : 'Save Entry'}
        </Button>
      </div>
    </div>
  );
}