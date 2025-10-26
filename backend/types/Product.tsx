// types/Product.ts
export interface Product {
    product_id: string;
    product_name: string;
    product_price: number;
    product_stock: number;
    categories_id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProductRequest {
    product_name: string;
    product_price: number;
    product_stock?: number;
    categories_id: string;

}

export interface UpdateProductRequest {
    product_name?: string;
    product_price?: number;
    product_stock?: number;
}

export interface ProductResponse {
    success: boolean;
    data?: Product | Product[];
    message?: string;
    error?: string;
}