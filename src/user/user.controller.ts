import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // 🔹 GET /user
    @Get()
    async findAll() {
        const users = await this.userService.findAll();
        return {
            success: true,
            message: 'Seluruh data telah berhasil diambil',
            data: users,
        };
    }

    // 🔹 GET /user/:id
    @Get(':id')
    async findOne(@Param('id') id: number) {
        const user = await this.userService.findOne(Number(id));
        if (!user) throw new NotFoundException('User not found');
        return {
            success: true,
            message: 'Data User telah terlihat',
            data: user,
        };
    }

    // 🔹 POST /user
    @Post()
    async create(@Body() dto: CreateUserDto) {
        const user = await this.userService.create(dto);
        return {
            success: true,
            message: 'Data User berhasil dibuat',
            data: user,
        };
    }

    // 🔹 PUT /user/:id
    @Put(':id')
    async update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
        const updated = await this.userService.update(Number(id), dto);
        return {
            success: true,
            message: 'Data User telah terubah',
            data: updated,
        };
    }

    // 🔹 DELETE /user/:id
    @Delete(':id')
    async delete(@Param('id') id: number) {
        await this.userService.delete(Number(id));
        return {
            success: true,
            message: 'Data User telah terhapus',
        };
    }
}
