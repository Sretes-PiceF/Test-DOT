import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateCategoriesDto } from './dto/create-categories.dto';

@Injectable()
export class CategoriesService {
    constructor(private prisma: PrismaService) { }

    async getCategories(page: number, limit: number, search: string) {
        const skip = (page - 1) * limit;

        const [categories, total] = await Promise.all([
            this.prisma.categories.findMany({
                where: {
                    categories_name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.categories.count({
                where: {
                    categories_name: {
                        contains: search,
                        mode: 'insensitive',
                    },
                },
            }),
        ]);

        return { categories, total };
    }

    async createCategories(data: CreateCategoriesDto) {
        return this.prisma.categories.create({
            data: {
                categories_name: data.categories_name,
            },
        });
    }
}
