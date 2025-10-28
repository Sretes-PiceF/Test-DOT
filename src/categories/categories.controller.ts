import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../core/guards/jwt.guard';
import { CategoriesService } from './categories.service';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { CreateCategoryDto } from './dto/update-categories.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard) // ← Gantikan manual verifyToken()
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    // GET /products?page=1&limit=10&search=abc
    @Get()
    async getCategories(@Query() query: GetCategoriesDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const search = query.search || '';

        const { categories, total } = await this.categoriesService.getCategories(
            page,
            limit,
            search,
        );

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            message: 'Categories retrieved successfully',
            data: {
                categories,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            },
        };
    }

    // POST /products
    @Post()
    async createCategory(@Body() body: CreateCategoryDto) {
        const category = await this.categoriesService.createCategories(body);
        return {
            success: true,
            message: 'Categories created successfully',
            data: category,
        };
    }
}
