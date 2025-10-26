// app/api/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { invalidateToken, verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { success: false, message: 'Token required for logout' },
                { status: 400 }
            );
        }

        const token = authHeader.substring(7).trim();

        console.log('Logout process for token:', token.substring(0, 20) + '...');

        // Verifikasi token dulu untuk memastikan valid
        try {
            await verifyToken(token);
            console.log('Token is valid, proceeding to invalidate');
        } catch (error) {
            console.log('Token is invalid, but still try to blacklist');
            // Tetap lanjut ke blacklist meski token invalid
        }

        // Blacklist token
        await invalidateToken(token);
        console.log('Token successfully blacklisted');

        return NextResponse.json({
            success: true,
            message: 'Logout successful',
            data: {
                message: 'You have been logged out successfully',
                tokenInvalidated: true
            }
        });

    } catch (error: any) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Logout failed' },
            { status: 500 }
        );
    }
}