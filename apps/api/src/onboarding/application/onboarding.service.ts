import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { OnboardingFacade } from './onboarding.facade';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly onboardingFacade: OnboardingFacade,
  ) {}

  public async processNewUserOnboarding(userId: string): Promise<void> {
    if (!userId || typeof userId !== 'string') {
      throw new BadRequestException('Valid userId is required for onboarding');
    }

    this.logger.log(`Starting onboarding for user: ${userId}`);

    await this.onboardingFacade.createInitialStudyData(userId);

    this.logger.log(`Successfully completed onboarding for user: ${userId}`);
  }
}
