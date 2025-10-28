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

    // 🔹 GET /users
    @Get()
    async findAll() {
        const users = await this.userService.findAll();
        return {
            success: true,
            message: 'All users retrieved successfully',
            data: users,
        };
    }

    // 🔹 GET /users/:id
    @Get(':id')
    async findOne(@Param('id') id: number) {
        const user = await this.userService.findOne(Number(id));
        if (!user) throw new NotFoundException('User not found');
        return {
            success: true,
            message: 'User retrieved successfully',
            data: user,
        };
    }

    // 🔹 POST /users
    @Post()
    async create(@Body() dto: CreateUserDto) {
        const user = await this.userService.create(dto);
        return {
            success: true,
            message: 'User created successfully',
            data: user,
        };
    }

    // 🔹 PUT /users/:id
    @Put(':id')
    async update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
        const updated = await this.userService.update(Number(id), dto);
        return {
            success: true,
            message: 'User updated successfully',
            data: updated,
        };
    }

    // 🔹 DELETE /users/:id
    @Delete(':id')
    async delete(@Param('id') id: number) {
        await this.userService.delete(Number(id));
        return {
            success: true,
            message: 'User deleted successfully',
        };
    }
}
