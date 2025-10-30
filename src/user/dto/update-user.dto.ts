import { IsOptional, IsString, MinLength, IsEmail } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsEmail()
    email: string;
}
