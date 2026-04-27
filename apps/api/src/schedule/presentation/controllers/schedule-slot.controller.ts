import {
  Controller, Post, Get, Patch, Delete, Body, Param, Query,
  UseGuards, ParseIntPipe, Logger,
} from '@nestjs/common';
import { ScheduleSlotService } from '../../application/schedule-slot.service';
import { CreateScheduleSlotDto } from '../dto/schedule-slot/create-schedule-slot.dto';
import { UpdateScheduleSlotDto } from '../dto/schedule-slot/update-schedule-slot.dto';
import { JwtAuthGuard } from '../../../shared/security/jwt-auth.guard';
import { CurrentUser } from '../../../shared/security/current-user.decorator';
import { ApiResponse } from '../../../shared/types/api-response.interface';
import { ScheduleSlotEntity } from '../../domain/schedule-slot.entity';

@Controller('schedule-slots')
@UseGuards(JwtAuthGuard)
export class ScheduleSlotController {
  private readonly logger = new Logger(ScheduleSlotController.name);

  constructor(private readonly slotService: ScheduleSlotService) {}

  @Post()
  async createSlot(
    @CurrentUser() userId: string,
    @Body() dto: CreateScheduleSlotDto,
  ): Promise<ApiResponse<ScheduleSlotEntity>> {
    this.logger.log(`Create schedule slot request from user: ${userId}`);
    const slot = await this.slotService.createSlot(userId, dto);
    return { status: 'success', data: slot };
  }

  @Get()
  async getSlots(
    @CurrentUser() userId: string,
    @Query('week', new ParseIntPipe({ optional: true })) weekNum?: number,
  ): Promise<ApiResponse<ScheduleSlotEntity[]>> {
    const slots = await this.slotService.getSlots(userId, weekNum);
    return { status: 'success', data: slots };
  }

  @Patch(':id')
  async updateSlot(
    @CurrentUser() userId: string,
    @Param('id') slotId: string,
    @Body() dto: UpdateScheduleSlotDto,
  ): Promise<ApiResponse<ScheduleSlotEntity>> {
    const updatedSlot = await this.slotService.updateSlot(userId, slotId, dto);
    return { status: 'success', data: updatedSlot };
  }

  @Delete(':id')
  async deleteSlot(
    @CurrentUser() userId: string,
    @Param('id') slotId: string,
  ): Promise<ApiResponse> {
    await this.slotService.deleteSlot(userId, slotId);
    return { status: 'success', message: 'Schedule slot deleted successfully' };
  }
}