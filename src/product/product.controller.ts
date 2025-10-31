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
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductDto } from './dto/get-product.dto'; // Akan dimodifikasi

@Controller('Product')
@UseGuards(JwtAuthGuard)
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    // GET /api/Product
    @Get()
    async getProduct(@Query() query: GetProductDto) {
        // HANYA ambil 'search'
        const search = query.search || '';

        // Panggil service TANPA page dan limit. Service akan mengembalikan SEMUA produk.
        const products = await this.productsService.getAllProduct(search);
        // Nama method service diubah menjadi getAllProducts agar lebih jelas

        return {
            success: true,
            message: 'Seluruh data berhasil diambil',
            data: products,
        };
    }

    // GET /api/Product/:id
    @Get(':id')
    async getProductById(@Param('id') id: string) {
        const product = await this.productsService.getProductById(id);
        return {
            success: true,
            message: 'Data product telah terlihat',
            data: product,
        };
    }

    // POST /api/Product
    @Post()
    async createProduct(@Body() CreateProductDto: CreateProductDto) {
        const product = await this.productsService.createProduct(CreateProductDto);
        return {
            success: true,
            message: 'Data product berhasil dibuat',
            data: product,
        };
    }

    // PATCH /api/Product/:id
    @Patch(':id')
    async updateProduct(
        @Param('id') id: string,
        @Body() body: UpdateProductDto,
    ) {
        const updatedProduct = await this.productsService.updateProduct(id, body);
        return {
            success: true,
            message: 'Data product telah terubah',
            data: updatedProduct,
        };
    }

    // DELETE /api/Product/:id
    @Delete(':id')
    async deleteProduct(@Param('id') id: string) {
        await this.productsService.deleteProduct(id);
        return {
            success: true,
            message: 'Data product telah terhapus',
        };
    }
}