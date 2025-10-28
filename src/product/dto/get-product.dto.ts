import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class GetProductDto {
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
