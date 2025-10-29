import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoryDto {
    @IsNotEmpty()
    @IsString()
    categories_name: string;
}
