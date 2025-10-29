import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma.service';

describe('Product E2E dengan Auth', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let accessToken: string;
    let categoryId: string;

    // Data user yang akan digunakan untuk testing
    const TEST_USER = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Product Test User',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();

        // 1. Bersihkan data (Wajib untuk E2E agar tes konsisten)
        // Kita Hapus semua data di sini karena kita ingin memulai dengan keadaan database kosong
        await prisma.product.deleteMany();
        await prisma.categories.deleteMany();
        await prisma.user.deleteMany();

        // 2. Seed kategori agar tidak error foreign key
        const category = await prisma.categories.create({
            data: {
                categories_name: 'Kategori Uji Coba',
            },
        });
        categoryId = category.categories_id;

        // 3. REGISTRASI USER (Wajib, agar bisa login)
        await request(app.getHttpServer())
            .post('/auth/register')
            .send(TEST_USER)
            .expect(201);

        // 4. Login untuk mendapatkan token
        const loginResponse = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: TEST_USER.email,
                password: TEST_USER.password,
            })
            .expect(201);

        accessToken = loginResponse.body.access_token;
        expect(accessToken).toBeDefined();
    });

    afterAll(async () => {
        // **PERBAIKAN: Hapus user setelah tes selesai**
        // Ini memastikan suite berikutnya (misalnya Auth suite) tidak menemukan user ini.
        await prisma.user.deleteMany();
        await app.close();
    });

    describe('Product CRUD Dengan Authentication', () => {
        let createdProductId: string;

        it('Perlu Token yang valid untuk membuat data (Success 201)', async () => {
            const response = await request(app.getHttpServer())
                .post('/Product')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    product_name: 'Test Product',
                    product_price: 100,
                    product_stock: 10,
                    categories_id: categoryId,
                })
                .expect(201);

            const product = response.body.data || response.body.product;
            expect(product.product_name).toBe('Test Product');
            expect(product.product_price).toBe(100);

            createdProductId = product.product_id || product.id;
        });

        it('Perlu Token yang valid untuk membuat data (Gagal 401)', async () => {
            await request(app.getHttpServer())
                .post('/Product')
                .send({
                    product_name: 'Baju olahraga',
                    product_price: 50,
                    product_stock: 5,
                    categories_id: categoryId,
                })
                .expect(401);
        });

        it('Perlu Token yang valid untuk melihat seluruh data (Success 200)', async () => {
            const response = await request(app.getHttpServer())
                .get('/Product')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            const body = response.body;
            const products =
                (body.data && Array.isArray(body.data.products) && body.data.products) ||
                (body.data && Array.isArray(body.data) && body.data) ||
                [];

            expect(Array.isArray(products)).toBe(true);
            expect(products.length).toBeGreaterThan(0);
        });


        it('Perlu Token yang valid untuk melihat data (Fail 401)', async () => {
            await request(app.getHttpServer())
                .get('/Product')
                .expect(401);
        });

        it('Perlu Token yang valid untuk melihat data dengan By ID (Success 200)', async () => {
            const response = await request(app.getHttpServer())
                .get(`/Product/${createdProductId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            const product = response.body.data || response.body.product;
            expect(product.product_id || product.id).toBe(createdProductId);
            expect(product.product_name).toBe('Test Product');
        });

        it('Perlu Token yang valid untuk mengubah data (Success 200)', async () => {
            const updatedName = 'Updated Test Product';
            const response = await request(app.getHttpServer())
                .patch(`/Product/${createdProductId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ product_name: updatedName, product_price: 150 })
                .expect(200);

            const product = response.body.data || response.body.product;
            expect(product.product_name).toBe(updatedName);
            expect(product.product_price).toBe(150);
        });

        it('Perlu Token yang valid untuk menghapus data (Success 200)', async () => {
            await request(app.getHttpServer())
                .delete(`/Product/${createdProductId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            // Pastikan produk sudah dihapus
            await request(app.getHttpServer())
                .get(`/Product/${createdProductId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });
});
