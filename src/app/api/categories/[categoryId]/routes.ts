import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CategoryService } from "@/app/lib/services/category-service";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const categoryService = new CategoryService();
const updateCategorySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  color: z.string().min(1, "Color is required").optional()
});

interface ContextParams {
  params: {
    categoryId: string;
  };
}

export async function GET(
  req: NextRequest,
  { params }: ContextParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { categoryId } = params;
    const category = await categoryService.getById(categoryId);

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: ContextParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { categoryId } = params;
    const body = await req.json();
    const validatedBody = updateCategorySchema.parse(body);

    const existingCategory = await categoryService.getById(categoryId);
    if (!existingCategory) {
      return new NextResponse("Category not found", { status: 404 });
    }

    const updatedCategory = await categoryService.update(
      categoryId,
      session.user.id,
      validatedBody
    );

    return NextResponse.json(updatedCategory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.errors), { status: 400 });
    }
    
    console.error("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: ContextParams
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { categoryId } = params;
    
    const existingCategory = await categoryService.getById(categoryId);
    if (!existingCategory) {
      return new NextResponse("Category not found", { status: 404 });
    }

    await categoryService.delete(categoryId, session.user.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}