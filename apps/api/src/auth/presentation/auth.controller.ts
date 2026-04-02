// File: src/auth/presentation/auth.controller.ts
import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() userId: string) {
    return this.authService.getProfile(userId);
  }
}
