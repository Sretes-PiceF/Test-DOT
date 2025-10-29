import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { CreateCategoriesDto } from './dto/create-categories.dto';
import { UpdateCategoriesDto } from './dto/update-categories.dto';

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

    async getCategoriesById(id: string) {
        const category = await this.prisma.categories.findUnique({
            where: { categories_id: id },
        });
        if (!category) {
            throw new Error('Category not found');
        }
        return category;
    }

    async updateCategories(id: string, data: UpdateCategoriesDto) {
        const existing = await this.prisma.categories.findUnique({ where: { categories_id: id } });
        if (!existing) {
            throw new Error('Category not found');
        }

        return this.prisma.categories.update({
            where: { categories_id: id },
            data: {
                categories_name: data.categories_name,
            },
        });
    }

    async deleteCategories(id: string) {
        const existing = await this.prisma.categories.findUnique({ where: { categories_id: id } });
        if (!existing) {
            throw new Error('Category not found');
        }
        return this.prisma.categories.delete({ where: { categories_id: id } });
    }
}
