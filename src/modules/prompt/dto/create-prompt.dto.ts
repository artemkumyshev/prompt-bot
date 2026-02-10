import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
  IsArray,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RuleItemDto {
  @ApiProperty({ example: 'rule_1' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Всегда проверяй источник данных' })
  @IsString()
  text: string;
}

export class KeyReferenceItemDto {
  @ApiProperty({ example: 'Marketing Analytics Guide' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Иванов И.' })
  @IsString()
  author: string;

  @ApiProperty({ example: '2024' })
  @IsString()
  year: string;

  @ApiProperty({ example: ['Вывод 1', 'Вывод 2'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  keyinsights: string[];
}

export class CriteriaItemDto {
  @ApiProperty({ example: 'criteria_1' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Полнота ответа' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Ответ покрывает все пункты задания' })
  @IsString()
  description: string;
}

export class CreatePromptDto {
  @ApiProperty({ example: 'Промпт для отчёта', minLength: 2, maxLength: 120 })
  @IsString()
  @MinLength(2, { message: 'name: от 2 до 120 символов' })
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({ example: 'file-text' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 'Ты — аналитик. Сформируй структурированный отчёт по данным...', minLength: 10 })
  @IsString()
  @MinLength(10, { message: 'prompt: минимум 10 символов' })
  prompt: string;

  @ApiProperty({ example: 'Подготовить еженедельный отчёт', minLength: 2, maxLength: 200 })
  @IsString()
  @MinLength(2, { message: 'task: от 2 до 200 символов' })
  @MaxLength(200)
  task: string;

  @ApiProperty({ example: 'Отчёт должен содержать метрики, тренды и рекомендации.', minLength: 10 })
  @IsString()
  @MinLength(10, { message: 'task_description: минимум 10 символов' })
  task_description: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655430000' })
  @IsUUID()
  departmentId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655430001' })
  @IsUUID()
  roleId: string;

  @ApiPropertyOptional({
    description: 'Массив правил { key, text }',
    example: [{ key: 'rule_1', text: 'Проверяй источник' }, { key: 'rule_2', text: 'Цитируй данные' }],
    type: [RuleItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleItemDto)
  rules?: RuleItemDto[];

  @ApiPropertyOptional({
    description: 'Массив источников { title, author, year, keyinsights }',
    example: [{ title: 'Гайд', author: 'Иванов', year: '2024', keyinsights: ['Вывод 1'] }],
    type: [KeyReferenceItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyReferenceItemDto)
  key_references?: KeyReferenceItemDto[];

  @ApiPropertyOptional({
    description: 'Массив критериев { key, name, description }',
    example: [{ key: 'c1', name: 'Полнота', description: 'Все пункты покрыты' }],
    type: [CriteriaItemDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriteriaItemDto)
  criteria?: CriteriaItemDto[];

  @ApiPropertyOptional({
    description: 'Рубрика оценки: ключ — оценка (строка), значение — описание',
    example: { '1': 'Неудовлетворительно', '5': 'Удовлетворительно', '10': 'Отлично' },
  })
  @IsOptional()
  @IsObject()
  evaluationRubric?: Record<string, string>;
}
