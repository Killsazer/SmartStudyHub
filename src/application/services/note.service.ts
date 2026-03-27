// File: src/application/services/note.service.ts
import { Injectable, Inject } from '@nestjs/common';
import type { INoteRepository } from '../../domain/repositories/note.repository.interface';
import { NoteEntity } from '../../domain/entities/note.entity';
import { CreateNoteDto } from '../../presentation/dtos/create-note.dto';
import { NoteSection } from '../../domain/patterns/composite/note-section';
import { NoteBlock } from '../../domain/patterns/composite/note-block';

@Injectable()
export class NoteService {
  constructor(
    @Inject('INoteRepository')
    private readonly noteRepo: INoteRepository
  ) {}

  async createNote(userId: string, dto: CreateNoteDto): Promise<NoteEntity> {
    const note = new NoteEntity(
      `note-${Date.now()}`,
      dto.title,
      userId,
      dto.content,
      dto.parentId,
      dto.subjectId
    );
    await this.noteRepo.save(note);
    return note;
  }

  async getNotesTree(userId: string): Promise<any[]> {
    // 1. Отримуємо всі "плоскі" записи для конкретного користувача (CQRS Query)
    const allNotes = await this.noteRepo.findByUserId(userId);
    
    const map = new Map<string, any>();
    const forest: any[] = [];
    
    // 2. Будуємо компоненти (Composite або Leaf відповідно до правил)
    allNotes.forEach(n => {
      // Якщо є контент, то це листовий елемент (NoteBlock), інакше — контейнер (NoteSection)
      const component = n.content 
        ? new NoteBlock(n.id, n.title, n.content) 
        : new NoteSection(n.id, n.title);
        
      map.set(n.id, { component, entity: n });
    });

    // 3. Відтворюємо ієрархію в пам'яті
    allNotes.forEach(n => {
      const node = map.get(n.id);
      
      if (n.parentId && map.has(n.parentId)) {
        // Якщо є батько, додаємо поточний компонент до батьківського контейнера
        const parentNode = map.get(n.parentId);
        
        // У нашому Composite патерні додавати можна лише в NoteSection
        if (parentNode.component instanceof NoteSection) {
          parentNode.component.add(node.component);
        }
      } else {
        // Якщо батька немає, це кореневий гілковий/листовий елемент дерева
        forest.push(node.component);
      }
    });

    // 4. Поліморфний виклик toJSON(), який рекурсивно обійде все дерево
    return forest.map(rootComponent => rootComponent.toJSON());
  }
}
