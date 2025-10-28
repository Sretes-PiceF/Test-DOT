import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './core/prisma.service';
import { ProductModule } from './product/product.module';

@Module({
  imports: [AuthModule, ProductModule],
  providers: [PrismaService],
})
export class AppModule { }
