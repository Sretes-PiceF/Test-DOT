// scripts/debug-blacklist.ts
import { prisma } from '../lib/db';
import { invalidateToken, verifyToken, generateToken } from '../lib/auth';

async function debugBlacklist() {
    try {
        console.log('🐛 Debugging blacklist functionality...\n');

        // 1. Generate token baru
        const testUserId = 1;
        const token = generateToken(testUserId);
        console.log('1. Generated token:', token.substring(0, 50) + '...');

        // 2. Cek token valid sebelum logout
        console.log('\n2. Verifying token before logout...');
        try {
            const decoded = await verifyToken(token);
            console.log('   ✅ Token valid, user ID:', decoded.userId);
        } catch (error: any) {
            console.log('   ❌ Token invalid:', error.message);
        }

        // 3. Simulate logout - invalidate token
        console.log('\n3. Simulating logout...');
        await invalidateToken(token);

        // 4. Cek database langsung
        console.log('\n4. Checking database...');
        const allBlacklisted = await prisma.blacklistedToken.findMany();
        console.log('   All blacklisted tokens in DB:', allBlacklisted);

        const found = await prisma.blacklistedToken.findUnique({
            where: { token }
        });
        console.log('   Our token in blacklist:', found ? '✅ YES' : '❌ NO');

        // 5. Cek token setelah logout
        console.log('\n5. Verifying token after logout...');
        try {
            await verifyToken(token);
            console.log('   ❌ ERROR: Token should be invalid but it passed!');
        } catch (error: any) {
            console.log('   ✅ CORRECT: Token rejected:', error.message);
        }

    } catch (error) {
        console.error('💥 Debug failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugBlacklist();