import { Controller, Post, Body } from '@nestjs/common';
import { OnboardingService } from '../../application/services/onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  async startOnboarding(@Body('userId') userId: string) {
    if (!userId) {
      return { status: 400, message: 'userId is required in the request body.' };
    }

    // Виклик Application Layer (Use Case) не турбуючись про деталі реалізації
    await this.onboardingService.processNewUserOnboarding(userId);

    return {
      status: 'success',
      message: 'Onboarding completed successfully',
      data: {
        userId
      }
    };
  }
}
