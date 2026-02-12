import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from 'src/shared/config';
import { CategoryModule } from '../category/category.module';
import { PersonaModule } from '../persona/persona.module';

@Module({
    imports: [
        ConfigModule,
        CategoryModule,
        PersonaModule
    ],
    controllers: [AppController],
})
export class AppModule { }