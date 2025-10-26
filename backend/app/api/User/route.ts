// app/api/users/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { successResponse, errorResponse } from '@/lib/api-response';
import { Prisma } from '@prisma/client';

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        // Build where condition for search
        let where: Prisma.UserWhereInput = {};

        // Get users without passwords
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });

        // Get total count for pagination
        const total = await prisma.user.count({ where });
        const totalPages = Math.ceil(total / limit);

        return successResponse({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            }
        }, 'Users retrieved successfully');

    } catch (error) {
        console.error('Get users error:', error);
        return errorResponse('Failed to fetch users', 500);
    }
}