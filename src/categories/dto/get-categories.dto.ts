import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class GetCategoriesDto {
    @IsOptional()
    @IsNumberString()
    page?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;

    @IsOptional()
    @IsString()
    search?: string;
}
