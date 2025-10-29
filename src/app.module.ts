import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

// Core
import { PrismaService } from './core/prisma.service';

// Modules
import { AuthModule } from './auth/auth.module';
import { ProductModule } from './product/product.module';
import { UserModule } from './user/user.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    // Load environment variables (.env)
    ConfigModule.forRoot({
      isGlobal: true, // agar bisa digunakan di semua module
    }),

    // JWT global configuration
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),

    // Feature modules
    AuthModule,
    ProductModule,
    UserModule,
    CategoriesModule,
  ],

  // PrismaService dijadikan global provider
  providers: [PrismaService],
})
export class AppModule { }
