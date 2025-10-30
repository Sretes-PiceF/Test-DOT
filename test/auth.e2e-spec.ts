import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma.service';

describe('Auth E2E Tests', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    // Gunakan user unik untuk memastikan tidak ada konflik dengan suite lain
    const testUser = {
        name: 'Auth Test User',
        email: 'auth.test.persisted@example.com', // ⭐ Ubah email agar unik
        password: 'password123',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Pengujian Token Revocation (Invalidasi Token Lama)', () => {
        let oldAccessToken: string;
        let newAccessToken: string;

        // Tambahkan cek duplikasi sebelum register untuk mencegah error pada run kedua
        it('Harus menghapus user jika sudah ada dan mendaftar pengguna baru', async () => {
            // ⭐ LOGIC BARU: Hapus user ini terlebih dahulu, lalu registrasi
            await prisma.user.deleteMany({ where: { email: testUser.email } });

            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send(testUser)
                .expect(HttpStatus.CREATED);

            expect(response.body.message).toBe('User registered successfully');
        });

        it('Login PERTAMA untuk mendapatkan token lama', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(HttpStatus.CREATED);

            oldAccessToken = response.body.access_token;
            expect(oldAccessToken).toBeDefined();
        });

        it('Token lama HARUS valid sebelum login kedua', async () => {
            // Gunakan protected route /Product sebagai validasi token
            await request(app.getHttpServer())
                .get('/Product')
                .set('Authorization', `Bearer ${oldAccessToken}`)
                .expect(HttpStatus.OK);
        });

        it('Login KEDUA untuk mendapatkan token baru (Ini akan me-revoked token lama)', async () => {
            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(HttpStatus.CREATED);

            newAccessToken = response.body.access_token;
            expect(newAccessToken).toBeDefined();
        });

        it('Token lama HARUS menjadi invalid/revoked setelah login kedua', async () => {
            await request(app.getHttpServer())
                .get('/Product')
                .set('Authorization', `Bearer ${oldAccessToken}`)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Token baru HARUS valid', async () => {
            await request(app.getHttpServer())
                .get('/Product')
                .set('Authorization', `Bearer ${newAccessToken}`)
                .expect(HttpStatus.OK);
        });

        it('Logout sukses HARUS me-revoked token yang sedang digunakan', async () => {
            // Kita ubah kembali ekspektasi status code dari 201 (asumsi perbaikan controller sudah dilakukan)
            await request(app.getHttpServer())
                .post('/auth/logout')
                .set('Authorization', `Bearer ${newAccessToken}`)
                .expect(HttpStatus.OK);
        });

        it('Token setelah logout HARUS invalid/revoked', async () => {
            await request(app.getHttpServer())
                .get('/Product')
                .set('Authorization', `Bearer ${newAccessToken}`)
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Menolak akses tanpa token', async () => {
            await request(app.getHttpServer())
                .get('/Product')
                .expect(HttpStatus.UNAUTHORIZED);
        });

        it('Menolak login dengan kredensial yang salah', async () => {
            await request(app.getHttpServer())
                .post('/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                })
                .expect(HttpStatus.BAD_REQUEST);
        });
    });
});