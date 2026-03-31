// File: src/schedule/presentation/share.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ExportScheduleUseCase } from '../application/export-schedule.use-case';
import { ImportScheduleUseCase } from '../application/import-schedule.use-case';
import { ImportScheduleDto } from './import-schedule.dto';
import { JwtAuthGuard } from '../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../shared/security/current-user.decorator';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class ShareController {
  constructor(
    private readonly exportUseCase: ExportScheduleUseCase,
    private readonly importUseCase: ImportScheduleUseCase,
  ) {}

  @Post('export')
  async exportSchedule(@CurrentUser() userId: string) {
    const hashToken = await this.exportUseCase.execute(userId);
    return { status: 'success', data: { hashToken } };
  }

  @Post('import')
  async importSchedule(
    @CurrentUser() userId: string,
    @Body() dto: ImportScheduleDto,
  ) {
    await this.importUseCase.execute(userId, dto.hashToken);
    return { status: 'success', message: 'Schedule imported successfully' };
  }
}
