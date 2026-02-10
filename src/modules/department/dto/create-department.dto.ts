import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Маркетинг', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2, { message: 'name должно быть от 2 до 100 символов' })
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Отдел маркетинга и рекламы', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'briefcase', maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  icon?: string;
}
