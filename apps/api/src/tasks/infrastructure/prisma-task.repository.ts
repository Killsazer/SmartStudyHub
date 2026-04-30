import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { ITaskRepository } from '../domain/task.repository.interface';
import { TaskEntity, TaskStatus, TaskPriority, TaskProps } from '../domain/task.entity';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(task: TaskEntity): Promise<TaskEntity> {
    const savedData = await this.prisma.task.upsert({
      where: { id: task.id },
      update: {
        title: task.title,
        description: task.description ?? null,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline ?? null,
        subjectId: task.subjectId ?? null,
        userId: task.userId,
        recurrenceDays: task.recurrenceDays ?? null,
      },
      create: {
        id: task.id,
        title: task.title,
        description: task.description ?? null,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline ?? null,
        subjectId: task.subjectId ?? null,
        userId: task.userId,
        recurrenceDays: task.recurrenceDays ?? null,
      }
    });

    return this.toDomainEntity(savedData);
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

  private toDomainEntity(d: {
    id: string;
    title: string;
    status: string;
    priority: string;
    userId: string;
    description: string | null;
    deadline: Date | null;
    subjectId: string | null;
    recurrenceDays: number | null;
  }): TaskEntity {
    const props: TaskProps = {
      id: d.id,
      title: d.title,
      status: d.status as TaskStatus,
      priority: d.priority as TaskPriority,
      userId: d.userId,
      description: d.description ?? undefined,
      deadline: d.deadline ?? undefined,
      subjectId: d.subjectId ?? undefined,
      recurrenceDays: d.recurrenceDays ?? undefined
    };
    return new TaskEntity(props);
  }
}
