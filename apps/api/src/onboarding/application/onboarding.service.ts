import { Injectable, Inject } from '@nestjs/common';
import type { ISubjectRepository } from '../../subjects/domain/subject.repository.interface';
import type { ITeacherRepository } from 'src/schedule/domain/repositories/teacher.repository.interface';
import { OnboardingFacade } from '../domain/patterns/onboarding.facade';

@Injectable()
export class OnboardingService {
  constructor(
    private readonly onboardingFacade: OnboardingFacade,
    
    @Inject('ISubjectRepository')
    private readonly subjectRepository: ISubjectRepository,
    
    @Inject('ITeacherRepository')
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  public async processNewUserOnboarding(userId: string): Promise<void> {
    try {
      console.log(`[OnboardingService] Starting onboarding for user: ${userId}`);

      const { subject, teacher } = this.onboardingFacade.createInitialStudyData(userId);

      await this.teacherRepository.save(teacher);

      await this.subjectRepository.save(subject);

      console.log(`[OnboardingService] Successfully generated initial data for user: ${userId}`);
    } catch (error) {
      console.error(`[OnboardingService] Failed to process onboarding:`, error);
      throw error; 
    }
  }
}
