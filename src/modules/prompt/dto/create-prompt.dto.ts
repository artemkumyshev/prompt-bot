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
  @IsString()
  key: string;

  @IsString()
  text: string;
}

export class KeyReferenceItemDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  year: string;

  @IsArray()
  @IsString({ each: true })
  keyinsights: string[];
}

export class CriteriaItemDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsString()
  description: string;
}

export class CreatePromptDto {
  @IsString()
  @MinLength(2, { message: 'name: от 2 до 120 символов' })
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsString()
  @MinLength(10, { message: 'prompt: минимум 10 символов' })
  prompt: string;

  @IsString()
  @MinLength(2, { message: 'task: от 2 до 200 символов' })
  @MaxLength(200)
  task: string;

  @IsString()
  @MinLength(10, { message: 'task_description: минимум 10 символов' })
  task_description: string;

  @IsUUID()
  departmentId: string;

  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RuleItemDto)
  rules?: RuleItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyReferenceItemDto)
  key_references?: KeyReferenceItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriteriaItemDto)
  criteria?: CriteriaItemDto[];

  @IsOptional()
  @IsObject()
  evaluationRubric?: Record<string, string>;
}
