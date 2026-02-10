import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../../shared/common/list-query.dto';

export class ListRoleQueryDto extends ListQueryDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655430000', description: 'Фильтр по отделу' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
