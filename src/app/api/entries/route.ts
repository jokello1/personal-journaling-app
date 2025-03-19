import { EntryService } from "@/app/lib/services/entry.services";
import { getServerSession } from "next-auth";
import { z as zod } from "zod";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

const entryService = new EntryService();

const createEntrySchema = zod.object({
    title: zod.string().min(3).max(255),
    content: zod.string().min(1),
    mood: zod.string().optional(),
    categoryIds: zod.array(zod.string().uuid()),
    tagNames: zod.array(zod.string()).min(1)
});

export async function createEntry(request: Request) {
    try{
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({error:"Unauthorized"}, { status: 401 })
        }
        const body = await request.json();
        const validatedData = createEntrySchema.parse(body);
        const entry = await entryService.createEntry({
            ...validatedData,
            userId: session.user.id
        });
        return NextResponse.json(entry, { status: 201 });
    } catch(error) {
        if(error instanceof zod.ZodError) {
            return NextResponse.json({error: error.errors}, { status: 400 })
        }
        return NextResponse.json({error: "Invalid request body"}, { status: 500 })
    }
}

export async function getUserEntries(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if(!session) {
            return NextResponse.json({error:"Unauthorized"}, { status: 401 })
        }

        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") ? parseInt(searchParams.get("page") as string) : 1;
        const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : 10;
        const categoryId = searchParams.get("categoryId") || undefined;
        const tagId = searchParams.get("tagId") || undefined;
        const searchTerm = searchParams.get("search") || undefined;
        const startDate = (new Date(searchParams.get("startDate") as string)) ||  undefined;
        const endDate = (new Date(searchParams.get("endDate") as string)) || undefined;
        
        const result = await entryService.getUserEntries(session.user.id, {
            page,
            limit,
            categoryId,
            tagId,
            searchTerm,
            startDate,
            endDate
        });
        return NextResponse.json(result, { status: 200 });
    } catch(error) {
        console.error("Error fetching user entries", error);
        return NextResponse.json({error: "Internal server error"}, { status: 500 })
    }
}