// app/api/products/[id]/route.ts
import { NextRequest } from 'next/server';
import {
    getProductById,
    updateProduct,
    deleteProduct
} from '@/lib/product-service';
import { successResponse, errorResponse } from '@/lib/api-response';

// GET /api/products/[id] - Get product by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product_id = params.id;

        if (!product_id) {
            return errorResponse('Product ID is required', 400);
        }

        const product = await getProductById(product_id);

        if (!product) {
            return errorResponse('Product not found', 404);
        }

        return successResponse({ product }, 'Product retrieved successfully');

    } catch (error) {
        console.error('Get product error:', error);
        return errorResponse('Failed to fetch product', 500);
    }
}

// PUT /api/products/[id] - Update product
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product_id = params.id;
        const { product_name, product_price, product_stock } = await request.json();

        if (!product_id) {
            return errorResponse('Product ID is required', 400);
        }

        // Check if product exists
        const existingProduct = await getProductById(product_id);
        if (!existingProduct) {
            return errorResponse('Product not found', 404);
        }

        // Validation
        if (product_price !== undefined && product_price < 0) {
            return errorResponse('Price cannot be negative');
        }

        if (product_stock !== undefined && product_stock < 0) {
            return errorResponse('Stock cannot be negative');
        }

        const updatedProduct = await updateProduct(product_id, {
            product_name,
            product_price: product_price !== undefined ? Number(product_price) : undefined,
            product_stock,
        });

        if (!updatedProduct) {
            return errorResponse('Failed to update product', 500);
        }

        return successResponse(
            { product: updatedProduct },
            'Product updated successfully'
        );

    } catch (error) {
        console.error('Update product error:', error);
        return errorResponse('Failed to update product', 500);
    }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product_id = params.id;

        if (!product_id) {
            return errorResponse('Product ID is required', 400);
        }

        // Check if product exists
        const existingProduct = await getProductById(product_id);
        if (!existingProduct) {
            return errorResponse('Product not found', 404);
        }

        const success = await deleteProduct(product_id);

        if (!success) {
            return errorResponse('Failed to delete product', 500);
        }

        return successResponse(
            null,
            'Product deleted successfully'
        );

    } catch (error) {
        console.error('Delete product error:', error);
        return errorResponse('Failed to delete product', 500);
    }
}