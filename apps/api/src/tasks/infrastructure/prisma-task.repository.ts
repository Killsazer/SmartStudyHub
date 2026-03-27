// File: src/tasks/infrastructure/prisma-task.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ITaskRepository } from '../domain/task.repository.interface';
import { TaskEntity, TaskStatus, TaskPriority } from '../domain/task.entity';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(task: TaskEntity): Promise<void> {
    await this.prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        subjectId: task.subjectId,
        userId: task.userId
      },
      create: {
        id: task.id,
        title: task.title,
        description: task.description ?? null,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline ?? null,
        subjectId: task.subjectId ?? null,
        userId: task.userId
      }
    });
    console.log(`[PrismaTaskRepository] Task '${task.title}' saved.`);
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const data = await this.prisma.task.findUnique({ where: { id } });
    if (!data) return null;
    
    return new TaskEntity(
      data.id,
      data.title,
      data.status as TaskStatus,
      data.priority as TaskPriority,
      data.userId,
      data.description ?? undefined,
      data.deadline ?? undefined,
      data.subjectId ?? undefined
    );
  }

  async findByUserId(userId: string): Promise<TaskEntity[]> {
    const data = await this.prisma.task.findMany({ where: { userId } });
    return data.map(d => new TaskEntity(
      d.id,
      d.title,
      d.status as TaskStatus,
      d.priority as TaskPriority,
      d.userId,
      d.description ?? undefined,
      d.deadline ?? undefined,
      d.subjectId ?? undefined
    ));
  }
}
