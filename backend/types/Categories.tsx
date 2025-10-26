// types/Categories.ts
export interface Categories {
    categories_id: string;    // ← lowercase
    categories_name: string;  // ← lowercase
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateCategoriesRequest {
    categories_name: string;  // ← lowercase
}

export interface UpdateCategoriesRequest {
    categories_name?: string; // ← lowercase
}

export interface CategoriesResponse {
    success: boolean;
    data?: Categories | Categories[];
    message?: string;
    error?: string;
}