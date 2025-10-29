import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class GetProductDto {
    @IsOptional()
    @IsString()
    search?: string;
}
