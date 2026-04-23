import { Module } from '@nestjs/common';
import { ScheduleSlotController } from './presentation/controllers/schedule-slot.controller';
import { ShareController } from './presentation/controllers/share.controller';
import { ExportScheduleUseCase } from './application/use-cases/export-schedule.use-case';
import { ImportScheduleUseCase } from './application/use-cases/import-schedule.use-case';
import { PrismaScheduleSlotRepository } from './infrastructure/persistence/prisma/prisma-schedule-slot.repository';
import { PrismaSharedScheduleRepository } from './infrastructure/persistence/prisma/prisma-shared-schedule.repository';
import { SharedProvidersModule } from '../shared/shared-providers.module';
import { TeachersModule } from '../teachers/teachers.module';
import { ScheduleSlotService } from './application/schedule-slot.service';

@Module({
  imports: [SharedProvidersModule, TeachersModule],
  controllers: [ScheduleSlotController, ShareController],
  providers: [
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
  exports: [
    'IScheduleSlotRepository' 
  ],
})
export class ScheduleModule {}
