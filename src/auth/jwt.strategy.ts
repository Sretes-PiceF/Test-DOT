import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET as string,
            passReqToCallback: true,
        });
    }

    async validate(req: any, payload: any) {
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

        // Cek apakah token di blacklist
        const isValid = await this.authService.validateToken(token as string);
        if (!isValid) {
            throw new UnauthorizedException('Token is invalid or blacklisted');
        }

        return {
            userId: payload.userId,
            email: payload.email
        };
    }
}