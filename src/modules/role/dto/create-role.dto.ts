import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID отдела' })
  @IsUUID()
  departmentId: string;

  @ApiProperty({ example: 'Маркетинговый аналитик', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2, { message: 'name должно быть от 2 до 100 символов' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Анализ рынка и отчёты' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'user' })
  @IsOptional()
  @IsString()
  icon?: string;
}
