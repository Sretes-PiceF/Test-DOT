// app/api/test/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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
        const type = searchParams.get('type') || 'valid';
        const userId = parseInt(searchParams.get('userId') || '999');
        const email = searchParams.get('email') || 'test@example.com';

        let token: string;
        let expiresIn: string;
        let description: string;

        switch (type) {
            case 'expired':
                // Token expired dengan manual exp timestamp
                const expiredTime = Math.floor(Date.now() / 1000) - 3600; // 1 jam lalu
                token = jwt.sign(
                    {
                        userId,
                        email,
                        exp: expiredTime
                    },
                    JWT_SECRET
                );
                expiresIn = 'Already expired (1 hour ago)';
                description = 'Token yang sudah kadaluarsa - untuk testing auto-blacklist';
                break;

            case 'short':
                // Token 10 detik dengan string expiresIn
                token = jwt.sign(
                    { userId, email },
                    JWT_SECRET,
                    { expiresIn: '10s' as any } // Bypass type checking
                );
                expiresIn = '10 seconds';
                description = 'Token akan expired dalam 10 detik';
                break;

            case 'custom':
                const customTime = searchParams.get('time') || '1m';
                token = jwt.sign(
                    { userId, email },
                    JWT_SECRET,
                    { expiresIn: customTime as any }
                );
                expiresIn = customTime;
                description = `Token custom dengan expiresIn: ${customTime}`;
                break;

            case 'valid':
            default:
                token = jwt.sign(
                    { userId, email },
                    JWT_SECRET,
                    { expiresIn: '24h' as any }
                );
                expiresIn = '24 hours';
                description = 'Token valid normal (24 jam)';
                break;
        }

        const decoded: any = jwt.decode(token);
        const expiresAt = decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'Unknown';

        return NextResponse.json({
            success: true,
            data: {
                token,
                token_preview: token.substring(0, 50) + '...',
                type,
                payload: {
                    userId: decoded.userId,
                    email: decoded.email,
                    exp: decoded.exp,
                    iat: decoded.iat
                },
                expires_in: expiresIn,
                expires_at: expiresAt,
                description
            },
            instructions: {
                verify: 'GET /api/test/verify?token=YOUR_TOKEN',
                use_in_api: 'Add header: Authorization: Bearer YOUR_TOKEN'
            }
        });

    } catch (error: any) {
        console.error('Generate test token error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { success: false, message: 'Only available in development mode' },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const { userId = 999, email = 'test@example.com', expiresIn = '24h' } = body;

        // Gunakan type assertion untuk menghindari error
        const options: any = {};
        if (expiresIn) {
            options.expiresIn = expiresIn;
        }

        const token = jwt.sign(
            { userId, email },
            JWT_SECRET,
            options
        );

        const decoded: any = jwt.decode(token);

        return NextResponse.json({
            success: true,
            data: {
                token,
                payload: { userId, email, exp: decoded.exp, iat: decoded.iat },
                expires_in: expiresIn,
                expires_at: new Date(decoded.exp * 1000).toISOString()
            }
        });

    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}