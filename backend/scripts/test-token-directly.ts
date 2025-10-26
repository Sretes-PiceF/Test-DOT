// scripts/test-token-directly.ts
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '../lib/auth';

const prisma = new PrismaClient();

async function testTokenDirectly() {
    try {
        console.log('🎯 Testing Token Directly...\n');

        // Token dari response login Postman
        const tokenFromPostman = 'PASTE_TOKEN_HERE'; // ← GANTI DENGAN TOKEN DARI POSTMAN

        if (!tokenFromPostman || tokenFromPostman === 'PASTE_TOKEN_HERE') {
            console.log('❌ Please paste your token from Postman first');
            return;
        }

        console.log('1. Token to test:', tokenFromPostman.substring(0, 50) + '...');

        // 2. Verify token
        console.log('\n2. Verifying token...');
        try {
            const decoded = await verifyToken(tokenFromPostman);
            console.log('   ✅ Token valid. User ID:', decoded.userId);
        } catch (error: any) {
            console.log('   ❌ Token invalid:', error.message);
        }

        // 3. Cek blacklist status
        console.log('\n3. Checking blacklist...');
        const blacklisted = await prisma.blacklistedToken.findUnique({
            where: { token: tokenFromPostman }
        });
        console.log('   Token in blacklist:', blacklisted ? '✅ YES' : '❌ NO');

        // 4. Test akses products dengan token ini
        console.log('\n4. Testing product access simulation...');
        if (!blacklisted) {
            console.log('   ✅ Token should work for product access');
        } else {
            console.log('   ❌ Token is blacklisted, should not work');
        }

    } catch (error) {
        console.error('💥 Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testTokenDirectly();