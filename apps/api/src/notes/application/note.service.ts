// File: src/notes/application/note.service.ts
import { Injectable, Inject } from '@nestjs/common';
import type { INoteRepository } from '../domain/note.repository.interface';
import { NoteEntity } from '../domain/note.entity';
import { CreateNoteDto } from '../presentation/create-note.dto';
import { UpdateNoteDto } from '../presentation/update-note.dto';
import { NoteSection } from '../domain/patterns/composite/note-section';
import { NoteBlock } from '../domain/patterns/composite/note-block';

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
    const allNotes = await this.noteRepo.findByUserId(userId);
    
    const map = new Map<string, any>();
    const forest: any[] = [];
    
    allNotes.forEach(n => {
      const component = n.content 
        ? new NoteBlock(n.id, n.title, n.content, n.subjectId) 
        : new NoteSection(n.id, n.title, n.subjectId);
        
      map.set(n.id, { component, entity: n });
    });

    allNotes.forEach(n => {
      const node = map.get(n.id);
      
      if (n.parentId && map.has(n.parentId)) {
        const parentNode = map.get(n.parentId);
        if (parentNode.component instanceof NoteSection) {
          parentNode.component.add(node.component);
        }
      } else {
        forest.push(node.component);
      }
    });

    return forest.map(rootComponent => rootComponent.toJSON());
  }

  async updateNote(userId: string, noteId: string, dto: UpdateNoteDto): Promise<NoteEntity> {
    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new Error(`Note with ID ${noteId} not found`);
    }
    
    if (dto.title !== undefined) note.title = dto.title;
    if (dto.content !== undefined) note.content = dto.content;

    await this.noteRepo.save(note);
    return note;
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new Error(`Note with ID ${noteId} not found`);
    }
    await this.noteRepo.delete(noteId);
  }
}
