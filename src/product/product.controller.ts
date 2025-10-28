import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ProductsService } from './product.service';
import { JwtAuthGuard } from '../core/guards/jwt.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductDto } from './dto/get-product.dto';

@Controller('products')
@UseGuards(JwtAuthGuard) // ← Gantikan manual verifyToken()
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // GET /products?page=1&limit=10&search=abc
    @Get()
    async getProduct(@Query() query: GetProductDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const search = query.search || '';

        const { products, total } = await this.productsService.getProduct(
            page,
            limit,
            search,
        );

        const totalPages = Math.ceil(total / limit);

        return {
            success: true,
            message: 'Products retrieved successfully',
            data: {
                products,
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
    async createProduct(@Body() body: CreateProductDto) {
        const product = await this.productsService.createProduct(body);
        return {
            success: true,
            message: 'Product created successfully',
            data: product,
        };
    }
}
