import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl({}, { message: 'photoUrl must be a valid web address' })
  @IsOptional()
  photoUrl?: string;

  @IsString()
  @IsOptional()
  contacts?: string;
}