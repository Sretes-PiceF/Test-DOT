// scripts/test-token.js
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testTokenFlow() {
    console.log('🚀 Starting Token Testing Flow...\n');

    // 1. Generate expired token
    console.log('1. Generating expired token...');
    const expiredRes = await axios.get(`${BASE_URL}/test-token/generate?type=expired`);
    const expiredToken = expiredRes.data.data.token;
    console.log('✅ Expired token:', expiredToken.substring(0, 50) + '...');

    // 2. Verify expired token
    console.log('\n2. Verifying expired token...');
    const verifyRes = await axios.get(`${BASE_URL}/test-token/verify?token=${expiredToken}`);
    console.log('✅ Verification result:', {
        valid: verifyRes.data.data.verification.valid,
        blacklisted: verifyRes.data.data.blacklisted,
        expired: verifyRes.data.data.expiry_status.is_expired
    });

    // 3. Generate short-lived token
    console.log('\n3. Generating short-lived token (10s)...');
    const shortRes = await axios.get(`${BASE_URL}/test-token/generate?type=short`);
    const shortToken = shortRes.data.data.token;
    console.log('✅ Short token:', shortToken.substring(0, 50) + '...');

    // 4. Test protected API with valid token
    console.log('\n4. Testing protected API...');
    try {
        const validRes = await axios.get(`${BASE_URL}/test-token/generate?type=valid`);
        const validToken = validRes.data.data.token;
        
        const apiTest = await axios.get(`${BASE_URL}/products`, {
            headers: { Authorization: `Bearer ${validToken}` }
        });
        console.log('✅ Protected API access: SUCCESS');
    } catch (error) {
        console.log('❌ Protected API access: FAILED', error.response?.data);
    }

    console.log('\n🎉 Testing completed!');
}

testTokenFlow();