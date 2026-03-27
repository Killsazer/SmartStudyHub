// File: src/notes/domain/note.repository.interface.ts
import { NoteEntity } from './note.entity';

export interface INoteRepository {
  save(note: NoteEntity): Promise<void>;
  findByUserId(userId: string): Promise<NoteEntity[]>;
}
