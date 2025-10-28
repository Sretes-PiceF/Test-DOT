import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaService } from '../core/prisma.service';

@Module({
    controllers: [UserController],
    providers: [UserService, PrismaService],
    exports: [UserService], // penting agar bisa digunakan di AuthModule
})
export class UserModule { }
