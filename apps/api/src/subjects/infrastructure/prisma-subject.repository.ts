import { Injectable } from '@nestjs/common';
import { ISubjectRepository } from '../domain/subject.repository.interface';
import { SubjectEntity } from '../domain/subject.entity';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ScheduleSlotFactory } from 'src/schedule/domain/patterns/schedule-slot.factory';
import { TaskEntity } from 'src/tasks/domain/task.entity';
import { ClassType, TaskPriority, TaskStatus } from '@prisma/client';

@Injectable()
export class PrismaSubjectRepository implements ISubjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(subject: SubjectEntity): Promise<void> {
    await this.prisma.subject.create({
      data: {
        id: subject.id,
        title: subject.title,
        color: subject.color,
        userId: subject.userId,
        
        // Каскадне збереження завдань (якщо Білдер їх додав)
        tasks: subject.tasks.length > 0 ? {
          create: subject.tasks.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            deadline: task.deadline,
            userId: subject.userId, // Зв'язок з юзером (з твоєї schema.prisma)
          }))
        } : undefined,

        // Каскадне збереження розкладу (якщо Білдер його додав)
        scheduleSlots: subject.scheduleSlots.length > 0 ? {
          create: subject.scheduleSlots.map(slot => ({
            id: slot.id,
            weekNumber: slot.weekNumber,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            classType: slot.classType,
            location: slot.location,
            userId: subject.userId,
            teacherId: slot.teacherId,
          }))
        } : undefined,
      },
    });
  }

  async findByUserId(userId: string): Promise<SubjectEntity[]> {
  const records = await this.prisma.subject.findMany({
    where: { userId },
    include: {
      tasks: true,
      scheduleSlots: true,
    },
  });

  return records.map((r) => {
    // 1. Створюємо базовий агрегат
    const entity = new SubjectEntity(r.id, r.title, r.userId);
    entity.color = r.color ?? '#000000';

    // 2. Правильний мапінг завдань (POJO -> Domain Entity)
    entity.tasks = (r.tasks ?? []).map(taskData => new TaskEntity({
      id: taskData.id,
      title: taskData.title,
      description: taskData.description ?? undefined,
      status: taskData.status as any,
      priority: taskData.priority as any,
      deadline: taskData.deadline ?? undefined,
      userId: taskData.userId,
      subjectId: taskData.subjectId ?? undefined,
    }));

    // 3. Правильний мапінг слотів 
    entity.scheduleSlots = (r.scheduleSlots ?? []).map(slotData => 
      ScheduleSlotFactory.createSlot(slotData.classType as any, {
        id: slotData.id,
        weekNumber: slotData.weekNumber,
        dayOfWeek: slotData.dayOfWeek,
        startTime: slotData.startTime,
        endTime: slotData.endTime,
        location: slotData.location ?? undefined,
        userId: slotData.userId,
        subjectId: slotData.subjectId,
        teacherId: slotData.teacherId,
      })
    );

    return entity;
  });
}

  async findById(id: string): Promise<SubjectEntity | null> {
    const record = await this.prisma.subject.findUnique({ where: { id } });

    if (!record) return null;
    
    const entity = new SubjectEntity(record.id, record.title, record.userId);
    entity.color = record.color ?? '#000000';
    return entity;
  }

  async update(id: string, data: Partial<{ title: string; color: string | null }>): Promise<void> {
    await this.prisma.subject.update({
      where: { id },
      data: {
        title: data.title,
        color: data.color,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subject.delete({
      where: { id },
    });
  }
}