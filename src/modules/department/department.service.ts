import { ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { PaginatedResponseDto } from '../../shared/common/paginated-response.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { ListDepartmentQueryDto } from './dto/list-department-query.dto';
import { Department } from '@prisma/client';

export class DepartmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDepartmentDto): Promise<Department> {
    return this.prisma.department.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        icon: dto.icon?.trim() ?? null,
      },
    });
  }

  async findAll(query: ListDepartmentQueryDto): Promise<PaginatedResponseDto<Department>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'updatedAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const search = query.search?.trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.department.count({ where }),
    ]);

    return new PaginatedResponseDto(items, page, pageSize, total);
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });
    if (!department) {
      throw new NotFoundException('Отдел не найден');
    }
    return department;
  }

  async update(id: string, dto: UpdateDepartmentDto): Promise<Department> {
    await this.findOne(id);
    return this.prisma.department.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() ?? null }),
        ...(dto.icon !== undefined && { icon: dto.icon?.trim() ?? null }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const department = await this.prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { roles: true, prompts: true } } },
    });
    if (!department) {
      throw new NotFoundException('Отдел не найден');
    }
    if (department._count.roles > 0 || department._count.prompts > 0) {
      throw new ConflictException({
        message: 'Невозможно удалить: есть связанные роли или промпты',
        errorCode: 'HAS_DEPENDENCIES',
      });
    }
    await this.prisma.department.delete({ where: { id } });
  }
}
