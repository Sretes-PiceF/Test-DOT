import { NextRequest, NextResponse } from 'next/server';
import { Product, CreateProductRequest, ProductResponse } from '@/types/Product';
import { createProduct, getProducts } from '@/lib/database';

export async function GET(): Promise<NextResponse<ProductResponse>> {
    try {
        const products: Product[] = await getProducts();

        return NextResponse.json({
            success: true,
            data: products
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch products'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest): Promise<NextResponse<ProductResponse>> {
    try {
        const body: CreateProductRequest = await request.json();

        // Validasi dengan Zod (recommended)
        const product: Product = await createProduct(body);

        return NextResponse.json({
            success: true,
            data: product
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Failed to create product'
        }, { status: 500 });
    }
}