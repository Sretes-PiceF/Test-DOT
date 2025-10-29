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

@Controller('categories')
@UseGuards(JwtAuthGuard) // ← Gantikan manual verifyToken()
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    // GET /products?page=1&limit=10&search=abc
    @Get()
    async getCategories(@Query() query: GetCategoriesDto) {
        const search = query.search || '';

        const { categories } = await this.categoriesService.getAllCategories(search);

        return {
            success: true,
            message: 'Categories retrieved successfully',
            data: {
                categories,
            },
        };
    }

    @Get(':id')
    async getCategoriesById(@Param('id') id: string) {
        const category = await this.categoriesService.getCategoriesById(id);
        return {
            success: true,
            message: 'Category retrieved successfully',
            data: category,
        };
    }

    // POST /products
    @Post()
    async createCategory(@Body() body: CreateCategoriesDto) {
        const category = await this.categoriesService.createCategories(body);
        return {
            success: true,
            message: 'Categories created successfully',
            data: category,
        };
    }

    @Patch(':id')
    async updateCategory(
        @Param('id') id: string,
        @Body() body: UpdateCategoriesDto,
    ) {
        const category = await this.categoriesService.updateCategories(id, body);
        return {
            success: true,
            message: 'Category updated successfully',
            data: category,
        };
    }

    @Delete(':id')
    async deleteCategory(@Param('id') id: string) {
        await this.categoriesService.deleteCategories(id);
        return {
            success: true,
            message: 'Category deleted successfully',
        };
    }
}
