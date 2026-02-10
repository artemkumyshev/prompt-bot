import { Module } from '@nestjs/common';
import { TelegramModule } from './modules/telegram/telegram.module';
import { ConfigModule } from './shared/config';
import { PrismaModule } from './prisma/prisma.module';
import { DepartmentModule } from './modules/department/department.module';
import { RoleModule } from './modules/role/role.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    TelegramModule,
    DepartmentModule,
    RoleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
