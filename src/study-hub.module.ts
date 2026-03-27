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
import { NoteController } from './presentation/controllers/note.controller';
import { NoteService } from './application/services/note.service';
import { PrismaNoteRepository } from './infrastructure/repositories/prisma-note.repository';

@Module({
  controllers: [
    OnboardingController,
    SubjectController,
    TaskController,
    NoteController
  ],
  providers: [
    OnboardingService,
    SubjectQueryService,
    SubjectService,
    TaskService,
    NoteService,
    {
      provide: 'ITaskRepository',
      useClass: PrismaTaskRepository,
    },
    {
      provide: 'INoteRepository',
      useClass: PrismaNoteRepository,
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
