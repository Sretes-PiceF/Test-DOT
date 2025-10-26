// lib/categories-service.ts
import { prisma } from './db';
import { Categories, CreateCategoriesRequest, UpdateCategoriesRequest } from '@/types/Categories';

export async function getCategories(
    page: number = 1,
    limit: number = 10,
    search: string = ''
): Promise<{ categories: Categories[]; total: number }> {
    const skip = (page - 1) * limit;

    const where = search
        ? { categories_name: { contains: search, mode: 'insensitive' as const } }
        : {};

    const [categories, total] = await Promise.all([
        prisma.categories.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.categories.count({ where }),
    ]);

    return { categories, total };
}

export async function getCategoryById(categories_id: string): Promise<Categories | null> {
    return prisma.categories.findUnique({ where: { categories_id } });
}


export async function createCategory(data: CreateCategoriesRequest): Promise<Categories> {
    return prisma.categories.create({
        data: {
            categories_name: data.categories_name,
        },
    });
}

export async function updateCategory(categories_id: string, data: UpdateCategoriesRequest): Promise<Categories | null> {
    try {
        return await prisma.categories.update({
            where: { categories_id },
            data: { categories_name: data.categories_name },
        });
    } catch (error) {
        console.error('Update category error:', error);
        return null;
    }
}

export async function deleteCategory(categories_id: string): Promise<boolean> {
    try {
        await prisma.categories.delete({ where: { categories_id } });
        return true;
    } catch (error) {
        console.error('Delete category error:', error);
        return false;
    }
}
