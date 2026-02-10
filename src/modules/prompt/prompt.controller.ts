import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PromptService } from './prompt.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { ListPromptQueryDto } from './dto/list-prompt-query.dto';

@ApiTags('prompts')
@Controller('prompts')
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  @Post()
  create(@Body() createPromptDto: CreatePromptDto) {
    return this.promptService.create(createPromptDto);
  }

  @Get()
  findAll(@Query() query: ListPromptQueryDto) {
    return this.promptService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promptService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromptDto: UpdatePromptDto) {
    return this.promptService.update(id, updatePromptDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.promptService.remove(id);
  }
}
