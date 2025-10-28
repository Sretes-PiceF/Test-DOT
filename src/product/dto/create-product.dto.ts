import { IsNotEmpty, IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    product_name: string;

    @IsNotEmpty()
    @IsNumber()
    product_price: number;

    @IsNumber()
    product_stock: number;

    @IsUUID()
    categories_id: string;
}
