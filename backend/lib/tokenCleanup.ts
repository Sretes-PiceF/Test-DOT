// lib/tokenCleanup.ts
import { prisma } from '@/lib/db';

export async function scheduledTokenCleanup() {
    try {
        const result = await prisma.tokenBlacklist.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Hapus yang expired >7 hari
                }
            }
        });

        console.log(`Scheduled cleanup: removed ${result.count} expired tokens`);
        return result.count;
    } catch (error) {
        console.error('Scheduled token cleanup error:', error);
        return 0;
    }
}