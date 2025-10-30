import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto'; // harus dibuat
import { Product } from '@prisma/client';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    // GET /Product?page=&limit=&search=
    async getAllProduct(search: string) {

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where: {
                    product_name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                include: {
                    categories: true, // tampilkan relasi kategori
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.product.count({
                where: {
                    product_name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            }),
        ]);

        return { products, total };
    }

    // POST /Product
    async createProduct(data: CreateProductDto): Promise<Product> {
        const product = await this.prisma.product.create({
            data: {
                product_name: data.product_name,
                product_price: data.product_price,
                product_stock: data.product_stock,
                categories_id: data.categories_id,
            },
        });
        return product;
    }

    // GET /Product/:id
    async getProductById(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { product_id: id },
            include: { categories: true },
        });

        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    // PATCH /Product/:id
    async updateProduct(id: string, data: UpdateProductDto) {
        // pastikan produk ada dulu
        const existing = await this.prisma.product.findUnique({ where: { product_id: id } });
        if (!existing) throw new NotFoundException('Product not found');

        return this.prisma.product.update({
            where: { product_id: id },
            data,
        });
    }

    // DELETE /Product/:id
    async deleteProduct(id: string) {
        // pastikan produk ada dulu
        const existing = await this.prisma.product.findUnique({ where: { product_id: id } });
        if (!existing) throw new NotFoundException('Product not found');

        return this.prisma.product.delete({ where: { product_id: id } });
    }
}
