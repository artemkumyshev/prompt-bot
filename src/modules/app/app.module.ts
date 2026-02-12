import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from 'src/shared/config';
import { CategoryModule } from '../category/category.module';

@Module({
    imports: [
        ConfigModule,
        CategoryModule
    ],
    controllers: [AppController],
})
export class AppModule { }