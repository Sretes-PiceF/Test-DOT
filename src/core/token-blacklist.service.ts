import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';

@Injectable()
export class TokenBlacklistService {
    constructor(private prisma: PrismaService) { }

    async addToken(token: string, expiresAt: Date, reason = 'MANUAL_LOGOUT') {
        return this.prisma.tokenBlacklist.create({
            data: { token, expiresAt, reason },
        });
    }

    async isBlacklisted(token: string) {
        const found = await this.prisma.tokenBlacklist.findUnique({
            where: { token },
        });
        return !!found;
    }

    async cleanupExpiredTokens() {
        return this.prisma.tokenBlacklist.deleteMany({
            where: { expiresAt: { lt: new Date() } },
        });
    }
}
