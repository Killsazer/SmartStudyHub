// File: src/schedule/schedule.module.ts
import { Module } from '@nestjs/common';
import { TeacherController } from './presentation/teacher.controller';
import { ScheduleSlotController } from './presentation/schedule-slot.controller';
import { ShareController } from './presentation/share.controller';
import { TeacherService } from './application/teacher.service';
import { ScheduleSlotService } from './application/schedule-slot.service';
import { ExportScheduleUseCase } from './application/export-schedule.use-case';
import { ImportScheduleUseCase } from './application/import-schedule.use-case';
import { PrismaTeacherRepository } from './infrastructure/prisma-teacher.repository';
import { PrismaScheduleSlotRepository } from './infrastructure/prisma-schedule-slot.repository';
import { PrismaSharedScheduleRepository } from './infrastructure/prisma-shared-schedule.repository';
import { PrismaSubjectRepository } from '../subjects/infrastructure/prisma-subject.repository';

@Module({
  controllers: [TeacherController, ScheduleSlotController, ShareController],
  providers: [
    TeacherService,
    ScheduleSlotService,
    ExportScheduleUseCase,
    ImportScheduleUseCase,
    {
      provide: 'ITeacherRepository',
      useClass: PrismaTeacherRepository,
    },
    {
      provide: 'IScheduleSlotRepository',
      useClass: PrismaScheduleSlotRepository,
    },
    {
      provide: 'ISharedScheduleRepository',
      useClass: PrismaSharedScheduleRepository,
    },
    // Needed by Export/Import use cases
    {
      provide: 'ISubjectRepository',
      useClass: PrismaSubjectRepository,
    },
  ],
})
export class ScheduleModule {}
