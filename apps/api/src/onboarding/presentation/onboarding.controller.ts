import { Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { OnboardingService } from '../application/onboarding.service';
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async startOnboarding(@CurrentUser() userId: string) {
    await this.onboardingService.processNewUserOnboarding(userId);

    return {
      status: 'success',
      message: 'Initial study data generated successfully',
      data: { userId }
    };
  }
}
