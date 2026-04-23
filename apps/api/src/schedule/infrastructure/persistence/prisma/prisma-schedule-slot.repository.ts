import { Injectable } from '@nestjs/common';
import { IScheduleSlotRepository, UpdateScheduleSlotData } from '../../../domain/repositories/schedule-slot.repository.interface';
import { ScheduleSlotEntity, ClassType, ScheduleSlotProps } from '../../../domain/schedule-slot.entity';
import { ScheduleSlotFactory } from '../../../domain/patterns/schedule-slot.factory';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

interface SlotUpdateFields {
  weekNumber?: number;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  classType?: ClassType;
  location?: string | null;
  subject?: { connect: { id: string } };
  teacher?: { connect: { id: string } } | { disconnect: true };
}

@Injectable()
export class PrismaScheduleSlotRepository implements IScheduleSlotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(slot: ScheduleSlotEntity): Promise<ScheduleSlotEntity> {
    const savedData = await this.prisma.scheduleSlot.upsert({
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

    //Трансформуємо сирі дані з БД у нашу Доменну Сутність
    return this.toDomainEntity(savedData);
  }

  // Використовуємо наш чистий тип UpdateScheduleSlotData та повертаємо сутність
  async update(id: string, data: UpdateScheduleSlotData): Promise<ScheduleSlotEntity> {
    const updateData: SlotUpdateFields = {};
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
    
    // Зберігаємо оновлений запис, який повертає Prisma
    const updatedData = await this.prisma.scheduleSlot.update({ 
      where: { id }, 
      data: updateData 
    });

    // Віддаємо домену
    return this.toDomainEntity(updatedData);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.scheduleSlot.delete({ where: { id } });
  }

  async findById(id: string): Promise<ScheduleSlotEntity | null> {
    const d = await this.prisma.scheduleSlot.findUnique({ where: { id } });
    if (!d) return null;
    return this.toDomainEntity(d);
  }

  async findByUserId(userId: string): Promise<ScheduleSlotEntity[]> {
    const data = await this.prisma.scheduleSlot.findMany({
      where: { userId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    return data.map(d => this.toDomainEntity(d));
  }

  async findByUserIdAndWeek(userId: string, weekNumber: number): Promise<ScheduleSlotEntity[]> {
    const data = await this.prisma.scheduleSlot.findMany({
      where: { userId, weekNumber },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
    return data.map(d => this.toDomainEntity(d));
  }

  private toDomainEntity(d: {
    id: string;
    userId: string;
    subjectId: string;
    teacherId: string | null;
    weekNumber: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    classType: string;
    location: string | null;
  }): ScheduleSlotEntity {
    
    // Збираємо "коробку" з даними для Фабрики
    const props: ScheduleSlotProps = {
      id: d.id,
      userId: d.userId,
      subjectId: d.subjectId,
      teacherId: d.teacherId,
      weekNumber: d.weekNumber,
      dayOfWeek: d.dayOfWeek,
      startTime: d.startTime,
      endTime: d.endTime,
      location: d.location ?? undefined,
    };

    // Делегуємо створення конкретного підкласу (Лекція, Лаба) Фабриці
    return ScheduleSlotFactory.createSlot(d.classType as ClassType, props);
  }
}