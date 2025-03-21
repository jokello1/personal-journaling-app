
'use client';
import { EntryEditorProps } from "@/app/lib/services/types/interfaces";
import { useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { useMutation, useQueryClient } from 'react-query';
import { useToast } from '@/components/ui/use-toast';
import { title } from "process";

export function EntryEditor({ initialData, categories, onSave, onCancel }: EntryEditorProps) {
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(initialData?.categoryIds || []);
    const [tagInput, setTagInput] = useState("");
    const [mood, setMood] = useState(initialData?.mood || '')
    const [title, setTitle] = useState(initialData?.title || '')
    const [tags, setTags] = useState(initialData?.tagNames || [])

    const {toast} = useToast();
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

    const createEntryMutation = useMutation(async (data: {
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
        if(!response.ok){
            throw new Error("An error occurred while saving the entry");
        }
        return response.json();
    }
    , {
        onSuccess: () => {
            queryClient.invalidateQueries("entries");
            onSave();
            toast({
                title: "Entry created",
                description: "Journal created successfully"
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: 'destructive'
            });
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
    const updateEntryMutation = useMutation(async (data: UpdateEntryMutationData) => {
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
    }, {
        onSuccess: () => {
            queryClient.invalidateQueries("entries");
            onSave();
            toast({
                title: "Entry updated",
                description: "Journal updated successfully"
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: 'destructive'
            });
        }
    });
    
    const handleSave = () => {
        if(!title.trim()){
            toast({
                title: "Error",
                description: "Please enter a title for your entry",
                variant: 'destructive'
            });
            return;
        }

        if(!editor?.getHTML() || editor.getHTML().trim() === "<p></p>"){
            toast({
                title: "Error",
                description: "Please enter some content for your entry",
                variant: 'destructive'
            });
            return;
        }

        const entryData = {
            title,
            content: editor.getHTML(),
            mood: mood || undefined,
            categoryIds: selectedCategoryIds,
            tagNames: tags
        }
        
        if(initialEntryData?.id){
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
                <EditorContent editor={editor} className="prose max-w-none"/>
            </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="mood">Mood (Optional)</Label>
            <Input id="mood" value={mood} onChange={(e)=>e.target.value} placeholder="How are you feeling?"/>
        </div>

        <div className="space-y-2">
            <Label htmlFor="categories">Categories</Label>
            <div className="flex flex-wrap gap-2">
                {categories.map((category)=>(
                    <Button key={category.id}
                        variant={selectedCategoryIds.includes(category.id)? "default":"outline"}
                        onClick={()=>{
                            if(selectedCategoryIds.includes(category.id)){
                                setSelectedCategoryIds(selectedCategoryIds.filter((id)=>id !== category.id))
                            } else {
                                setSelectedCategoryIds([...selectedCategoryIds, category.id])
                            }
                        }}
                        className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: category.color}}>{category.name}</div>
                        </Button>
                ))}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex items-center gap-2">
                <Input id="tags" value={tagInput} onChange={(e)=>{
                    if(e.key === 'Enter'){
                        e.preventDefault()
                        addTag()
                    }
                }}/>
                <Button type="button" onClick={addTag}>Add Tag</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {
                    tags.map((tag)=>(
                        <div key={tag} className="bg-slate-100 px-3 py-1 rounded-full flex items-center gap-2">
                            <span>{tag}</span>
                            <button type="button" onClick={()=>removeTag(tag)} className="text-slate-500 hover:text-slate-700">
                                &times;
                            </button>
                        </div>
                    ))
                }
            </div>
        </div>
        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSave} disabled={createEntryMutation.isLoading || updateEntryMutation.isLoading}>
                {createEntryMutation.isLoading || updateEntryMutation.isLoading ? 'Saving...': initialData?.id ? "Update Entry" : "Save Entry"} 
            </Button>
        </div>
    </div>
}