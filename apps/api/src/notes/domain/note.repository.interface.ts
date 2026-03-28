// File: src/notes/domain/note.repository.interface.ts
import { NoteEntity } from './note.entity';

export interface INoteRepository {
  save(note: NoteEntity): Promise<void>;
  findById(id: string): Promise<NoteEntity | null>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<NoteEntity[]>;
}
