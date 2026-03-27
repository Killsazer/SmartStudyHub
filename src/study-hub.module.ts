// File: src/study-hub.module.ts
import { Module } from '@nestjs/common';
import { OnboardingController } from './presentation/controllers/onboarding.controller';
import { OnboardingService } from './application/services/onboarding.service';
import { PrismaSubjectRepository } from './infrastructure/repositories/prisma-subject.repository';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { SubjectController } from './presentation/controllers/subject.controller';
import { SubjectQueryService } from './application/services/subject-query.service';
import { SubjectService } from './application/services/subject.service';
import { TaskController } from './presentation/controllers/task.controller';
import { TaskService } from './application/services/task.service';
import { PrismaTaskRepository } from './infrastructure/repositories/prisma-task.repository';

@Module({
  controllers: [
    OnboardingController,
    SubjectController,
    TaskController
  ],
  providers: [
    OnboardingService,
    SubjectQueryService,
    SubjectService,
    TaskService,
    {
      provide: 'ITaskRepository',
      useClass: PrismaTaskRepository,
    },
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
