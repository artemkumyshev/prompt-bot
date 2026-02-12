import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Persona } from "@prisma/client";
import { PrismaService } from "src/shared/prisma/prisma.service";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { UpdatePersonaDto } from "./dto/update-persona.dto";

@Injectable()
export class PersonaService {
    constructor(private readonly prisma: PrismaService) { }

    /** Создание новой персоны. */
    async create(dto: CreatePersonaDto): Promise<Persona> {
        const persona = await this.prisma.persona.findUnique({
            where: {
                name: dto.name.trim(),
            }
        })

        if (persona) {
            throw new BadRequestException('Категория с таким именем уже существует');
        }

        return this.prisma.persona.create({
            data: {
                categoryId: dto.categoryId.trim(),
                name: dto.name.trim(),
                description: dto.description.trim(),
                icon: dto.icon.trim(),
            }
        })
    }

    /** Обновление персоны. */
    async update(id: string, dto: UpdatePersonaDto): Promise<Persona> {
        const persona = await this.findById(id);

        if (!persona) {
            throw new NotFoundException('Персона не найдена');
        }

        return this.prisma.persona.update({
            where: { id },
            data: dto
        })
    }

    /** Удаление персоны. */
    async delete(id: string): Promise<void> {
        const persona = await this.findById(id);

        if (!persona) {
            throw new NotFoundException('Персона не найдена');
        }

        await this.prisma.persona.delete({ where: { id } })
    }

    /** Получение всех персон. */
    async findAll(): Promise<Persona[]> {
        return this.prisma.persona.findMany({
            orderBy: {
                name: 'asc',
            }
        })
    }

    /** Получение персоны по идентификатору. */
    async findById(id: string): Promise<Persona> {
        const persona = await this.prisma.persona.findUnique({ where: { id } })
        if (!persona) {
            throw new NotFoundException('Персона не найдена');
        }
        return persona;
    }


}