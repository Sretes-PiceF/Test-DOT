import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../core/prisma.service';
import { UserModule } from '../user/user.module';
// Hapus import TokenBlacklistService

@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' }, // ⭐ Token Hangus setelah 24 Jam
        }),
    ],
    providers: [
        AuthService,
        JwtStrategy,
        PrismaService,
        // Hapus TokenBlacklistService dari providers
    ],
    controllers: [AuthController],
    exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }