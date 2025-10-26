// lib/product-service.ts
import { prisma } from './db';
import { Product, CreateProductRequest, UpdateProductRequest } from '@/types/Product';

export async function getProducts(
    page: number = 1,
    limit: number = 10,
    search: string = ''
): Promise<{ products: Product[]; total: number }> {
    const skip = (page - 1) * limit;

    // Build where condition
    const where: any = {};

    if (search) {
        where.product_name = { contains: search, mode: 'insensitive' as const };
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.product.count({ where }),
    ]);

    return {
        products,
        total
    };
}

export async function getProductById(product_id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
        where: { product_id },
    });

    return product;
}

export async function createProduct(data: CreateProductRequest): Promise<Product> {
    const product = await prisma.product.create({
        data: {
            product_name: data.product_name,
            product_price: data.product_price,
            product_stock: data.product_stock || 0,
            categories_id: data.categories_id,
        },
    });

    return product;
}

export async function updateProduct(product_id: string, data: UpdateProductRequest): Promise<Product | null> {
    try {
        const product = await prisma.product.update({
            where: { product_id },
            data: {
                product_name: data.product_name,
                product_price: data.product_price,
                product_stock: data.product_stock,
            },
        });

        return product;
    } catch (error) {
        return null;
    }
}

export async function deleteProduct(product_id: string): Promise<boolean> {
    try {
        await prisma.product.delete({
            where: { product_id },
        });
        return true;
    } catch (error) {
        return false;
    }
}