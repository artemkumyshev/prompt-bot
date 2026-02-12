import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Category } from "@prisma/client";
import { PrismaService } from "src/shared/prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    /** Создание новой категории. */
    async create(dto: CreateCategoryDto): Promise<Category> {
        const category = await this.prisma.category.findUnique({
            where: {
                name: dto.name.trim(),
            }
        })

        if (category) {
            throw new BadRequestException('Категория с таким именем уже существует');
        }

        return this.prisma.category.create({
            data: dto
        })
    }

    /** Обновление категории. */
    async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findById(id);

        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }

        return this.prisma.category.update({
            where: { id },
            data: dto
        })
    }

    /** Удаление категории. */
    async delete(id: string): Promise<void> {
        const category = await this.findById(id);

        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }

        await this.prisma.category.delete({ where: { id } })
    }

    /** Получение всех категорий. */
    async findAll(): Promise<Category[]> {
        return this.prisma.category.findMany({
            orderBy: {
                name: 'asc',
            }
        })
    }

    /** Получение категории по идентификатору. */
    async findById(id: string): Promise<Category> {
        const category = await this.prisma.category.findUnique({ where: { id } })
        if (!category) {
            throw new NotFoundException('Категория не найдена');
        }
        return category;
    }


}