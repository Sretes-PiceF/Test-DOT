// app/api/test-token/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { success: false, message: 'Only available in development mode' },
            { status: 403 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Token parameter required' },
                { status: 400 }
            );
        }

        // 1. Check blacklist status
        const blacklisted = await prisma.tokenBlacklist.findUnique({
            where: { token }
        });

        // 2. Decode token (without verification)
        const decoded: any = jwt.decode(token);

        // 3. Try to verify properly
        let verification: any = { valid: false, error: null };
        try {
            const verified = await verifyToken(token);
            verification = {
                valid: true,
                payload: verified
            };
        } catch (error: any) {
            verification = {
                valid: false,
                error: error.message,
                error_type: error.name
            };
        }

        // 4. Manual expiry check
        const currentTime = Math.floor(Date.now() / 1000);
        const isExpired = decoded.exp && decoded.exp < currentTime;
        const timeUntilExpiry = decoded.exp
            ? `${decoded.exp - currentTime} seconds`
            : 'Unknown';

        return NextResponse.json({
            success: true,
            data: {
                token_preview: token.substring(0, 30) + '...',
                blacklisted: !!blacklisted,
                blacklist_info: blacklisted ? {
                    reason: blacklisted.reason,
                    expiresAt: blacklisted.expiresAt,
                    createdAt: blacklisted.createdAt
                } : null,
                decoded: {
                    userId: decoded.userId,
                    email: decoded.email,
                    exp: decoded.exp,
                    iat: decoded.iat,
                    human_exp: decoded.exp ? new Date(decoded.exp * 1000).toISOString() : null,
                    human_iat: decoded.iat ? new Date(decoded.iat * 1000).toISOString() : null
                },
                expiry_status: {
                    is_expired: isExpired,
                    time_until_expiry: timeUntilExpiry,
                    current_time: currentTime
                },
                verification
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}