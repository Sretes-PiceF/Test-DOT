export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    categoryId: string;
}

export interface UpdateProductRequest {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: string;
}

export interface ProductResponse {
    success: boolean;
    data?: Product;
    error?: string;
}