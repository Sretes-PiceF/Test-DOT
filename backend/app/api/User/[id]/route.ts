// app/api/users/[id]/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET /api/users/[id] - Get user by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);

        if (isNaN(userId)) {
            return errorResponse('Invalid user ID', 400);
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            return errorResponse('User not found', 404);
        }

        return successResponse({ user }, 'User retrieved successfully');

    } catch (error) {
        console.error('Get user error:', error);
        return errorResponse('Failed to fetch user', 500);
    }
}

// PUT /api/users/[id] - Update user
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);
        const { email, name, role, password } = await request.json();

        if (isNaN(userId)) {
            return errorResponse('Invalid user ID', 400);
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return errorResponse('User not found', 404);
        }

        // Check if email is taken by another user
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email: email.toLowerCase().trim() }
            });

            if (emailExists) {
                return errorResponse('Email already taken', 409);
            }
        }

        // Prepare update data
        const updateData: any = {
            name: name !== undefined ? name : existingUser.name,
        };

        if (email) {
            updateData.email = email.toLowerCase().trim();
        }

        if (password) {
            if (password.length < 6) {
                return errorResponse('Password must be at least 6 characters');
            }
            updateData.password = await hashPassword(password);
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return successResponse(
            { user: updatedUser },
            'User updated successfully'
        );

    } catch (error) {
        console.error('Update user error:', error);
        return errorResponse('Failed to update user', 500);
    }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = parseInt(params.id);

        if (isNaN(userId)) {
            return errorResponse('Invalid user ID', 400);
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!existingUser) {
            return errorResponse('User not found', 404);
        }

        // Delete user
        await prisma.user.delete({
            where: { id: userId }
        });

        return successResponse(
            null,
            'User deleted successfully'
        );

    } catch (error) {
        console.error('Delete user error:', error);
        return errorResponse('Failed to delete user', 500);
    }
}