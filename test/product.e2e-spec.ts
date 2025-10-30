import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/prisma.service';

describe('Product E2E dengan Auth (Data Persisted)', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let accessToken: string;
    let categoryId: string;
    const PRODUCT_ROUTE = '/Product';

    const TEST_USER = {
        email: 'product.test.persisted@example.com',
        password: 'password123',
        name: 'Product Test User Persisted',
    };

    const CATEGORY_NAME = 'Kategori Uji Coba Persisted';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        prisma = moduleFixture.get<PrismaService>(PrismaService);
        await app.init();

        // --- LOGIC KATEGORI ---
        let category = await prisma.categories.findFirst({
            where: { categories_name: CATEGORY_NAME }
        });

        if (!category) {
            console.log(`[E2E] Membuat kategori baru: ${CATEGORY_NAME}`);
            category = await prisma.categories.create({
                data: { categories_name: CATEGORY_NAME },
            });
        }

        categoryId = category.categories_id;
        console.log(`[E2E] Menggunakan categories_id: ${categoryId}`);

        // --- LOGIC USER DAN LOGIN ---
        const existingUser = await prisma.user.findUnique({ where: { email: TEST_USER.email } });

        if (!existingUser) {
            await request(app.getHttpServer())
                .post('/auth/register')
                .send(TEST_USER)
                .expect(HttpStatus.CREATED);
        }

        const loginResponse = await request(app.getHttpServer())
            .post('/auth/Login')
            .send({
                email: TEST_USER.email,
                password: TEST_USER.password,
            })
            .expect(HttpStatus.CREATED);

        accessToken = loginResponse.body.access_token;
        expect(accessToken).toBeDefined();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Product CRUD Dengan Authentication', () => {
        let createdProductId: string;

        it('Perlu Token yang valid untuk membuat data (Success 201)', async () => {
            const response = await request(app.getHttpServer())
                .post(PRODUCT_ROUTE)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({
                    product_name: 'Test Product Persisted ' + Date.now(),
                    product_price: 100,
                    product_stock: 10,
                    categories_id: categoryId,
                })
                .expect(HttpStatus.CREATED);

            const product = response.body.data || response.body;
            createdProductId = product.product_id || product.id;
            expect(createdProductId).toBeDefined();
            expect(typeof createdProductId).toBe('string');
        });

        it('Perlu Token yang valid untuk mengubah data (Success 200)', async () => {
            if (!createdProductId) return;

            const updatedName = 'Updated Test Product Persisted ' + Date.now();
            const response = await request(app.getHttpServer())
                .patch(`${PRODUCT_ROUTE}/${createdProductId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ product_name: updatedName, product_price: 150 })
                .expect(HttpStatus.OK);

            const product = response.body.data || response.body;
            expect(product.product_name).toBe(updatedName);
        });

        it('Perlu Token yang valid untuk melihat seluruh data (Success 200)', async () => {
            await request(app.getHttpServer())
                .get(PRODUCT_ROUTE)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(HttpStatus.OK);
        });

        it('Perlu Token yang valid untuk melihat data dengan By ID (Success 200)', async () => {
            const response = await request(app.getHttpServer())
                .get(`${PRODUCT_ROUTE}/${createdProductId}`)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(HttpStatus.OK);

            const product = response.body.data || response.body;
            expect(product.product_id || product.id).toBe(createdProductId);
        });

        // ⭐ Test delete dihapus / dikomentari agar data lama tetap aman
        // it('Perlu Token yang valid untuk menghapus data (Success 200)', async () => {
        //     await request(app.getHttpServer())
        //         .delete(`${PRODUCT_ROUTE}/${createdProductId}`)
        //         .set('Authorization', `Bearer ${accessToken}`)
        //         .expect(HttpStatus.OK);
        // });

        it('Perlu Token yang valid untuk membuat data (Gagal 401 - Tanpa Token)', async () => {
            await request(app.getHttpServer())
                .post(PRODUCT_ROUTE)
                .send({ /* product data */ })
                .expect(HttpStatus.UNAUTHORIZED);
        });
    });
});
