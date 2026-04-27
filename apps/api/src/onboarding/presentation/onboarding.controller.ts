import { Controller, Post, UseGuards, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { OnboardingService } from '../application/onboarding.service';
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';
import { ApiResponse } from '../../shared/types/api-response.interface';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  private readonly logger = new Logger(OnboardingController.name);

  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async startOnboarding(@CurrentUser() userId: string): Promise<ApiResponse<{ userId: string }>> {
    this.logger.log(`Onboarding request received for user: ${userId}`);

    await this.onboardingService.processNewUserOnboarding(userId);

    return {
      status: 'success',
      message: 'Initial study data generated successfully',
      data: { userId },
    };
  }
}
