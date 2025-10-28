// src/categories/entities/categories.entity.ts
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../product/entities/product.entity';

export class Categories {
    @ApiProperty({ example: 'uuid-1234', description: 'Unique ID of category' })
    categories_id: string;

    @ApiProperty({ example: 'Electronics', description: 'Category name' })
    categories_name: string;

    @ApiProperty({ type: () => [Product], description: 'List of products under this category' })
    products?: Product[];

    @ApiProperty({ example: '2025-10-28T12:00:00Z' })
    createdAt: Date;

    @ApiProperty({ example: '2025-10-28T12:30:00Z' })
    updatedAt: Date;
}
