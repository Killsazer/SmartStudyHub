// File: src/subjects/infrastructure/prisma-subject.repository.ts
import { Injectable } from '@nestjs/common';
import { ISubjectRepository } from '../domain/subject.repository.interface';
import { SubjectEntity } from '../domain/subject.entity';
import { PrismaService } from '../../shared/prisma/prisma.service';

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

        tasks: {
          create: subject.tasks.map((task) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            deadline: task.deadline,
            userId: task.userId,
          })),
        },
      },
    });

    console.log(`[PrismaSubjectRepository] Successfully saved Subject '${subject.title}' with ${subject.tasks.length} tasks to PostgreSQL.`);
  }

  async findByUserId(userId: string): Promise<any[]> {
    return this.prisma.subject.findMany({
      where: { userId },
      include: {
        tasks: true,
        scheduleSlots: true,
      },
    });
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
