import { Module } from '@nestjs/common';
import { TeacherController } from './presentation/teacher.controller';
import { TeacherService } from './application/teacher.service';
import { PrismaTeacherRepository } from './infrastructure/prisma-teacher.repository';

@Module({
  controllers: [TeacherController],
  providers: [
    TeacherService,
    {
      provide: 'ITeacherRepository', 
      useClass: PrismaTeacherRepository,
    },
  ],
  exports: [TeacherService, 'ITeacherRepository'], 
})
export class TeachersModule {}
