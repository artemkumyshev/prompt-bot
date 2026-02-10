import {
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginatedResponseDto } from '../../common/paginated-response.dto';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { ListPromptQueryDto } from './dto/list-prompt-query.dto';

type PromptWithRelations = Prisma.PromptGetPayload<{
  include: { department: { select: { id: true; name: true } }; role: { select: { id: true; name: true } } };
}>;

export class PromptService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureRoleBelongsToDepartment(
    roleId: string,
    departmentId: string,
  ): Promise<void> {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { departmentId: true },
    });
    if (!role) {
      throw new ConflictException({
        message: 'Роль не найдена',
        errorCode: 'FK_CONSTRAINT',
      });
    }
    if (role.departmentId !== departmentId) {
      throw new BadRequestException({
        message: 'Роль не принадлежит указанному отделу',
        errorCode: 'ROLE_DEPARTMENT_MISMATCH',
      });
    }
  }

  private toJsonSafe(
    rules?: { key: string; text: string }[],
    key_references?: { title: string; author: string; year: string; keyinsights: string[] }[],
    criteria?: { key: string; name: string; description: string }[],
    evaluationRubric?: Record<string, string>,
  ): { rules: Prisma.JsonArray; key_references: Prisma.JsonArray; criteria: Prisma.JsonArray; evaluationRubric: Prisma.JsonObject } {
    return {
      rules: (rules ?? []) as unknown as Prisma.JsonArray,
      key_references: (key_references ?? []) as unknown as Prisma.JsonArray,
      criteria: (criteria ?? []) as unknown as Prisma.JsonArray,
      evaluationRubric: (evaluationRubric ?? {}) as Prisma.JsonObject,
    };
  }

  async create(dto: CreatePromptDto) {
    await this.ensureRoleBelongsToDepartment(dto.roleId, dto.departmentId);
    const json = this.toJsonSafe(dto.rules, dto.key_references, dto.criteria, dto.evaluationRubric);
    return this.prisma.prompt.create({
      data: {
        name: dto.name.trim(),
        icon: dto.icon?.trim() ?? null,
        prompt: dto.prompt.trim(),
        task: dto.task.trim(),
        task_description: dto.task_description.trim(),
        departmentId: dto.departmentId,
        roleId: dto.roleId,
        rules: json.rules,
        key_references: json.key_references,
        criteria: json.criteria,
        evaluationRubric: json.evaluationRubric,
      },
    });
  }

  async findAll(query: ListPromptQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = query.sortBy ?? 'updatedAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const search = query.search?.trim();
    const departmentId = query.departmentId;
    const roleId = query.roleId;

    const where: Prisma.PromptWhereInput = {};
    if (departmentId) where.departmentId = departmentId;
    if (roleId) where.roleId = roleId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { task: { contains: search, mode: 'insensitive' } },
        { prompt: { contains: search, mode: 'insensitive' } },
        { task_description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.prompt.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.prompt.count({ where }),
    ]);

    return new PaginatedResponseDto(items, page, pageSize, total);
  }

  async findOne(id: string): Promise<PromptWithRelations> {
    const prompt = await this.prisma.prompt.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
      },
    });
    if (!prompt) {
      throw new NotFoundException('Промпт не найден');
    }
    return prompt;
  }

  async update(id: string, dto: UpdatePromptDto) {
    const existing = await this.prisma.prompt.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Промпт не найден');
    }

    const departmentId = dto.departmentId ?? existing.departmentId;
    const roleId = dto.roleId ?? existing.roleId;
    if (dto.departmentId !== undefined || dto.roleId !== undefined) {
      await this.ensureRoleBelongsToDepartment(roleId, departmentId);
    }

    const json = this.toJsonSafe(dto.rules, dto.key_references, dto.criteria, dto.evaluationRubric);

    return this.prisma.prompt.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.icon !== undefined && { icon: dto.icon?.trim() ?? null }),
        ...(dto.prompt !== undefined && { prompt: dto.prompt.trim() }),
        ...(dto.task !== undefined && { task: dto.task.trim() }),
        ...(dto.task_description !== undefined && { task_description: dto.task_description.trim() }),
        ...(dto.departmentId !== undefined && { departmentId: dto.departmentId }),
        ...(dto.roleId !== undefined && { roleId: dto.roleId }),
        ...(dto.rules !== undefined && { rules: json.rules }),
        ...(dto.key_references !== undefined && { key_references: json.key_references }),
        ...(dto.criteria !== undefined && { criteria: json.criteria }),
        ...(dto.evaluationRubric !== undefined && { evaluationRubric: json.evaluationRubric }),
      },
    });
  }

  async remove(id: string): Promise<void> {
    const prompt = await this.prisma.prompt.findUnique({ where: { id } });
    if (!prompt) {
      throw new NotFoundException('Промпт не найден');
    }
    await this.prisma.prompt.delete({ where: { id } });
  }
}
