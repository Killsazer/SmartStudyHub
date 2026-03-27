import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  teacherName?: string;

  @IsHexColor()
  @IsOptional()
  color?: string;
}
