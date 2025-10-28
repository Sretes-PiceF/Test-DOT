import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoriesDto {
    @IsNotEmpty()
    @IsString()
    categories_name: string;
}
