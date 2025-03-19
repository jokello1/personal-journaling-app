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