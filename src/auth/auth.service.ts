import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { TokenBlacklistService } from '../core/token-blacklist.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        private blacklistService: TokenBlacklistService,
    ) { }

    async validateUser(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user) throw new UnauthorizedException('User not found');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new UnauthorizedException('Invalid password');

        return user;
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email };
        const token = this.jwtService.sign(payload);
        return { access_token: token };
    }

    async logout(token: string) {
        const decoded: any = this.jwtService.decode(token);
        const expiresAt = new Date(decoded.exp * 1000);
        await this.blacklistService.addToken(token, expiresAt);
        return { message: 'Logged out successfully' };
    }

    async isBlacklisted(token: string) {
        return this.blacklistService.isBlacklisted(token);
    }
}
