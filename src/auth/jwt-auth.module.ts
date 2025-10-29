import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { PrismaService } from '../core/prisma.service';
import { TokenBlacklistService } from '../auth/service/token-blacklist.service';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [
        JwtStrategy,
        AuthService,
        PrismaService,
        TokenBlacklistService
    ],
    exports: [JwtModule, PassportModule, JwtStrategy],
})
export class JwtAuthModule { }