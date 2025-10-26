// app/api/Categories/route.ts
import { NextRequest } from 'next/server';
import { getCategories, createCategory } from '@/lib/categories-service';
import { verifyToken } from '@/lib/auth'; // ← IMPORTANT: Import verifyToken
import { successResponse, errorResponse } from '@/lib/api-response';

// GET /api/Categories - Get all categories
export async function GET(request: NextRequest) {
    try {
        // CEK TOKEN
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse('Access token required', 401);
        }

        const token = authHeader.replace('Bearer ', '');
        await verifyToken(token); // ← Cek blacklist

        // Lanjutkan business logic
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const { categories, total } = await getCategories(page, limit, search);

        const totalPages = Math.ceil(total / limit);

        return successResponse({
            categories,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            }
        }, 'Categories retrieved successfully');

    } catch (error: any) {
        console.error('Get categories error:', error);
        if (error.message.includes('Token') || error.message.includes('invalid')) {
            return errorResponse('Invalid or expired token', 401);
        }
        return errorResponse('Failed to fetch categories', 500);
    }
}

// POST /api/Categories - Create new category
export async function POST(request: NextRequest) {
    try {
        // CEK TOKEN
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse('Access token required', 401);
        }

        const token = authHeader.replace('Bearer ', '');
        await verifyToken(token);

        const { categories_name } = await request.json();

        if (!categories_name || categories_name.trim() === '') {
            return errorResponse('Category name is required');
        }

        const category = await createCategory({
            categories_name: categories_name.trim(),
        });

        return successResponse(
            { category },
            'Category created successfully',
        );

    } catch (error: any) {
        console.error('Create category error:', error);
        if (error.message.includes('Token') || error.message.includes('invalid')) {
            return errorResponse('Invalid or expired token', 401);
        }
        return errorResponse(error.message || 'Failed to create category', 500);
    }
}