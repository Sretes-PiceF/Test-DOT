import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service'; // Wajib ada

// Interface untuk payload yang sudah kita masukkan securityStamp
interface JwtPayload {
    userId: number;
    email: string;
    securityStamp: string; // ⭐ Stamp yang ada di token
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService) { // Inject PrismaService
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // Biarkan JWT service menangani kedaluwarsa 24 jam ('1d')
            secretOrKey: process.env.JWT_SECRET as string,
        });
    }

    // Payload sudah dijamin valid (tidak expired, signature benar) oleh super()
    async validate(payload: JwtPayload) {
        // 1. Ambil data user dari database
        const user = await this.prisma.user.findUnique({
            where: { id: payload.userId }
        });

        // 2. Cek apakah user ada DAN Stamp di token cocok dengan Stamp terbaru di database
        if (!user || user.securityStamp !== payload.securityStamp) {
            // ⭐ Stamp tidak cocok -> Token ini adalah token lama/sudah di-invalidasi
            throw new UnauthorizedException('Token has been revoked by a new login or explicit logout.');
        }

        // 3. Token valid (tidak expired, tidak revoked)
        const { password, ...result } = user;
        return result;
    }
}