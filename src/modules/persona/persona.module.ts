import { Module } from "@nestjs/common";
import { PrismaService } from "src/shared/prisma/prisma.service";
import { PersonaController } from "./persona.controller";
import { PersonaService } from "./persona.service";

@Module({
    controllers: [PersonaController],
    providers: [PersonaService, PrismaService],
})
export class PersonaModule { }