import { CreateEntryInput, UpdateEntryInput } from "./types/interfaces";
import prisma from "@/lib/prisma";

export class EntryService {
    async createEntry(create_entry_input: CreateEntryInput) {
        const { title, content, userId, mood, categoryIds, tagNames } = create_entry_input;
        console.log("Create Entry Input:", create_entry_input);
        const tagObjs = await Promise.all(
            tagNames.map(async (tagName) => {
                const existingTag = await prisma.tag.findFirst({
                    where: { name:tagName, userId }
                });
                if (existingTag) { return existingTag; }
                return prisma.tag.create({
                    data: { name: tagName, userId }
                });
            })
        );
        const tagIds = tagObjs.map((tag) => tag.id);

        const entry = await prisma.entry.create({
            data: {
                title,
                content,
                mood,
                userId,
                categories: {
                    create: categoryIds.map((categoryId) => ({ categoryId}))
                },
                tags: {
                    create: tagIds.map((tagId) => ({ tagId }))
                },
            },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
        return entry;
    }
    async updateEntry(update_entry_input: UpdateEntryInput) {
        const { id, title, content, mood, categoryIds, tagNames } = update_entry_input;

        const entry = await prisma.entry.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!entry) { throw new Error("Entry not found"); }

        const userId = entry.userId;

        const updateData: any = {};
        if (title) { updateData.title = title; }
        if (content) { updateData.content = content; }
        if (mood) { updateData.mood = mood; }

        if (categoryIds) {
            await prisma.entryCategory.deleteMany({
                where: { entryId: id }
            });
        
            await Promise.all(
                categoryIds.map(async (categoryId, index) => {
                    await prisma.entryCategory.create({
                        data: {
                            entryId: id,
                            categoryId,
                            // primary: index === 0
                        }
                    });
                })
            )
        }
        if (tagNames){
            await prisma.entryTag.deleteMany({
                where: { entryId: id }
            });
            const tagObjs = await Promise.all(
                tagNames.map(async (tagName) => {
                    const existingTag = await prisma.tag.findFirst({
                        where: { name: tagName, userId }
                    });
                    if (existingTag) { return existingTag; }
                    return prisma.tag.create({
                        data: { name: tagName, userId }
                    });
                })
            )
            await Promise.all(
                tagObjs.map(async (tag) => {
                    await prisma.entryTag.create({
                        data: { entryId: id, tagId: tag.id }
                    });
                })
            )   
        }
        const updatedEntry = await prisma.entry.update({
            where: { id },
            data: updateData,
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
        return updatedEntry;   
    }
    async deleteEntry(id: string) {
        const entry = await prisma.entry.findUnique({
            where: { id }
        });
        if (!entry) { throw new Error("Entry not found"); }
        await prisma.entry.delete({
            where: { id }
        });
        return id;
    }
    
    async getEntry(id: string) {
        const entry = await prisma.entry.findUnique({
            where: { id },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                tags: {
                    include: {
                        tag: true
                    }
                }
            }
        });
        if (!entry) { throw new Error("Entry not found"); }
        return entry;
    }

    async getUserEntries(userId: string, options:{
        page?: number;
        limit?: number;
        categoryId?: string;
        tagId?: string;
        searchTerm?: string;
        startDate?: Date;
        endDate?: Date;
    }) {
        const { page = 1, limit = 10, categoryId, tagId, searchTerm, startDate, endDate } = options;
        const offset = (page - 1) * limit;
        const where: any = { userId };
        if (categoryId){
            where.categories =  { some: {categoryId}}
        }
        if (tagId){
            where.tags = { some: { tagId }}
        }
        if (searchTerm){
            where.OR = [
                { title: { contains: searchTerm, mode: 'insensitive'} },
                { content: { contains: searchTerm, mode: 'insensitive' } }
            ]
        }
        if (startDate){
            where.createdAt = { ...where.createAt, gte: startDate }
        }
        if (endDate){
            where.createdAt = { ...where.createAt, lte: endDate }
        }
        const [entries, totalCount] = await Promise.all([
            prisma.entry.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    categories: {
                        include: {
                            category: true
                        }
                    },
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            }),
            prisma.entry.count({ where })
        ]);
        return { entries,
            pagination: {
                totalCount,
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit)
            }
         };
    }

}