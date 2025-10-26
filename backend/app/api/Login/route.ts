import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        console.log('=== LOGIN PROCESS START ===');
        console.log('Login attempt for email:', email);

        // ✅ Validasi input
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: 'Email and password are required' },
                { status: 400 }
            );
        }

        // ✅ Cari user berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            console.log('❌ User not found');
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        console.log('User found:', user.email);

        // ✅ Verifikasi password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            console.log('Password mismatch');
            return NextResponse.json(
                { success: false, message: 'Invalid email or password' },
                { status: 401 }
            );
        }

        console.log('✅ Password verified');

        // ✅ Generate JWT token (gunakan user.id dan user.email sesuai fungsi baru)
        const token = await generateToken(user.id, user.email);

        // ✅ Kirim response
        return NextResponse.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                },
                token,
                expiresIn: '24h',
            },
        });

    } catch (error) {
        console.error('=== LOGIN ERROR ===', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
