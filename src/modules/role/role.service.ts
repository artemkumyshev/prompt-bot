import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { PaginatedResponseDto } from '../../shared/common/paginated-response.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ListRoleQueryDto } from './dto/list-role-query.dto';
import { Role } from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto): Promise<Role> {
    return this.prisma.role.create({
      data: {
        departmentId: dto.departmentId,
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        icon: dto.icon?.trim() ?? null,
      },
    });
  }

  async findAll(query: ListRoleQueryDto): Promise<PaginatedResponseDto<Role>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'updatedAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const search = query.search?.trim();
    const departmentId = query.departmentId;

    const where: Prisma.RoleWhereInput = {};
    if (departmentId) where.departmentId = departmentId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.role.count({ where }),
    ]);

    return new PaginatedResponseDto(items, page, pageSize, total);
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }
    return role;
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    await this.findOne(id);
    return this.prisma.role.update({
      where: { id },
      data: {
        ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description?.trim() ?? null }),
        ...(dto.icon !== undefined && { icon: dto.icon?.trim() ?? null }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { prompts: true } } },
    });
    if (!role) {
      throw new NotFoundException('Роль не найдена');
    }
    if (role._count.prompts > 0) {
      throw new ConflictException({
        message: 'Невозможно удалить: есть связанные промпты',
        errorCode: 'HAS_DEPENDENCIES',
      });
    }
    await this.prisma.role.delete({ where: { id } });
  }
}
