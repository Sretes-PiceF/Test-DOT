import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma.service';

describe('Auth E2E Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();

        // Bersihkan tabel User sebelum menjalankan tes Auth
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        // **PERBAIKAN: Hapus user setelah tes selesai**
        await prisma.user.deleteMany();
        await app.close();
    });

    describe('Pengujian Token', () => {
        let accessToken: string;
        // Gunakan user unik untuk memastikan tidak ada konflik dengan suite lain
        const testUser = {
            name: 'Auth Test User',
            email: 'auth.test@example.com',
            password: 'password123',
        };

        it('Harus mendaftar pengguna baru', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send(testUser)
                .expect(201);

            expect(response.body.message).toBe('User registered successfully');
        });

        it('Login untuk mendapatkan token', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(201);

            expect(response.body.access_token).toBeDefined();
            accessToken = response.body.access_token;
        });

        it('Mengakses produk dengan token yang valid', async () => {
            const response = await request(app.getHttpServer())
                .get('/Product') // Ganti dengan protected route Anda
                .set('Authorization', `Bearer ${accessToken}`)

            expect(response.body).toBeDefined();
        });

        it('Menolak akses tanpa token', async () => {
            await request(app.getHttpServer())
                .get('/Product')
                .expect(401);
        });

        it('Menolak akses dengan token yang tidak valid', async () => {
            await request(app.getHttpServer())
                .get('/Product')
                .set('Authorization', 'Bearer invalid-token-here')
                .expect(401);
        });

        it('Logout sukses', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/logout')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ reason: 'TEST_LOGOUT' })
                .expect(201);

            expect(response.body.message).toBe('Logout successful');
        });

        it('Menolak akses karena Token telah masuk daftar blaclist di database', async () => {
            await request(app.getHttpServer())
                .get('/Product')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(401); // Should be rejected because token is blacklisted
        });

        it('Menolak login dengan kredensial yang salah', async () => {
            await request(app.getHttpServer())
                .post('/auth/Login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(400);
        });

    });
});
