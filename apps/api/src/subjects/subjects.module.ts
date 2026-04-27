import { Module } from '@nestjs/common';
import { SubjectController } from './presentation/subject.controller';
import { SubjectService } from './application/subject.service';
import { PrismaSubjectRepository } from './infrastructure/prisma-subject.repository';

@Module({
  controllers: [
    SubjectController 
  ],
  providers: [
    SubjectService,
    {
      provide: 'ISubjectRepository',
      useClass: PrismaSubjectRepository,
    },
  ],
  exports: [
    SubjectService,
  ],
})
export class SubjectsModule {}
