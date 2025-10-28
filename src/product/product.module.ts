import { Module } from '@nestjs/common';
import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';
import { PrismaService } from '../core/prisma.service'; // pastikan path sesuai
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/jwt.strategy'; // kalau kamu punya strategy JWT

@Module({
    imports: [
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'defaultSecretKey',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    controllers: [ProductsController],
    providers: [ProductsService, PrismaService, JwtStrategy],
    exports: [ProductsService],
})
export class ProductModule { }
