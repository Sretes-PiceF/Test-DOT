import { Categories } from '../../categories/entities/categories.entity';

export class ProductEntity {
    product_id: number;
    product_name: string;
    product_price: number;
    product_stock: number;
    categories_id: number;
    category?: Categories;
    createdAt: Date;
    updatedAt: Date;
}
