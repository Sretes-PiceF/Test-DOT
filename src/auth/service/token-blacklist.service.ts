import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma.service';

@Injectable()
export class TokenBlacklistService {
    constructor(private prisma: PrismaService) { }

    async addToBlacklist(token: string, expiresAt: Date, reason: string = 'MANUAL_LOGOUT') {
        return this.prisma.tokenBlacklist.create({
            data: {
                token,
                expiresAt,
                reason,
            },
        });
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
            where: { token },
        });

        if (!blacklistedToken) {
            return false;
        }

        // Hapus jika token sudah expired
        if (new Date() > blacklistedToken.expiresAt) {
            await this.prisma.tokenBlacklist.delete({
                where: { token },
            });
            return false;
        }

        return true;
    }

    async cleanupExpiredTokens(): Promise<void> {
        await this.prisma.tokenBlacklist.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }

    async getUserActiveTokens(userId: string) {
        // Implementasi untuk mendapatkan semua token aktif user (jika perlu)
        // Ini opsional, tergantung kebutuhan
        return [];
    }
}