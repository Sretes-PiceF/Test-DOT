// create-product.dto.ts
import { IsString, IsNumber, IsNotEmpty, Min, IsOptional } from 'class-validator';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    product_name: string;          // Wajib, harus string

    @IsOptional()
    @IsNumber()
    @Min(0)                        // Harga tidak boleh negatif
    product_price: number;         // Wajib, harus number

    @IsNumber()
    @IsOptional()                  // Opsional
    @Min(0)
    product_stock?: number;        // Default 0 jika tidak diisi

    @IsString()
    @IsOptional()
    categories_id?: string;         // Wajib, harus string
}