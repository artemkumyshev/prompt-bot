import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from 'src/shared/config';

@Module({
    imports: [
        ConfigModule,
    ],
    controllers: [AppController],
})
export class AppModule { }