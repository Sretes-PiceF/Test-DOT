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
        // ✅ 1. Cek jika token masuk blacklist database
        const blacklisted = await prisma.tokenBlacklist.findFirst({ where: { token } });
        if (blacklisted) {
            return NextResponse.json(
                { success: false, message: 'Token has been logged out / invalidated' },
                { status: 401 }
            );
        }

        // ✅ 2. Verifikasi JWT normal (karena sudah runtime nodejs, bukan edge)
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        console.log('Token valid:', decoded);

        return NextResponse.next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        return NextResponse.json(
            { success: false, message: 'Invalid or expired token' },
            { status: 401 }
        );
    }
}

// ⬅ WAJIB DITAMBAHKAN SUPAYA BISA PAKAI NODE + PRISMA + JSONWEBTOKEN
export const config = {
    matcher: ['/api/:path*'],
    runtime: 'nodejs',
};
