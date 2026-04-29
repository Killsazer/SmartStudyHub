import { IsString, IsNotEmpty, IsOptional, IsHexColor, MaxLength } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @IsHexColor()
  @IsOptional()
  color?: string;
}
