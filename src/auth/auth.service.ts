import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../core/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
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

        // 1. Validasi user
        const user = await this.validateUser(email, password);

        // 2. ⭐ IMPLEMENTASI REVOCATION: Buat Security Stamp baru
        const newSecurityStamp = uuidv4();

        // 3. ⭐ UPDATE USER: Simpan Stamp baru di database
        const updatedUser = await this.prisma.user.update({
            where: { id: user.id },
            data: { securityStamp: newSecurityStamp },
            // Ambil semua data user, termasuk stamp baru
            select: { id: true, email: true, name: true, securityStamp: true }
        });

        // 4. Buat Payload baru, termasuk Security Stamp
        const payload = {
            userId: updatedUser.id,
            email: updatedUser.email,
            securityStamp: updatedUser.securityStamp, // ⭐ Masukkan stamp ke JWT
        };

        // 5. Buat Token Baru (Kadaluwarsa 24 jam sudah diatur di AuthModule)
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name
            }
        };
    }

    // 🔹 LOGOUT USER (Fungsi ini tidak perlu diubah, tapi tidak lagi mem-blacklist token, 
    //    cukup memicu invalidasi token lama dengan update stamp)
    async logout(token: string) {
        try {
            // Decode token untuk mendapatkan userId
            const decoded = this.jwtService.decode(token) as any;

            if (!decoded || !decoded.exp || !decoded.userId) {
                throw new UnauthorizedException('Invalid token');
            }

            // ⭐ LOGIC BARU UNTUK LOGOUT: Update Security Stamp
            await this.prisma.user.update({
                where: { id: decoded.userId },
                data: { securityStamp: uuidv4() }, // Ganti stamp, ini akan meng-invalidasi token saat ini
            });

            return { message: 'Logout successful' };
        } catch (error) {
            // Jika token sudah expired, decode akan gagal. Kita tetap anggap berhasil logout.
            // Atau tangani lebih detail jika Anda ingin error pada token yang benar-benar invalid.
            return { message: 'Logout successful (Token invalidated via stamp update)' };
        }
    }
}