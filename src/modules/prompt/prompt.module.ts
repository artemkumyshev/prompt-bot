import { Module } from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptController } from './prompt.controller';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Module({
  controllers: [PromptController],
  providers: [PromptService, PrismaService],
  exports: [PromptService],
})
export class PromptModule {}
