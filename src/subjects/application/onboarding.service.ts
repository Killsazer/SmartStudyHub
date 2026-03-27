// File: src/subjects/application/onboarding.service.ts
import { Injectable, Inject } from '@nestjs/common';
import type { ISubjectRepository } from '../domain/subject.repository.interface';
import { StudyHubFacade } from '../domain/patterns/study-hub.facade';

@Injectable()
export class OnboardingService {
  private readonly studyHubFacade: StudyHubFacade;

  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepository: ISubjectRepository
  ) {
    this.studyHubFacade = new StudyHubFacade();
  }

  public async processNewUserOnboarding(userId: string): Promise<void> {
    console.log(`[OnboardingService] Processing onboarding for user: ${userId}`);
    const onboardingSubject = this.studyHubFacade.createOnboardingSubject(userId);
    await this.subjectRepository.save(onboardingSubject);
    console.log(`[OnboardingService] Onboarding successfully generated and saved to DB for user: ${userId}`);
  }
}
