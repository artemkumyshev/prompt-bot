import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Persona } from "@prisma/client";
import { PersonaService } from "./persona.service";
import { CreatePersonaDto } from "./dto/create-persona.dto";
import { UpdatePersonaDto } from "./dto/update-persona.dto";

@ApiTags('personas')
@Controller('personas')
export class PersonaController {
    constructor(private readonly personaService: PersonaService) { }

    @Post()
    create(@Body() dto: CreatePersonaDto): Promise<Persona> {
        return this.personaService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePersonaDto): Promise<Persona> {
        return this.personaService.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string): Promise<void> {
        return this.personaService.delete(id);
    }

    @Get()
    findAll(): Promise<Persona[]> {
        return this.personaService.findAll();
    }

    @Get(':id')
    findById(@Param('id') id: string): Promise<Persona> {
        return this.personaService.findById(id);
    }
}