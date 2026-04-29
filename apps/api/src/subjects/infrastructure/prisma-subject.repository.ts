import { Injectable } from '@nestjs/common';
import { ISubjectRepository } from '../domain/subject.repository.interface';
import { SubjectEntity } from '../domain/subject.entity';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PrismaSubjectRepository implements ISubjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(subject: SubjectEntity): Promise<SubjectEntity> {
    const savedData = await this.prisma.subject.upsert({
      where: { id: subject.id },
      update: {
        title: subject.title,
        color: subject.color,
      },
      create: {
        id: subject.id,
        title: subject.title,
        color: subject.color,
        userId: subject.userId,
      },
    });

    return this.toDomainEntity(savedData);
  }

  async findByUserId(userId: string): Promise<SubjectEntity[]> {
    const records = await this.prisma.subject.findMany({
      where: { userId },
    });

    return records.map((r) => this.toDomainEntity(r));
  }

  async findById(id: string): Promise<SubjectEntity | null> {
    const record = await this.prisma.subject.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomainEntity(record);
  }

  async update(id: string, data: Partial<{ title: string; color: string | null }>): Promise<SubjectEntity> {
    const updatedData = await this.prisma.subject.update({
      where: { id },
      data: {
        title: data.title,
        color: data.color,
      },
    });
    return this.toDomainEntity(updatedData);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subject.delete({
      where: { id },
    });
  }

  async deleteAll(userId: string): Promise<void> {
    await this.prisma.subject.deleteMany({
      where: { userId },
    });
  }

  private toDomainEntity(d: {
    id: string;
    title: string;
    userId: string;
    color: string | null;
  }): SubjectEntity {
    return new SubjectEntity({
      id: d.id,
      title: d.title,
      userId: d.userId,
      color: d.color ?? '#000000',
    });
  }
}