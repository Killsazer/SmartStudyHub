import { Injectable, Inject } from '@nestjs/common';
import type { ISubjectRepository } from '../domain/subject.repository.interface';
import type { ITeacherRepository } from 'src/schedule/domain/repositories/teacher.repository.interface';
import { StudyHubFacade } from '../domain/patterns/study-hub.facade';

@Injectable()
export class OnboardingService {
  private readonly studyHubFacade: StudyHubFacade;

  constructor(
    @Inject('ISubjectRepository')
    private readonly subjectRepository: ISubjectRepository,
    @Inject('ITeacherRepository')
    private readonly teacherRepository: ITeacherRepository,
  ) {
    this.studyHubFacade = new StudyHubFacade();
  }

  public async processNewUserOnboarding(userId: string): Promise<void> {
    console.log(`[OnboardingService] Processing onboarding for user: ${userId}`);
    const { subject, teacher } = this.studyHubFacade.createOnboardingData(userId);
    await this.subjectRepository.save(subject);
    await this.teacherRepository.save(teacher);
    console.log(`[OnboardingService] Onboarding successfully generated and saved to DB for user: ${userId}`);
  }
}
