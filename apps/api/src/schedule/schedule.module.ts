// File: src/schedule/schedule.module.ts
import { Module } from '@nestjs/common';
import { TeacherController } from './presentation/teacher.controller';
import { ScheduleSlotController } from './presentation/schedule-slot.controller';
import { ShareController } from './presentation/share.controller';
import { TeacherService } from './application/teacher.service';
import { ScheduleSlotService } from './application/schedule-slot.service';
import { ExportScheduleUseCase } from './application/export-schedule.use-case';
import { ImportScheduleUseCase } from './application/import-schedule.use-case';
import { PrismaScheduleSlotRepository } from './infrastructure/prisma-schedule-slot.repository';
import { PrismaSharedScheduleRepository } from './infrastructure/prisma-shared-schedule.repository';
import { SharedProvidersModule } from '../shared/shared-providers.module';

@Module({
  imports: [SharedProvidersModule],
  controllers: [TeacherController, ScheduleSlotController, ShareController],
  providers: [
    TeacherService,
    ScheduleSlotService,
    ExportScheduleUseCase,
    ImportScheduleUseCase,
    {
      provide: 'IScheduleSlotRepository',
      useClass: PrismaScheduleSlotRepository,
    },
    {
      provide: 'ISharedScheduleRepository',
      useClass: PrismaSharedScheduleRepository,
    },
  ],
})
export class ScheduleModule {}
