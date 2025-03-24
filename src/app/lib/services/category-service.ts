// app/services/category-service.ts
import prisma  from "@/lib/prisma";
import { Category } from "./types/interfaces";

export type CategoryCreateInput = {
  name: string;
  color: string;
  userId: string;
};

export type CategoryUpdateInput = {
  name?: string;
  color?: string;
};

export class CategoryService{
  /**
   * Create a new category
   */
  async create(data: CategoryCreateInput): Promise<Category> {
    return prisma.category.create({
      data
    });
  }

  /**
   * Get a category by id
   */
  async getById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id }
    });
  }

  /**
   * Get all categories for a user
   */
  async getAllByUserId(userId: string): Promise<Category[]> {
    return prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Update a category
   */
  async update(id: string, userId: string, data: CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({
      where: { id, userId },
      data
    });
  }

  /**
   * Delete a category
   */
  async delete(id: string, userId: string): Promise<Category> {
    return prisma.category.delete({
      where: { id, userId }
    });
  }
};