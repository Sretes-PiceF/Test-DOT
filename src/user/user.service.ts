import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.user.findMany();
    }

    async findOne(id: number) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async create(dto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.create({
            data: {
                email: dto.email,
                name: dto.name,
                password: hashedPassword,
            },
        });
    }

    async update(id: number, dto: UpdateUserDto) {
        // Cek apakah semua field wajib ada
        const requiredFields = ['name', 'email', 'password']; // sesuaikan dengan field yang wajib diupdate

        for (const field of requiredFields) {
            if (dto[field] === undefined || dto[field] === null || dto[field] === '') {
                throw new BadRequestException(
                    `Field "${field}" wajib diisi untuk permintaan PUT (update penuh).`
                );
            }
        }

        // Hash password jika ada
        const data: any = { ...dto };
        if (dto.password) {
            data.password = await bcrypt.hash(dto.password, 10);
        }

        // Jalankan update
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }


    async delete(id: number) {
        return this.prisma.user.delete({ where: { id } });
    }
}
