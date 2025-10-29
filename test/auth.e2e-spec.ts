import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import request from 'supertest';

describe('Auth E2E', () => {
    let app: INestApplication;
    let server: any;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
        server = app.getHttpServer();
    });

    afterAll(async () => {
        await app.close();
    });

    it('✅ should login successfully and return access token', async () => {
        const loginPayload = {
            email: 'vino@gmail.com', // PASTIKAN ini akun valid di DB testing
            password: 'Vinoaja',      // PASTIKAN ini password yang benar
        };

        const res = await request(server)
            .post('/auth/login')
            .send(loginPayload);

        // --- DEBUGGING CRITICAL ---
        if (res.status === 400) {
            console.log('--- 400 BAD REQUEST DETAILS ---');
            console.log('Payload yang dikirim:', loginPayload);
            console.log('Respons Body dari Server:', res.body);
            console.log('-------------------------------');
        }
        // ---------------------------

        expect(res.status).toBe(201); // Atau 200, tergantung implementasi Anda
        expect(res.body.access_token).toBeDefined();

        // Optional: simpan token untuk test berikutnya
        // console.log('Access Token:', res.body.access_token);
    });
});
