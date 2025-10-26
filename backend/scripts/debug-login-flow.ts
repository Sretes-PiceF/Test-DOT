// scripts/debug-login-flow.ts
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword, generateToken, verifyToken } from '../lib/auth';

const prisma = new PrismaClient();

async function debugLoginFlow() {
    try {
        console.log('🔐 Debugging Login Flow...\n');

        // 1. Cek user di database
        console.log('1. Checking users in database...');
        const users = await prisma.user.findMany();
        console.log('   Users found:', users);

        if (users.length === 0) {
            console.log('   ❌ No users found. Please register first.');
            return;
        }

        const testUser = users[0];
        console.log('   Using user:', { id: testUser.id, email: testUser.email });

        // 2. Test password verification
        console.log('\n2. Testing password verification...');
        const testPassword = 'password123'; // Ganti dengan password yang benar
        const isPasswordValid = await verifyPassword(testPassword, testUser.password);
        console.log('   Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('   ❌ Password invalid. Please check password.');
            return;
        }

        // 3. Generate token
        console.log('\n3. Generating token...');
        const token = generateToken(testUser.id);
        console.log('   Token generated:', token.substring(0, 50) + '...');

        // 4. Verify token works
        console.log('\n4. Verifying token...');
        try {
            const decoded = await verifyToken(token);
            console.log('   ✅ Token verified. User ID:', decoded.userId);
        } catch (error: any) {
            console.log('   ❌ Token verification failed:', error.message);
        }

        // 5. Test dengan API call simulation
        console.log('\n5. Testing API simulation...');
        console.log('   Use this token in Postman:');
        console.log('   Authorization: Bearer ' + token);

    } catch (error) {
        console.error('💥 Debug failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugLoginFlow();