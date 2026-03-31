import { IsString, IsNotEmpty, IsOptional, IsHexColor } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsHexColor()
  @IsOptional()
  color?: string;
}
