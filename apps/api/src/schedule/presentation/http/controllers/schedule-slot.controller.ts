import { 
  Controller, Post, Get, Patch, Delete, Body, Param, Query, 
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { ScheduleSlotService } from '../../../application/services/schedule-slot.service';
import { CreateScheduleSlotDto } from '../dto/schedule-slot/create-schedule-slot.dto';
import { UpdateScheduleSlotDto } from '../dto/schedule-slot/update-schedule-slot.dto';
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
    return { status: 'success', data: slot };
  }

  @Get()
  async getSlots(
    @CurrentUser() userId: string,
    @Query('week', new ParseIntPipe({ optional: true })) weekNum?: number,
  ) {
    const slots = await this.slotService.getSlots(userId, weekNum);
    return { status: 'success', data: slots };
  }

  @Patch(':id')
  async updateSlot(
    @CurrentUser() userId: string,
    @Param('id') slotId: string,
    @Body() dto: UpdateScheduleSlotDto,
  ) {
    const updatedSlot = await this.slotService.updateSlot(userId, slotId, dto);
    return { status: 'success', data: updatedSlot };
  }

  @Delete(':id')
  async deleteSlot(
    @CurrentUser() userId: string,
    @Param('id') slotId: string,
  ) {
    await this.slotService.deleteSlot(userId, slotId);
    return { status: 'success', message: 'Schedule slot deleted successfully' };
  }
}