//lib/auth.ts
import jwt, { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import { prisma } from '@/lib/db';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret';

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is missing in .env file');
}

export interface JwtPayload extends DefaultJwtPayload {
    userId: number;
    email: string;
    jti?: string;
}

/* ===========================================================
    Generate JWT Token
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

    console.log('Token berhasil dibuat:', token.slice(0, 30) + '...');
    return token;
}

/* ===========================================================
Cleanup token expired dari blacklist
   =========================================================== */
async function cleanupExpiredBlacklistedTokens(): Promise<void> {
    try {
        const result = await prisma.tokenBlacklist.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });

        if (result.count > 0) {
            console.log(`Cleaned up ${result.count} expired blacklisted tokens`);
        }
    } catch (error) {
        console.error('Cleanup blacklisted tokens error:', error);
    }
}

/* ===========================================================
    Auto-blacklist untuk token yang expired
   =========================================================== */
async function autoBlacklistExpiredToken(token: string): Promise<void> {
    try {
        const decoded = jwt.decode(token) as JwtPayload | null;
        if (!decoded) return;

        // Hitung waktu expired (gunakan exp dari token atau default 24 jam)
        const expiresAt = decoded.exp
            ? new Date(decoded.exp * 1000)
            : new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Gunakan upsert untuk menghindari error duplicate
        await prisma.tokenBlacklist.upsert({
            where: { token },
            update: {
                expiresAt,
                reason: 'AUTO_EXPIRED'
            },
            create: {
                token,
                expiresAt,
                reason: 'AUTO_EXPIRED'
            }
        });

        console.log('Expired token auto-blacklisted');
    } catch (error) {
        console.error('Auto-blacklist error:', error);
    }
}

/* ===========================================================
    Verifikasi Token dengan auto-cleanup expired
   =========================================================== */
export async function verifyToken(token: string): Promise<JwtPayload> {
    try {
        console.log('Verifying token...');

        //Bersihkan token expired dari blacklist terlebih dahulu
        await cleanupExpiredBlacklistedTokens();

        //Cek apakah token masuk blacklist
        const blacklisted = await prisma.tokenBlacklist.findUnique({
            where: { token }
        });
        if (blacklisted) {
            throw new Error('Token has been invalidated (blacklisted)');
        }

        //Verifikasi dengan jwt.verify → ini akan cek exp & signature otomatis
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        //Pastikan payload berisi data user
        if (!decoded.userId || !decoded.email) {
            throw new Error('Invalid token payload');
        }

        return decoded;

    } catch (error: any) {
        console.error('Token verification error:', error.message);

        // Jika token expired, otomatis blacklist
        if (error.name === 'TokenExpiredError') {
            console.log('Token expired, auto-blacklisting...');
            await autoBlacklistExpiredToken(token);
        }

        throw error;
    }
}

/* ===========================================================
    Invalidate Token (Manual Logout)
   =========================================================== */
export async function invalidateToken(token: string): Promise<void> {
    try {
        const decoded = jwt.decode(token) as JwtPayload | null;

        // Hitung waktu expired
        let expiresAt: Date;
        if (decoded?.exp) {
            expiresAt = new Date(decoded.exp * 1000);
        } else {
            // Default 24 jam dari sekarang jika tidak ada exp
            expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        // Gunakan upsert untuk menghindari error duplicate
        await prisma.tokenBlacklist.upsert({
            where: { token },
            update: {
                expiresAt,
                reason: 'MANUAL_LOGOUT'
            },
            create: {
                token,
                expiresAt,
                reason: 'MANUAL_LOGOUT'
            }
        });

        console.log('Token berhasil di-blacklist');

        // Bersihkan token expired
        await cleanupExpiredBlacklistedTokens();

    } catch (error: any) {
        console.error('Invalidate token error:', error.message);
        throw new Error('Failed to invalidate token');
    }
}

/* ===========================================================
    Password Hashing (SHA-256)
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