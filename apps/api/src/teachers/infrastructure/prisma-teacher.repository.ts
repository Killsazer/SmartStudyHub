import { Injectable } from '@nestjs/common';
import { ITeacherRepository, UpdateTeacherData } from '../domain/teacher.repository.interface';
import { TeacherEntity, TeacherProps } from '../domain/teacher.entity';
import { PrismaService } from '../../shared/prisma/prisma.service';

@Injectable()
export class PrismaTeacherRepository implements ITeacherRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(teacher: TeacherEntity): Promise<TeacherEntity> {
    const savedData = await this.prisma.teacher.upsert({
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
    return this.toDomainEntity(savedData);
  }

  async update(id: string, data: UpdateTeacherData): Promise<TeacherEntity> {
    const updatedData = await this.prisma.teacher.update({
      where: { id },
      data,
    });
    return this.toDomainEntity(updatedData);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.teacher.delete({ where: { id } });
  }

  async findById(id: string): Promise<TeacherEntity | null> {
    const d = await this.prisma.teacher.findUnique({ where: { id } });
    if (!d) return null;
    return this.toDomainEntity(d);
  }

  async findByUserId(userId: string): Promise<TeacherEntity[]> {
    const data = await this.prisma.teacher.findMany({ where: { userId } });
    return data.map(d => this.toDomainEntity(d));
  }

  private toDomainEntity(d: {
    id: string;
    userId: string;
    name: string;
    photoUrl: string | null;
    contacts: string | null;
  }): TeacherEntity {
    const props: TeacherProps = {
      id: d.id,
      userId: d.userId,
      name: d.name,
      photoUrl: d.photoUrl ?? undefined,
      contacts: d.contacts ?? undefined,
    };
    return new TeacherEntity(props);
  }
}