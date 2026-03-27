// File: src/presentation/dtos/login-user.dto.ts
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
