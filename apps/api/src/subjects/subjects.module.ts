// File: src/subjects/subjects.module.ts
import { Module } from '@nestjs/common';
import { OnboardingController } from './presentation/onboarding.controller';
import { SubjectController } from './presentation/subject.controller';
import { OnboardingService } from './application/onboarding.service';
import { SubjectService } from './application/subject.service';
import { SubjectQueryService } from './application/subject-query.service';
import { PrismaSubjectRepository } from './infrastructure/prisma-subject.repository';
import { PrismaTeacherRepository } from '../schedule/infrastructure/prisma-teacher.repository';

@Module({
  controllers: [OnboardingController, SubjectController],
  providers: [
    OnboardingService,
    SubjectService,
    SubjectQueryService,
    {
      provide: 'ISubjectRepository',
      useClass: PrismaSubjectRepository,
    },
    {
      provide: 'ITeacherRepository',
      useClass: PrismaTeacherRepository,
    },
  ],
})
export class SubjectsModule {}
