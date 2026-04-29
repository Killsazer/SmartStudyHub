import { Injectable, Inject, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import type { INoteRepository } from '../domain/note.repository.interface';
import { NoteEntity } from '../domain/note.entity';
import { CreateNoteDto } from '../presentation/dto/create-note.dto';
import { UpdateNoteDto } from '../presentation/dto/update-note.dto';
import { INoteNode } from '../domain/patterns/composite/note-component';
import { NoteTreeBuilder } from './note-tree.builder';
import { randomUUID } from 'crypto';

@Injectable()
export class NoteService {
  private readonly logger = new Logger(NoteService.name);

  constructor(
    @Inject('INoteRepository')
    private readonly noteRepo: INoteRepository,
  ) {}

  async createNote(userId: string, dto: CreateNoteDto): Promise<NoteEntity> {
    if (dto.parentId) {
      await this.checkAccess(dto.parentId, userId);
    }
    
    const note = new NoteEntity({
      id: randomUUID(),
      title: dto.title,
      userId,
      content: dto.content,
      parentId: dto.parentId,
      subjectId: dto.subjectId,
    });
    await this.noteRepo.save(note);
    this.logger.log(`Created note '${dto.title}' for user: ${userId}`);
    return note;
  }

  async getNotesTree(userId: string): Promise<INoteNode[]> {
    const entities = await this.noteRepo.getNotesTree(userId);
    const tree = NoteTreeBuilder.build(entities);
    return tree.map(root => root.toJSON());
  }

  async updateNote(userId: string, noteId: string, dto: UpdateNoteDto): Promise<NoteEntity> {
    const note = await this.checkAccess(noteId, userId);

    if (dto.title !== undefined) note.title = dto.title;
    if (dto.content !== undefined) note.content = dto.content;

    await this.noteRepo.save(note);
    return note;
  }

  async deleteNote(userId: string, noteId: string): Promise<void> {
    await this.checkAccess(noteId, userId);
    await this.noteRepo.delete(noteId);
  }

  private async checkAccess(noteId: string, userId: string): Promise<NoteEntity> {
    const note = await this.noteRepo.findById(noteId);
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('Access denied: You can only modify your own notes');
    }

    return note;
  }
}
