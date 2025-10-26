// app/api/test-token/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { success: false, message: 'Only available in development mode' },
            { status: 403 }
        );
    }

    try {
        // Cleanup expired tokens from blacklist
        const result = await prisma.tokenBlacklist.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        // Juga bisa clear semua data testing
        const { searchParams } = new URL(request.url);
        const clearAll = searchParams.get('clearAll');

        let allResult = null;
        if (clearAll === 'true') {
            allResult = await prisma.tokenBlacklist.deleteMany({
                where: {
                    OR: [
                        { reason: 'AUTO_EXPIRED' },
                        { reason: 'TEST' }
                    ]
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                expired_cleaned: result.count,
                all_test_cleaned: allResult?.count || 0,
                message: `Cleaned ${result.count} expired tokens from blacklist`
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}