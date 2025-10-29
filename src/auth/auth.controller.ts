import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { LogoutDto } from './dto/logout.dto';
import { JwtAuthGuard } from '../core/guards/jwt.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: any, @Body() logoutDto: LogoutDto) {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            throw new Error('Token not found');
        }

        return this.authService.logout(token, logoutDto.reason || 'MANUAL_LOGOUT');
    }
}