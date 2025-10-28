import { Module } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service'; // pastikan path sesuai
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy'; // kalau kamu punya strategy JWT
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'defaultSecretKey',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [CategoriesController],
    providers: [CategoriesService, PrismaService, JwtStrategy],
    exports: [CategoriesService],
})
export class CategoriesModule { }
