import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async getProduct(page: number, limit: number, search: string) {
        const skip = (page - 1) * limit;

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
                skip,
                take: limit,
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

    async createProduct(data: CreateProductDto) {
        return this.prisma.product.create({
            data: {
                product_name: data.product_name,
                product_price: data.product_price,
                product_stock: data.product_stock,
                categories_id: data.categories_id,
            },
        });
    }
}
