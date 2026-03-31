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
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const data = await this.prisma.task.findUnique({ where: { id } });
    if (!data) return null;
    return this.toDomainEntity(data);
  }

  async findByUserId(userId: string): Promise<TaskEntity[]> {
    const data = await this.prisma.task.findMany({ where: { userId } });
    return data.map(d => this.toDomainEntity(d));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({ where: { id } });
  }

  /**
   * Maps a raw Prisma record to a TaskEntity domain object.
   * Centralised to eliminate mapping duplication across find methods (DRY).
   */
  private toDomainEntity(d: {
    id: string;
    title: string;
    status: string;
    priority: string;
    userId: string;
    description: string | null;
    deadline: Date | null;
    subjectId: string | null;
  }): TaskEntity {
    return new TaskEntity(
      d.id,
      d.title,
      d.status as TaskStatus,
      d.priority as TaskPriority,
      d.userId,
      d.description ?? undefined,
      d.deadline ?? undefined,
      d.subjectId ?? undefined
    );
  }
}
