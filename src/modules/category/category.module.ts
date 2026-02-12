import { Module } from "@nestjs/common";
import { CategoryController } from "./category.controller";
import { CategoryService } from "./category.service";
import { PrismaService } from "src/shared/prisma/prisma.service";

@Module({
    controllers: [CategoryController],
    providers: [CategoryService, PrismaService],
    // exports: [CategoryService],
})
export class CategoryModule { }