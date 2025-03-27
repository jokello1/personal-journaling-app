import { EntryService } from "@/app/lib/services/entry.services";
import { getServerSession } from "next-auth";
import { z as zod} from "zod";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { UpdateEntryInput } from "@/app/lib/services/types/interfaces";

const entryService = new EntryService();

const updateEntrySchema = zod.object({
    title: zod.string().min(3).max(255).optional(),
    content: zod.string().min(1).optional(),
    mood: zod.string().nullable(),
    categoryIds: zod.array(zod.string().uuid()).optional(),
    tagNames: zod.array(zod.string()).min(1).optional()
});

export async function GET(request: Request, {params}: {params: {id: string}}) {
    try{
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({error: "Unauthorized"}, { status: 401 });
        }
        const entry = await entryService.getEntry(params.id);
        if(entry.userId !== session.user.id){
            return NextResponse.json({error: "Forbidden"}, { status: 403 });
        }
        return NextResponse.json(entry, { status: 200 });
    } catch(error) {
        return NextResponse.json({error: "Invalid request"}, { status: 500 });
    }
}

export async function PUT(request: Request, {params}: {params: {id: string}}) {
    try{
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({error: "Unauthorized"}, { status: 401 });
        }
        const body = await request.json();
        const validatedData = updateEntrySchema.parse(body);
        const entry = await entryService.getEntry(params.id);
        if(entry.userId !== session.user.id){
            return NextResponse.json({error: "Forbidden"}, { status: 403 });
        }
        const updatedEntry = await entryService.updateEntry({
            id: params.id,
            ...validatedData
        } as UpdateEntryInput);
        return NextResponse.json(updatedEntry, { status: 200 });
    } catch(error) {
        if(error instanceof zod.ZodError){
            return NextResponse.json({error: error.errors}, { status: 400 });
        }
        return NextResponse.json({error: "Invalid request body"}, { status: 500 });
    }
}

export async function DELETE(request: Request, {params}: {params: {id: string}}) {
    try{
        const session = await getServerSession(authOptions);
        if(!session){
            return NextResponse.json({error: "Unauthorized"}, { status: 401 });
        }
        const entry = await entryService.getEntry(params?.id);
        if(entry.userId !== session.user.id){
            return NextResponse.json({error: "Forbidden"}, { status: 403 });
        }
        await entryService.deleteEntry(params.id);
        return NextResponse.json({message: "Entry deleted"}, { status: 200 });
    }
    catch(error) {
        return NextResponse.json({error: "Invalid request"}, { status: 500 });
    }
}