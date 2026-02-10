import { IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../../common/list-query.dto';

export class ListRoleQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
