// File: src/shared/shared-providers.module.ts
import { Module } from '@nestjs/common';
import { PrismaSubjectRepository } from '../subjects/infrastructure/prisma-subject.repository';
import { PrismaTeacherRepository } from '../teachers/infrastructure/prisma-teacher.repository';

/**
 * Shared providers module — centralises repository bindings
 * that are needed across multiple feature modules (Subjects, Schedule).
 *
 * This eliminates circular imports between SubjectsModule and ScheduleModule
 * by providing shared repository tokens from a single, neutral module.
 */
@Module({
  providers: [
    {
      provide: 'ISubjectRepository',
      useClass: PrismaSubjectRepository,
    },
    {
      provide: 'ITeacherRepository',
      useClass: PrismaTeacherRepository,
    },
  ],
  exports: [
    'ISubjectRepository',
    'ITeacherRepository',
  ],
})
export class SharedProvidersModule {}
