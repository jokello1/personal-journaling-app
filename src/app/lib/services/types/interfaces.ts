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

export interface EntryFormProps {
  initialData?: {
      id?: string;
      title: string;
      content: string;
      mood: string;
      tags: EntryTag[]
      categoryIds: string[];
      tagNames: string[];
  },
  onSave: () => void;
  onCancel: () => void;
}

export interface EntryListProps {
    onEntryClick: (entryId: string) => void;
    onNewEntry: () => void;
  }
  

export interface Tag {
    id: string;
    name: string;
  }
  
export interface EntryCategory {
    category: Category;
    primary: boolean;
  }
  
export interface EntryTag {
    tag: Tag;
  }
  
export interface Entry {
    id: string;
    title: string;
    content: string;
    mood?: string;
    createdAt: string;
    updatedAt: string;
    categories: EntryCategory[];
    tags: EntryTag[];
  }
  
  export interface EntriesResponse {
    entries: Entry[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }