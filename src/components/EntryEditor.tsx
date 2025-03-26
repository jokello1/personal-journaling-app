'use client';
import { Category, EntryEditorProps } from "@/app/lib/services/types/interfaces";
import { useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Textarea } from "./ui/textarea";

export function EntryEditor({ initialData, onSave, onCancel }: EntryEditorProps) {
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(initialData?.categoryIds || []);
    const [tagInput, setTagInput] = useState("");
    const [mood, setMood] = useState(initialData?.mood || '')
    const [title, setTitle] = useState(initialData?.title || '')
    const [tags, setTags] = useState(initialData?.tagNames || [])
    const [content,setContent]=useState(initialData?.content)

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
    const { data: categories, isLoading, error } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: async () => {
          const res = await fetch(`/api/categories`);
          if (!res.ok) throw new Error('Failed to fetch entry');
          return await res.json();
        }
      });

    const createEntryMutation = useMutation({
        mutationFn:async (data: {
        title: string;
        content: string | undefined;
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
        if(!response.ok){
            throw new Error("An error occurred while saving the entry");
        }
        return response.json();
    }, 
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["entries"]});
            onSave();
            toast( "Journal created successfully");
        },
        onError: (error: Error) => {
            toast( error.message);
        }
    });

    interface UpdateEntryMutationData{
        id: string;
        title: string;
        content: string;
        mood?: string;
        categoryIds: string[];
        tagNames: string[];
    }
    const updateEntryMutation = useMutation({
        mutationFn:async (data: UpdateEntryMutationData) => {
        const response = await fetch(`/api/entries/${data.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if(!response.ok){
            throw new Error("An error occurred while updating the entry");
        }
        return response.json();
    },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:["entries"]});
            onSave();
            toast( "Journal updated successfully");
        },
        onError: (error: Error) => {
            toast(error.message);
        }
    });
    
    const handleSave = () => {
        if(!title.trim()){
            toast("Please enter a title for your entry");
            return;
        }

        // if(!editor?.getHTML() || editor.getHTML().trim() === "<p></p>"){
        //     toast("Please enter some content for your entry");
        //     return;
        // }

        const entryData = {
            title,
            content: content,
            mood: mood || undefined,
            categoryIds: selectedCategoryIds,
            tagNames: tags
        }
        
        if(initialData?.id){
            updateEntryMutation.mutate({
                id: initialData?.id,
                ...entryData
            } as UpdateEntryMutationData);
        } else {
            createEntryMutation.mutate(entryData);
        }
    }
    const addTag = () => {
        if(tagInput.trim() && !tags.includes(tagInput.trim())){
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    }
    const removeTag = (tag: string)=>{
        setTags(tags.filter((t)=>t!==tag))
    }

    return <div className="space-y-5">
        <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Entry title"/>
        </div>

        <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <div className="border rounded-md p-3 min-h-[200px]">
                {/* <EditorContent editor={editor} className="prose max-w-none"/> */}
                <Textarea value={content} className='min-h-[196px] w-full' onChange={(e)=>setContent(e.target.value)}/>
          
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="mood">Mood (Optional)</Label>
            <Input id="mood" value={mood} onChange={(e)=>e.target.value} placeholder="How are you feeling?"/>
        </div>

        <div className="space-y-2">
            <Label htmlFor="categories">Categories</Label>
            <div className="flex flex-wrap gap-2">
                {categories?.map((category)=>(
                    <Button key={category?.id}
                        variant={selectedCategoryIds.includes(category.id)? "default":"outline"}
                        disabled={selectedCategoryIds.includes(category.id)}
                        onClick={()=>{
                            if(selectedCategoryIds.includes(category.id)){
                                setSelectedCategoryIds(selectedCategoryIds.filter((id)=>id !== category.id))
                            } else {
                                setSelectedCategoryIds([...selectedCategoryIds, category.id])
                            }
                        }}
                        className="flex items-center gap-2" style={{backgroundColor: category.color}}>
                            <div className="w-max rounded-full">{category.name}</div>
                        </Button>
                ))}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex items-center gap-2">
                <Input id="tags" value={tagInput} onChange={(e)=>{
                    setTagInput(e.target.value)
                }}/>
                <Button type="button" onClick={addTag} className="bg-indigo-600 hover:bg-indigo-700">Add Tag</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {
                    tags.map((tag)=>(
                        <div key={tag} className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2 dark:bg-gray-600">
                            <span>{tag}</span>
                            <button type="button" onClick={()=>removeTag(tag)} className="text-slate-500 hover:text-slate-700 dark:text-gray-100">
                                &times;
                            </button>
                        </div>
                    ))
                }
            </div>
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSave} disabled={createEntryMutation.status === "pending" || updateEntryMutation.status === "pending"} className="bg-indigo-600 hover:bg-indigo-700">
                {createEntryMutation.status === "pending" || updateEntryMutation.status === "pending" ? 'Saving...': initialData?.id ? "Update Entry" : "Save Entry"} 
            </Button>
        </div>
    </div>
}