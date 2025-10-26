// ✅ lib/auth.ts
import jwt, { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret';

if (!JWT_SECRET) {
    throw new Error('❌ JWT_SECRET is missing in .env file');
}

export interface JwtPayload extends DefaultJwtPayload {
    userId: number;
    email: string;
    jti?: string;
}

/* ===========================================================
   ✅ Generate JWT Token
   =========================================================== */
export function generateToken(userId: number, email: string): string {
    const token = jwt.sign(
        { userId, email },
        JWT_SECRET,
        {
            expiresIn: '24h', // Token habis otomatis dalam 24 jam
            jwtid: Math.random().toString(36).slice(2) + Date.now().toString(36) // JTI random
        }
    );

    console.log('✅ Token berhasil dibuat:', token.slice(0, 30) + '...');
    return token;
}

/* ===========================================================
   ✅ Verifikasi Token
   =========================================================== */
export async function verifyToken(token: string): Promise<JwtPayload> {
    try {
        console.log('🔍 Verifying token...');

        // 1️⃣ Cek apakah masuk blacklist (logout)
        const blacklisted = await prisma.tokenBlacklist.findUnique({ where: { token } });
        if (blacklisted) {
            throw new Error('Token has been invalidated (blacklisted)');
        }

        // 2️⃣ Verifikasi dengan jwt.verify → ini akan cek exp & signature otomatis
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // 3️⃣ Pastikan payload berisi data user
        if (!decoded.userId || !decoded.email) {
            throw new Error('Invalid token payload');
        }

        return decoded;

    } catch (error: any) {
        console.error('❌ Token verification error:', error.message);
        throw error;
    }
}

/* ===========================================================

   =========================================================== */
export async function invalidateToken(token: string): Promise<void> {
    try {
        const decoded = jwt.decode(token) as JwtPayload | null;
        if (!decoded || !decoded.exp) {
            throw new Error('Cannot invalidate token: invalid or missing exp');
        }

        await prisma.tokenBlacklist.create({
            data: {
                token,
                expiresAt: new Date(decoded.exp * 1000),
            },
        });

        console.log('Token berhasil di-blacklist');

        // Optional: bersihkan token expired dari blacklist
        await prisma.tokenBlacklist.deleteMany({
            where: { expiresAt: { lt: new Date() } }
        });

    } catch (error: any) {
        console.error('❌ Invalidate token error:', error.message);
        throw new Error('Failed to invalidate token');
    }
}

/* ===========================================================
   ✅ Password Hashing (SHA-256)
   =========================================================== */
export async function hashPassword(password: string): Promise<string> {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
    return (await hashPassword(password)) === hashed;
}
