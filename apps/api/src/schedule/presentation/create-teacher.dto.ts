// File: src/schedule/presentation/create-teacher.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  contacts?: string;
}
