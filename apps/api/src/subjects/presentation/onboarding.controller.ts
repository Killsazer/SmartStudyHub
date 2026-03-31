// File: src/subjects/presentation/onboarding.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { OnboardingService } from '../application/onboarding.service';
import { OnboardingDto } from './onboarding.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  async startOnboarding(@Body() dto: OnboardingDto) {
    await this.onboardingService.processNewUserOnboarding(dto.userId);

    return {
      status: 'success',
      message: 'Onboarding completed successfully',
      data: { userId: dto.userId }
    };
  }
}
