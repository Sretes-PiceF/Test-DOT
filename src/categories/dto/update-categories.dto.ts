import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateCategoriesDto {
    @IsOptional()
    @IsString()
    categories_name: string;
}
