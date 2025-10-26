// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password, name } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { success: false, message: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: email.toLowerCase().trim()
            }
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: 'User already exists with this email' },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                name: name || null
            }
        });

        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            createdAt: user.createdAt
        };

        return NextResponse.json({
            success: true,
            message: 'Registration successful',
            data: {
                user: userData
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json(
        { success: false, message: 'Method not allowed' },
        { status: 405 }
    );
}