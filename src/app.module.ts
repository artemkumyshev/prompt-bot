import { Module } from '@nestjs/common';
import { TelegramModule } from './modules/telegram/telegram.module';
import { ConfigModule } from './shared/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule, TelegramModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
