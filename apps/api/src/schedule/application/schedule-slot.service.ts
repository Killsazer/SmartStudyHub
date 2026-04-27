import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import type { IScheduleSlotRepository } from '../domain/repositories/schedule-slot.repository.interface';
import { ScheduleSlotEntity, ScheduleSlotProps } from '../domain/schedule-slot.entity';
import { ScheduleSlotFactory } from '../domain/patterns/schedule-slot.factory';
import { CreateScheduleSlotDto } from '../presentation/dto/schedule-slot/create-schedule-slot.dto';
import { UpdateScheduleSlotDto } from '../presentation/dto/schedule-slot/update-schedule-slot.dto';
import { TeacherService } from '../../teachers/application/teacher.service';
import { randomUUID } from 'crypto';

@Injectable()
export class ScheduleSlotService {
  private readonly logger = new Logger(ScheduleSlotService.name);

  constructor(
    @Inject('IScheduleSlotRepository')
    private readonly slotRepo: IScheduleSlotRepository,

    private readonly teacherService: TeacherService,
  ) {}

  async createSlot(userId: string, dto: CreateScheduleSlotDto): Promise<ScheduleSlotEntity> {
    if (dto.teacherId) {
      const teacher = await this.teacherService.findTeacherById(dto.teacherId);
      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${dto.teacherId} not found`);
      }
    }

    const slotId = randomUUID();

    const props: ScheduleSlotProps = {
      id: slotId,
      userId,
      subjectId: dto.subjectId,
      teacherId: dto.teacherId ?? null,
      weekNumber: dto.weekNumber,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      location: dto.location,
    };

    const entity = ScheduleSlotFactory.createSlot(dto.classType, props);

    this.logger.log(`Factory created slot: ${entity.getSlotDetails()}`);

    await this.slotRepo.save(entity);
    return entity;
  }

  async updateSlot(userId: string, slotId: string, dto: UpdateScheduleSlotDto): Promise<ScheduleSlotEntity> {
    await this.checkAccess(slotId, userId);
    
    if (dto.teacherId) {
      const teacher = await this.teacherService.findTeacherById(dto.teacherId);
      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${dto.teacherId} not found`);
      }
    }

    return await this.slotRepo.update(slotId, dto);
  }

  async deleteSlot(userId: string, slotId: string): Promise<void> {
    await this.checkAccess(slotId, userId);
    await this.slotRepo.delete(slotId);
  }

  async getSlots(userId: string, weekNumber?: number): Promise<ScheduleSlotEntity[]> {
    if (weekNumber) {
      return this.slotRepo.findByUserIdAndWeek(userId, weekNumber);
    }
    return this.slotRepo.findByUserId(userId);
  }

  private async checkAccess(slotId: string, userId: string): Promise<void> { 
    const slot = await this.slotRepo.findById(slotId);
    if (!slot) {
      throw new NotFoundException(`Schedule slot ${slotId} not found`);
    }

    if (slot.userId !== userId) {
      throw new ForbiddenException('Access denied: You can only modify your own schedule slots');
    }
  }
}
