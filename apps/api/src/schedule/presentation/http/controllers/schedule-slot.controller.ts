// File: src/schedule/presentation/schedule-slot.controller.ts
import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ScheduleSlotService } from '../application/schedule-slot.service';
import { CreateScheduleSlotDto } from '../../create-schedule-slot.dto';
import { UpdateScheduleSlotDto } from '../../update-schedule-slot.dto';
import { JwtAuthGuard } from '../../../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../../../shared/security/current-user.decorator';

@Controller('schedule-slots')
@UseGuards(JwtAuthGuard)
export class ScheduleSlotController {
  constructor(private readonly slotService: ScheduleSlotService) {}

  @Post()
  async createSlot(
    @CurrentUser() userId: string,
    @Body() dto: CreateScheduleSlotDto,
  ) {
    const slot = await this.slotService.createSlot(userId, dto);
    return { status: 'success', data: { id: slot.id } };
  }

  @Get()
  async getSlots(
    @CurrentUser() userId: string,
    @Query('week') week?: string,
  ) {
    const weekNum = week ? parseInt(week, 10) : undefined;
    const slots = await this.slotService.getSlots(userId, weekNum);
    return { status: 'success', data: slots };
  }

  @Patch(':id')
  async updateSlot(
    @CurrentUser() userId: string,
    @Param('id') slotId: string,
    @Body() dto: UpdateScheduleSlotDto,
  ) {
    await this.slotService.updateSlot(userId, slotId, dto);
    return { status: 'success', message: 'Schedule slot updated' };
  }

  @Delete(':id')
  async deleteSlot(
    @CurrentUser() userId: string,
    @Param('id') slotId: string,
  ) {
    await this.slotService.deleteSlot(userId, slotId);
    return { status: 'success', message: 'Schedule slot deleted' };
  }
}
