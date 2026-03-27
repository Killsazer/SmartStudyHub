import { Injectable, Inject } from '@nestjs/common';
import type { ISubjectRepository } from '../../domain/repositories/subject.repository.interface';
import { StudyHubFacade } from '../../domain/patterns/facade/study-hub.facade';

@Injectable()
export class OnboardingService {
  private readonly studyHubFacade: StudyHubFacade;

  constructor(
    // Інжектимо ISubjectRepository за строковим токеном 'ISubjectRepository',
    // оскільки інтерфейси TS не існують під час виконання програми.
    @Inject('ISubjectRepository')
    private readonly subjectRepository: ISubjectRepository
  ) {
    // В чистому ООП ми можемо безпосередньо створювати інстанс Фасаду, 
    // адже він не потребує складних сторонніх залежностей.
    this.studyHubFacade = new StudyHubFacade();
  }

  /**
   * Оркестратор бізнес-логіки. 
   * Дістає готову структуру з Домену та транслює її в Інфраструктуру.
   */
  public async processNewUserOnboarding(userId: string): Promise<void> {
    console.log(`[OnboardingService] Processing onboarding for user: ${userId}`);

    // 1. Викликаємо Фасад, який всередині застосовує Builder та Factory Method
    // і конструює ідеально правильний SubjectEntity з Lessons та Tasks.
    const onboardingSubject = this.studyHubFacade.createOnboardingSubject(userId);

    // 2. Передаємо сутність у Порт (наш інтерфейс ISubjectRepository). 
    // У рантаймі (завдяки DI) тут буде PrismaSubjectRepository, який виконає транзакцію.
    await this.subjectRepository.save(onboardingSubject);

    console.log(`[OnboardingService] Onboarding successfully generated and saved to DB for user: ${userId}`);
  }
}
