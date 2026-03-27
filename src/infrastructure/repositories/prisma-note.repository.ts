// File: src/infrastructure/repositories/prisma-note.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { INoteRepository } from '../../domain/repositories/note.repository.interface';
import { NoteEntity } from '../../domain/entities/note.entity';

@Injectable()
export class PrismaNoteRepository implements INoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(note: NoteEntity): Promise<void> {
    await this.prisma.note.upsert({
      where: { id: note.id },
      update: {
        title: note.title,
        content: note.content,
        parentId: note.parentId,
        userId: note.userId,
        subjectId: note.subjectId
      },
      create: {
        id: note.id,
        title: note.title,
        content: note.content ?? null,
        parentId: note.parentId ?? null,
        userId: note.userId,
        subjectId: note.subjectId ?? null
      }
    });
  }

  async findByUserId(userId: string): Promise<NoteEntity[]> {
    const data = await this.prisma.note.findMany({ where: { userId } });
    return data.map(d => new NoteEntity(
      d.id,
      d.title,
      d.userId,
      d.content ?? undefined,
      d.parentId ?? undefined,
      d.subjectId ?? undefined
    ));
  }
}
