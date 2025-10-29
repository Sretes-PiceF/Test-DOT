import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/prisma.service';
import { TokenBlacklistService } from '../auth/service/token-blacklist.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private tokenBlacklistService: TokenBlacklistService,
    ) { }

    // 🔹 Digunakan oleh strategy atau controller login
    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            throw new BadRequestException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }

        // ✅ Return user tanpa password
        const { password: _, ...result } = user;
        return result;
    }

    // 🔹 REGISTER USER
    async register(registerDto: RegisterDto) {
        const { email, password, name } = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new BadRequestException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return { message: 'User registered successfully', user };
    }

    // 🔹 LOGIN USER
    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Gunakan validateUser di sini juga
        const user = await this.validateUser(email, password);

        const payload = {
            userId: user.id,
            email: user.email,
        };

        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        };
    }

    // 🔹 LOGOUT USER (Manual)
    async logout(token: string, reason: string = 'MANUAL_LOGOUT') {
        try {
            // Decode token untuk mendapatkan expiry
            const decoded = this.jwtService.decode(token) as any;

            if (!decoded || !decoded.exp) {
                throw new UnauthorizedException('Invalid token');
            }

            const expiresAt = new Date(decoded.exp * 1000); // Convert to milliseconds

            // Tambahkan token ke blacklist
            await this.tokenBlacklistService.addToBlacklist(token, expiresAt, reason);

            return { message: 'Logout successful' };
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    // 🔹 VALIDATE TOKEN (Untuk guard)
    async validateToken(token: string): Promise<boolean> {
        try {
            // Cek apakah token di blacklist
            const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(token);
            if (isBlacklisted) {
                return false;
            }

            // Verify token
            this.jwtService.verify(token);
            return true;
        } catch (error) {
            return false;
        }
    }

    // 🔹 AUTO LOGOUT (Token expired)
    async autoLogoutExpiredTokens() {
        await this.tokenBlacklistService.cleanupExpiredTokens();
    }
}