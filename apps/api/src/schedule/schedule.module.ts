import { Module } from '@nestjs/common';
import { TeacherController } from './presentation/controllers/teacher.controller';
import { ScheduleSlotController } from './presentation/controllers/schedule-slot.controller';
import { ShareController } from './presentation/controllers/share.controller';
import { TeacherService } from './application/services/teacher.service';
import { ScheduleSlotService } from './application/services/schedule-slot.service';
import { ExportScheduleUseCase } from './application/use-cases/export-schedule.use-case';
import { ImportScheduleUseCase } from './application/use-cases/import-schedule.use-case';
import { PrismaScheduleSlotRepository } from './infrastructure/persistence/prisma/prisma-schedule-slot.repository';
import { PrismaSharedScheduleRepository } from './infrastructure/persistence/prisma/prisma-shared-schedule.repository';
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
