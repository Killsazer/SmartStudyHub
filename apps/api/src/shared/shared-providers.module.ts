import { Module } from '@nestjs/common';
import { PrismaSubjectRepository } from '../subjects/infrastructure/prisma-subject.repository';
import { PrismaTeacherRepository } from '../teachers/infrastructure/prisma-teacher.repository';

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
