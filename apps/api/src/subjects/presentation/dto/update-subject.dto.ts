// File: src/subjects/presentation/update-subject.dto.ts
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateSubjectDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(7)
  color?: string;
}
