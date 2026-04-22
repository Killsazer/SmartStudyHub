import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { INoteRepository } from '../domain/note.repository.interface';
import { NoteEntity } from '../domain/note.entity';
import { CreateNoteDto } from '../presentation/dto/create-note.dto';
import { UpdateNoteDto } from '../presentation/dto/update-note.dto';
import { NoteComponent } from '../domain/patterns/composite/note-component';
import { randomUUID } from 'crypto';

@Injectable()
export class NoteService {
  constructor(
    @Inject('INoteRepository')
    private readonly noteRepo: INoteRepository
  ) {}

  async createNote(userId: string, dto: CreateNoteDto): Promise<NoteEntity> {
    const note = new NoteEntity(
      randomUUID(),
      dto.title,
      userId,
      dto.content,
      dto.parentId,
      dto.subjectId
    );
    await this.noteRepo.save(note);
    return note;
  }

  async getNotesTree(userId: string): Promise<ReturnType<NoteComponent['toJSON']>[]> {
    // 1. Отримуємо вже зібраний "ліс" компонентів від репозиторію
    const roots = await this.noteRepo.getNotesTree(userId);

    // 2. Просто перетворюємо доменні об'єкти на JSON для презентаційного шару
    return roots.map(root => root.toJSON());
  }


  async updateNote(userId: string, noteId: string, dto: UpdateNoteDto): Promise<NoteEntity> {
    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    if (dto.title !== undefined) note.title = dto.title;
    if (dto.content !== undefined) note.content = dto.content;

    await this.noteRepo.save(note);
    return note;
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }
    await this.noteRepo.delete(noteId);
  }
}
