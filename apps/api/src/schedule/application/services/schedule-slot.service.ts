// File: src/schedule/application/schedule-slot.service.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IScheduleSlotRepository } from '../../domain/repositories/schedule-slot.repository.interface';
import { ScheduleSlotEntity, ClassType } from '../../domain/entities/schedule-slot.entity';
import { ScheduleSlotFactory } from '../../domain/patterns/schedule-slot.factory';
import { CreateScheduleSlotDto } from '../../presentation/http/dtos/create-schedule-slot.dto';
import { UpdateScheduleSlotDto } from '../../presentation/http/dtos/update-schedule-slot.dto';

@Injectable()
export class ScheduleSlotService {
  constructor(
    @Inject('IScheduleSlotRepository')
    private readonly slotRepo: IScheduleSlotRepository,
  ) {}

  async createSlot(userId: string, dto: CreateScheduleSlotDto): Promise<ScheduleSlotEntity> {
    const slotId = `slot-${Date.now()}`;
    
    // Use Factory Method pattern to create the appropriate slot type
    const factorySlot = ScheduleSlotFactory.createSlot(dto.classType, {
      id: slotId,
      userId,
      subjectId: dto.subjectId,
      teacherId: dto.teacherId ?? null,
      weekNumber: dto.weekNumber,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      location: dto.location,
    });

    console.log(`[ScheduleSlotService] Factory created: ${factorySlot.getSlotDetails()}`);

    const entity = new ScheduleSlotEntity(
      slotId, userId, dto.subjectId, dto.teacherId ?? null,
      dto.weekNumber, dto.dayOfWeek, dto.startTime, dto.endTime,
      dto.classType as ClassType, dto.location,
    );

    await this.slotRepo.save(entity);
    return entity;
  }

  async updateSlot(userId: string, slotId: string, dto: UpdateScheduleSlotDto): Promise<void> {
    const slot = await this.slotRepo.findById(slotId);
    if (!slot) throw new NotFoundException(`Schedule slot ${slotId} not found`);

    await this.slotRepo.update(slotId, {
      subjectId: dto.subjectId,
      teacherId: dto.teacherId,
      weekNumber: dto.weekNumber,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      classType: dto.classType,
      location: dto.location,
    });
  }

  async deleteSlot(userId: string, slotId: string): Promise<void> {
    await this.slotRepo.delete(slotId);
  }

  async getSlots(userId: string, weekNumber?: number): Promise<ScheduleSlotEntity[]> {
    if (weekNumber) {
      return this.slotRepo.findByUserIdAndWeek(userId, weekNumber);
    }
    return this.slotRepo.findByUserId(userId);
  }
}
