import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import type { ISubjectRepository } from '../../subjects/domain/subject.repository.interface';
import type { ITeacherRepository } from '../../teachers/domain/teacher.repository.interface';
import { OnboardingFacade } from '../domain/patterns/onboarding.facade';

@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly onboardingFacade: OnboardingFacade,
    
    @Inject('ISubjectRepository')
    private readonly subjectRepository: ISubjectRepository,
    
    @Inject('ITeacherRepository')
    private readonly teacherRepository: ITeacherRepository,
  ) {}

  public async processNewUserOnboarding(userId: string): Promise<void> {
    if (!userId || typeof userId !== 'string') {
      throw new BadRequestException('Valid userId is required for onboarding');
    }

    this.logger.log(`Starting onboarding for user: ${userId}`);

    const { subject, teacher } = this.onboardingFacade.createInitialStudyData(userId);

    await this.teacherRepository.save(teacher);

    await this.subjectRepository.save(subject);

    this.logger.log(`Successfully completed onboarding for user: ${userId}`);
  }
}
