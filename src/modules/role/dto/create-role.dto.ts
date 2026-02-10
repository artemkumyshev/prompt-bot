import { IsString, IsOptional, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsUUID()
  departmentId: string;

  @IsString()
  @MinLength(2, { message: 'name должно быть от 2 до 100 символов' })
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}
