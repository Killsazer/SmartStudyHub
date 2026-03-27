import { Module } from '@nestjs/common';
import { OnboardingController } from './presentation/controllers/onboarding.controller';
import { OnboardingService } from './application/services/onboarding.service';
import { PrismaSubjectRepository } from './infrastructure/repositories/prisma-subject.repository';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { SubjectController } from './presentation/controllers/subject.controller';
import { SubjectQueryService } from './application/services/subject-query.service';

@Module({
  controllers: [
    OnboardingController,
    SubjectController
  ],
  providers: [
    OnboardingService,
    SubjectQueryService,
    // Найсуворіша реалізація Dependency Inversion:
    // Інжектимо інфраструктурний клас в інтерфейс домену (за його строковим токеном).
    {
      provide: 'ISubjectRepository',
      useClass: PrismaSubjectRepository,
    },
    PrismaService,
  ],
})
export class StudyHubModule {}
