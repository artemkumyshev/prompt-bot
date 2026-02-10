import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';

const SORT_ORDER = ['asc', 'desc'] as const;
const SORT_BY = ['name', 'createdAt', 'updatedAt'] as const;

export class ListQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @ApiPropertyOptional({ enum: ['name', 'createdAt', 'updatedAt'], default: 'updatedAt' })
  @IsOptional()
  @IsIn(SORT_BY)
  sortBy?: (typeof SORT_BY)[number] = 'updatedAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(SORT_ORDER)
  sortOrder?: (typeof SORT_ORDER)[number] = 'desc';

  @ApiPropertyOptional({ example: 'поиск', description: 'Подстрока без учёта регистра (ILIKE)' })
  @IsOptional()
  @IsString()
  search?: string;
}
