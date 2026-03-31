// File: src/schedule/infrastructure/prisma-schedule-slot.repository.ts
import { Injectable } from '@nestjs/common';
import { IScheduleSlotRepository } from '../domain/schedule-slot.repository.interface';
import { ScheduleSlotEntity, ClassType } from '../domain/schedule-slot.entity';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PrismaScheduleSlotRepository implements IScheduleSlotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(slot: ScheduleSlotEntity): Promise<void> {
    await this.prisma.scheduleSlot.upsert({
      where: { id: slot.id },
      update: {
        subjectId: slot.subjectId,
        teacherId: slot.teacherId,
        weekNumber: slot.weekNumber,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        classType: slot.classType,
        location: slot.location ?? null,
      },
      create: {
        id: slot.id,
        userId: slot.userId,
        subjectId: slot.subjectId,
        teacherId: slot.teacherId,
        weekNumber: slot.weekNumber,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        classType: slot.classType,
        location: slot.location ?? null,
      },
    });
    console.log(`[PrismaScheduleSlotRepo] Slot saved: day=${slot.dayOfWeek}, ${slot.startTime}-${slot.endTime}`);
  }

  async update(id: string, data: Partial<{
    subjectId: string;
    teacherId: string | null;
    weekNumber: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classType: string;
    location: string | null;
  }>): Promise<void> {
    const updateData: any = {};
    if (data.weekNumber !== undefined) updateData.weekNumber = data.weekNumber;
    if (data.dayOfWeek !== undefined) updateData.dayOfWeek = data.dayOfWeek;
    if (data.startTime !== undefined) updateData.startTime = data.startTime;
    if (data.endTime !== undefined) updateData.endTime = data.endTime;
    if (data.classType !== undefined) updateData.classType = data.classType;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.subjectId !== undefined) updateData.subject = { connect: { id: data.subjectId } };
    if (data.teacherId !== undefined) {
      updateData.teacher = data.teacherId ? { connect: { id: data.teacherId } } : { disconnect: true };
    }
    await this.prisma.scheduleSlot.update({ where: { id }, data: updateData });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.scheduleSlot.delete({ where: { id } });
  }

  async findById(id: string): Promise<ScheduleSlotEntity | null> {
    const d = await this.prisma.scheduleSlot.findUnique({ where: { id } });
    if (!d) return null;
    return new ScheduleSlotEntity(
      d.id, d.userId, d.subjectId, d.teacherId,
      d.weekNumber, d.dayOfWeek, d.startTime, d.endTime,
      d.classType as ClassType, d.location ?? undefined,
    );
  }

  async findByUserId(userId: string): Promise<ScheduleSlotEntity[]> {
    const data = await this.prisma.scheduleSlot.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    return data.map(d => new ScheduleSlotEntity(
      d.id, d.userId, d.subjectId, d.teacherId,
      d.weekNumber, d.dayOfWeek, d.startTime, d.endTime,
      d.classType as ClassType, d.location ?? undefined,
    ));
  }

  async findByUserIdAndWeek(userId: string, weekNumber: number): Promise<ScheduleSlotEntity[]> {
    const data = await this.prisma.scheduleSlot.findMany({
      where: { userId, weekNumber },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    return data.map(d => new ScheduleSlotEntity(
      d.id, d.userId, d.subjectId, d.teacherId,
      d.weekNumber, d.dayOfWeek, d.startTime, d.endTime,
      d.classType as ClassType, d.location ?? undefined,
    ));
  }
}
