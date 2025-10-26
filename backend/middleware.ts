// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

export async function middleware(request: NextRequest) {
    const protectedRoutes = ['/api/Product', '/api/Categories'];

    if (!protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
        return NextResponse.next();
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
            { success: false, message: 'Access token required' },
            { status: 401 }
        );
    }

    const token = authHeader.split(' ')[1];

    try {
        // 1. Bersihkan token expired dari blacklist terlebih dahulu
        await prisma.tokenBlacklist.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        // 2. Cek jika token masuk blacklist database
        const blacklisted = await prisma.tokenBlacklist.findUnique({
            where: { token }
        });
        if (blacklisted) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Token has been logged out / invalidated'
                },
                { status: 401 }
            );
        }

        // 3. Verifikasi JWT normal
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        console.log('Token valid:', decoded);

        return NextResponse.next();
    } catch (error: any) {
        console.error('JWT Verification Error:', error);

        // Handle token expired secara spesifik
        if (error.name === 'TokenExpiredError') {
            // Auto-blacklist token expired di middleware juga
            try {
                await prisma.tokenBlacklist.upsert({
                    where: { token },
                    update: {
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        reason: 'AUTO_EXPIRED'
                    },
                    create: {
                        token,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        reason: 'AUTO_EXPIRED'
                    }
                });
            } catch (blacklistError) {
                console.error('Failed to auto-blacklist expired token:', blacklistError);
            }

            return NextResponse.json(
                {
                    success: false,
                    message: 'Token expired. Please login again.'
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Invalid or expired token' },
            { status: 401 }
        );
    }
}

export const config = {
    matcher: ['/api/:path*'],
    runtime: 'nodejs',
};