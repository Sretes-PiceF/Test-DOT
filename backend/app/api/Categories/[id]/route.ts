// app/api/categories/[id]/route.ts
import { NextRequest } from 'next/server';
import {
    getCategoryById,
    updateCategory,
    deleteCategory
} from '@/lib/categories-service';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const categories_id = params.id; // ← lowercase

        if (!categories_id) {
            return errorResponse('Category ID is required', 400);
        }

        const category = await getCategoryById(categories_id);

        if (!category) {
            return errorResponse('Category not found', 404);
        }

        return successResponse({ category }, 'Category retrieved successfully');

    } catch (error) {
        console.error('Get category error:', error);
        return errorResponse('Failed to fetch category', 500);
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const categories_id = params.id; // ← lowercase
        const { categories_name } = await request.json(); // ← lowercase

        if (!categories_id) {
            return errorResponse('Category ID is required', 400);
        }

        const existingCategory = await getCategoryById(categories_id);
        if (!existingCategory) {
            return errorResponse('Category not found', 404);
        }

        if (!categories_name || categories_name.trim() === '') {
            return errorResponse('Category name is required');
        }

        const updatedCategory = await updateCategory(categories_id, {
            categories_name: categories_name.trim(),
        });

        if (!updatedCategory) {
            return errorResponse('Failed to update category', 500);
        }

        return successResponse(
            { category: updatedCategory },
            'Category updated successfully'
        );

    } catch (error) {
        console.error('Update category error:', error);
        return errorResponse('Failed to update category', 500);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const categories_id = params.id; // ← lowercase

        if (!categories_id) {
            return errorResponse('Category ID is required', 400);
        }

        const existingCategory = await getCategoryById(categories_id);
        if (!existingCategory) {
            return errorResponse('Category not found', 404);
        }

        const success = await deleteCategory(categories_id);

        if (!success) {
            return errorResponse('Failed to delete category', 500);
        }

        return successResponse(
            null,
            'Category deleted successfully'
        );

    } catch (error) {
        console.error('Delete category error:', error);
        return errorResponse('Failed to delete category', 500);
    }
}