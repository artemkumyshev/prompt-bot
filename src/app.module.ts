import { Module } from '@nestjs/common';
import { TelegramModule } from './modules/telegram/telegram.module';
import { ConfigModule } from './shared/config';

@Module({
  imports: [
    ConfigModule,
    TelegramModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
