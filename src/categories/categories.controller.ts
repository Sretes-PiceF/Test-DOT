import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../core/guards/jwt.guard';
import { CategoriesService } from './categories.service';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';

@Controller('Categories')
@UseGuards(JwtAuthGuard) // ← Gantikan manual verifyToken()
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    // GET /api/Categories
    @Get()
    async getCategories(@Query() query: GetCategoriesDto) {
        const search = query.search || '';

        const { categories } = await this.categoriesService.getAllCategories(search);

        return {
            success: true,
            message: 'Seluruh data berhasil diambil',
            data: {
                categories,
            },
        };
    }

    // GET /api/Categories/:id
    @Get(':id')
    async getCategoriesById(@Param('id') id: string) {
        const category = await this.categoriesService.getCategoriesById(id);
        return {
            success: true,
            message: 'Data categories telah terlihat',
            data: category,
        };
    }

    // POST /api/Categories
    @Post()
    async createCategory(@Body() body: CreateCategoriesDto) {
        const category = await this.categoriesService.createCategories(body);
        return {
            success: true,
            message: 'Data categories berhasil dibuat',
            data: category,
        };
    }

    // PATCH /api/Categories/:id
    @Patch(':id')
    async updateCategory(
        @Param('id') id: string,
        @Body() body: UpdateCategoriesDto,
    ) {
        const category = await this.categoriesService.updateCategories(id, body);
        return {
            success: true,
            message: 'Data categories telah terubah',
            data: category,
        };
    }

    // DELETE /api/Categories/:id
    @Delete(':id')
    async deleteCategory(@Param('id') id: string) {
        await this.categoriesService.deleteCategories(id);
        return {
            success: true,
            message: 'Data categories telah terhapus',
        };
    }
}
