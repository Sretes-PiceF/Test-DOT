import { Module } from '@nestjs/common';
import { ProductsController } from './product.controller';
import { ProductsService } from './product.service';
import { PrismaService } from '../core/prisma.service'; // pastikan path sesuai
import { JwtStrategy } from '../auth/jwt.strategy'; // kalau kamu punya strategy JWT
import { AuthModule } from '../auth/auth.module';


@Module({
    imports: [
        AuthModule,
    ],
    controllers: [ProductsController],
    providers: [ProductsService, PrismaService, JwtStrategy],
    exports: [ProductsService],
})
export class ProductModule { }
