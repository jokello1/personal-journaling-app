import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CategoryService } from "@/app/lib/services/category-service";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
const categoryService = new CategoryService();
const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().min(1, "Color is required")
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const categories = await categoryService.getAllByUserId(session.user.id);
    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedBody = createCategorySchema.parse(body);

    const category = await categoryService.create({
      ...validatedBody,
      userId: session.user.id
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}