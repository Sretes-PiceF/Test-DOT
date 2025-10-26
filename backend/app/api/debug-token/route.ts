// app/api/debug-token/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { action, token, userId, email } = await req.json();

        if (action === 'generate') {
            const testToken = await generateToken({
                userId: userId || 123,
                email: email || 'test@example.com'
            });

            return NextResponse.json({
                success: true,
                token: testToken,
                message: 'Token generated'
            });
        }

        if (action === 'verify' && token) {
            const decoded = await verifyToken(token);

            return NextResponse.json({
                success: true,
                decoded: decoded,
                message: 'Token verified'
            });
        }

        return NextResponse.json({
            success: false,
            message: 'Invalid action or missing token'
        }, { status: 400 });

    } catch (error: any) {
        console.error('Debug token error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}