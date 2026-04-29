import { Controller, Post, Get, Body, UseGuards, Delete } from '@nestjs/common';
import { AuthService, UserProfileResponse } from '../application/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';
import { ApiResponse } from '../../shared/types/api-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto): Promise<ApiResponse<{ accessToken: string }>> {
    const data = await this.authService.register(dto);
    return { status: 'success', data };
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto): Promise<ApiResponse<{ accessToken: string }>> {
    const data = await this.authService.login(dto);
    return { status: 'success', data };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() userId: string): Promise<ApiResponse<UserProfileResponse>> {
    const data = await this.authService.getProfile(userId);
    return { status: 'success', data };
  }

  @Delete('me')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@CurrentUser() userId: string): Promise<ApiResponse> {
    await this.authService.deleteAccount(userId);
    return { status: 'success', message: 'Account deleted successfully' };
  }
}
