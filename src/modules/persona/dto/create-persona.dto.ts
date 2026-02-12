import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePersonaDto {
    @ApiProperty({ example: 'cuid', description: 'CUID категории' })
    @IsString()
    categoryId: string;

    @ApiProperty({ example: 'Маркетинговый аналитик', minLength: 2, maxLength: 100 })
    @IsString()
    @MinLength(2, { message: 'name должно быть от 2 до 100 символов' })
    @MaxLength(100)
    name: string;
  
    @ApiPropertyOptional({ example: 'Анализ рынка и отчёты' })
    @IsString()
    description: string;
  
    @ApiPropertyOptional({ example: 'user' })
    @IsString()
    icon: string;
}