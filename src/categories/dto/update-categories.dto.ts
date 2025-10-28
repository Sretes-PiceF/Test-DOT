import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    categories_name: string;
}
