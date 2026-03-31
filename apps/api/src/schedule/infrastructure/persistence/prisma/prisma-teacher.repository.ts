// File: src/schedule/infrastructure/prisma-teacher.repository.ts
import { Injectable } from '@nestjs/common';
import { ITeacherRepository } from '../domain/teacher.repository.interface';
import { TeacherEntity } from '../../../domain/entities/teacher.entity';
import { PrismaService } from '../../../../shared/prisma/prisma.service';

@Injectable()
export class PrismaTeacherRepository implements ITeacherRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(teacher: TeacherEntity): Promise<void> {
    await this.prisma.teacher.upsert({
      where: { id: teacher.id },
      update: {
        name: teacher.name,
        photoUrl: teacher.photoUrl ?? null,
        contacts: teacher.contacts ?? null,
      },
      create: {
        id: teacher.id,
        name: teacher.name,
        photoUrl: teacher.photoUrl ?? null,
        contacts: teacher.contacts ?? null,
        userId: teacher.userId,
      },
    });
    console.log(`[PrismaTeacherRepository] Teacher '${teacher.name}' saved.`);
  }

  async update(id: string, data: Partial<{ name: string; photoUrl: string | null; contacts: string | null }>): Promise<void> {
    await this.prisma.teacher.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.teacher.delete({ where: { id } });
  }

  async findById(id: string): Promise<TeacherEntity | null> {
    const d = await this.prisma.teacher.findUnique({ where: { id } });
    if (!d) return null;
    return new TeacherEntity(d.id, d.name, d.userId, d.photoUrl ?? undefined, d.contacts ?? undefined);
  }

  async findByUserId(userId: string): Promise<TeacherEntity[]> {
    const data = await this.prisma.teacher.findMany({ where: { userId } });
    return data.map(d => new TeacherEntity(d.id, d.name, d.userId, d.photoUrl ?? undefined, d.contacts ?? undefined));
  }
}
