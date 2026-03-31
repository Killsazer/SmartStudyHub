// File: src/schedule/presentation/update-teacher.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateTeacherDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  contacts?: string;
}
