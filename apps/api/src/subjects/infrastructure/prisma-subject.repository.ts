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
      const entity = new SubjectEntity(r.id, r.title, r.userId);
      entity.color = r.color ?? '#000000';
      entity.tasks = r.tasks ?? [];
      entity.scheduleSlots = r.scheduleSlots ?? [];
      return entity;
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