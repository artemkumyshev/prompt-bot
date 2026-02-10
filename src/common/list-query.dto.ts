import { IsOptional, IsInt, Min, Max, IsIn, IsString } from 'class-validator';
import { Type } from 'class-transformer';

const SORT_ORDER = ['asc', 'desc'] as const;
const SORT_BY = ['name', 'createdAt', 'updatedAt'] as const;

export class ListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsIn(SORT_BY)
  sortBy?: (typeof SORT_BY)[number] = 'updatedAt';

  @IsOptional()
  @IsIn(SORT_ORDER)
  sortOrder?: (typeof SORT_ORDER)[number] = 'desc';

  @IsOptional()
  @IsString()
  search?: string;
}
