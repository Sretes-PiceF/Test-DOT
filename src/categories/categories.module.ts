import { Module } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service'; // pastikan path sesuai
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy'; // kalau kamu punya strategy JWT
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        AuthModule,
    ],
    controllers: [CategoriesController],
    providers: [CategoriesService, PrismaService, JwtStrategy],
    exports: [CategoriesService],
})
export class CategoriesModule { }
