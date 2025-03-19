export interface CreateEntryInput {
    title: string;
    content: string;
    userId: string;
    mood?: string;
    categoryIds: string[];
    tagNames: string[];
}

export interface UpdateEntryInput {
    id: string;
    title?: string;
    content?: string;
    mood?: string;
    categoryIds?: string[];
    tagNames?: string[];
}

export interface Category {
    id: string;
    name: string;
    color: string;
}

export interface EntryEditorProps {
    initialData?: {
        id?: string;
        title: string;
        content: string;
        mood: string;
        categoryIds: string[];
        tagNames: string[];
    },
    categories: Category[];
    onSave: () => void;
    onCancel: () => void;
}