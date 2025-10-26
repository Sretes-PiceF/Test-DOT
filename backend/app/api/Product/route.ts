// app/api/Product/route.ts
import { NextRequest } from 'next/server';
import { getProducts, createProduct } from '@/lib/product-service';
import { verifyToken } from '@/lib/auth'; // ← IMPORTANT: Import verifyToken
import { successResponse, errorResponse } from '@/lib/api-response';

// GET /api/Product - Get all products
export async function GET(request: NextRequest) {
    try {
        // CEK TOKEN DI SETIAP ROUTE
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse('Access token required', 401);
        }

        const token = authHeader.replace('Bearer ', '');
        await verifyToken(token); // ← Ini akan cek blacklist

        // Lanjutkan dengan business logic
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        const { products, total } = await getProducts(page, limit, search);

        const totalPages = Math.ceil(total / limit);

        return successResponse({
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            }
        }, 'Products retrieved successfully');

    } catch (error: any) {
        console.error('Get products error:', error);
        if (error.message.includes('Token') || error.message.includes('invalid')) {
            return errorResponse('Invalid or expired token', 401);
        }
        return errorResponse('Failed to fetch products', 500);
    }
}

// POST /api/Product - Create new product
export async function POST(request: NextRequest) {
    try {
        // CEK TOKEN
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return errorResponse('Access token required', 401);
        }

        const token = authHeader.replace('Bearer ', '');
        await verifyToken(token); // ← Cek blacklist

        // Lanjutkan create product
        const { product_name, product_price, product_stock, categories_id } = await request.json();

        if (!product_name || product_price === undefined || !categories_id) {
            return errorResponse('Product name, price, and categories_id are required');
        }

        const product = await createProduct({
            product_name,
            product_price: Number(product_price),
            product_stock: product_stock || 0,
            categories_id,
        });

        return successResponse(
            { product },
            'Product created successfully',
        );

    } catch (error: any) {
        console.error('Create product error:', error);
        if (error.message.includes('Token') || error.message.includes('invalid')) {
            return errorResponse('Invalid or expired token', 401);
        }
        return errorResponse(error.message || 'Failed to create product', 500);
    }
}