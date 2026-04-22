import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { INoteRepository } from '../domain/note.repository.interface';
import { NoteEntity } from '../domain/note.entity';
import { NoteBlock } from '../domain/patterns/composite/note-block';
import { NoteSection } from '../domain/patterns/composite/note-section';
import { NoteComponent } from '../domain/patterns/composite/note-component';

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
    return data.map(d => this.toDomainEntity(d));
  }

  async findById(id: string): Promise<NoteEntity | null> {
    const d = await this.prisma.note.findUnique({ where: { id } });
    if (!d) return null;
    return this.toDomainEntity(d);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.note.delete({ where: { id } });
  }

  async getNotesTree(userId: string): Promise<NoteComponent[]> {
    const allNotes = await this.prisma.note.findMany({ where: { userId } });
    
    const map = new Map<string, NoteComponent>();
    const roots: NoteComponent[] = [];

    // Перший прохід: створюємо об'єкти
    allNotes.forEach(n => {
      const component = n.content
        ? new NoteBlock(n.id, n.title, n.content, n.subjectId)
        : new NoteSection(n.id, n.title, n.subjectId);
      map.set(n.id, component);
    });

    // Другий прохід: зв'язуємо ієрархію
    allNotes.forEach(n => {
      const component = map.get(n.id);
      if (n.parentId && map.has(n.parentId)) {
        const parent = map.get(n.parentId);
        if (parent instanceof NoteSection) {
          parent.add(component!);
        }
      } else {
        roots.push(component!);
      }
    });

    return roots;
  }

  private toDomainEntity(d: {
    id: string;
    title: string;
    userId: string;
    content: string | null;
    parentId: string | null;
    subjectId: string | null;
  }): NoteEntity {
    return new NoteEntity(
      d.id,
      d.title,
      d.userId,
      d.content ?? undefined,
      d.parentId ?? undefined,
      d.subjectId ?? undefined
    );
  }
}
