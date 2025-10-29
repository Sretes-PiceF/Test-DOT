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
import { ProductsService } from './product.service';
import { JwtAuthGuard } from '../core/guards/jwt.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto'; // harus dibuat
import { GetProductDto } from './dto/get-product.dto';

@Controller('Product')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // GET /Product?page=1&limit=10&search=abc
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

    // GET /Product/:id
    @Get(':id')
    async getProductById(@Param('id') id: string) {
        const product = await this.productsService.getProductById(id);
        return {
            success: true,
            message: 'Product retrieved successfully',
            data: product,
        };
    }

    // POST /Product
    @Post()
    async createProduct(@Body() body: CreateProductDto) {
        const product = await this.productsService.createProduct(body);
        return {
            success: true,
            message: 'Product created successfully',
            data: product,
        };
    }

    // PATCH /Product/:id
    @Patch(':id')
    async updateProduct(
        @Param('id') id: string,
        @Body() body: UpdateProductDto,
    ) {
        const updatedProduct = await this.productsService.updateProduct(id, body);
        return {
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct,
        };
    }

    // DELETE /Product/:id
    @Delete(':id')
    async deleteProduct(@Param('id') id: string) {
        await this.productsService.deleteProduct(id);
        return {
            success: true,
            message: 'Product deleted successfully',
        };
    }
}
