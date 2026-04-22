import { Module } from '@nestjs/common';
import { SubjectController } from './presentation/subject.controller';
import { SubjectService } from './application/subject.service';
import { PrismaSubjectRepository } from './infrastructure/prisma-subject.repository';
import { SharedProvidersModule } from '../shared/shared-providers.module';

@Module({
  imports: [
    SharedProvidersModule 
  ],
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
    'ISubjectRepository',
  ],
})
export class SubjectsModule {}
