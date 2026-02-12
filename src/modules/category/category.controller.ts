import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { Category } from "@prisma/client";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    create(@Body() dto: CreateCategoryDto): Promise<Category> {
        return this.categoryService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCategoryDto): Promise<Category> {
        return this.categoryService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<void> {
        return this.categoryService.delete(id);
    }

    @Get()
    findAll(): Promise<Category[]> {
        return this.categoryService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string): Promise<Category> {
        return this.categoryService.findById(id);
    }
}