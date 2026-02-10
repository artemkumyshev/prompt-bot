import { IsOptional, IsUUID } from 'class-validator';
import { ListQueryDto } from '../../../common/list-query.dto';

export class ListPromptQueryDto extends ListQueryDto {
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsUUID()
  roleId?: string;
}
