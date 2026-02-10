import { Module } from '@nestjs/common';
import { TelegramModule } from './modules/telegram/telegram.module';
import { ConfigModule } from './shared/config';
import { DepartmentModule } from './modules/department/department.module';
import { RoleModule } from './modules/role/role.module';
import { PromptModule } from './modules/prompt/prompt.module';
import { PrismaService } from './shared/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule,
    TelegramModule,
    DepartmentModule,
    RoleModule,
    PromptModule,
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],

})
export class AppModule {}
