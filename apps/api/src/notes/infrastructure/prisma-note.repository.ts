import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { INoteRepository } from '../domain/note.repository.interface';
import { NoteEntity, NoteProps } from '../domain/note.entity';

@Injectable()
export class PrismaNoteRepository implements INoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(note: NoteEntity): Promise<NoteEntity> {
    const savedData = await this.prisma.note.upsert({
      where: { id: note.id },
      update: {
        title: note.title,
        content: note.content,
        parentId: note.parentId,
        userId: note.userId,
        subjectId: note.subjectId,
      },
      create: {
        id: note.id,
        title: note.title,
        content: note.content ?? null,
        parentId: note.parentId ?? null,
        userId: note.userId,
        subjectId: note.subjectId ?? null,
      },
    });

    return this.toDomainEntity(savedData);
  }

  async findById(id: string): Promise<NoteEntity | null> {
    const data = await this.prisma.note.findUnique({ where: { id } });
    if (!data) return null;
    return this.toDomainEntity(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.note.delete({ where: { id } });
  }

  async getNotesTree(userId: string): Promise<NoteEntity[]> {
    const data = await this.prisma.note.findMany({ where: { userId } });
    return data.map(d => this.toDomainEntity(d));
  }

  private toDomainEntity(d: {
    id: string;
    title: string;
    userId: string;
    content: string | null;
    parentId: string | null;
    subjectId: string | null;
  }): NoteEntity {
    const props: NoteProps = {
      id: d.id,
      title: d.title,
      userId: d.userId,
      content: d.content ?? undefined,
      parentId: d.parentId ?? undefined,
      subjectId: d.subjectId ?? undefined,
    };
    return new NoteEntity(props);
  }
}
