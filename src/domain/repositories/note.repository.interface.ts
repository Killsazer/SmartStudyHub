// File: src/domain/repositories/note.repository.interface.ts
import { NoteEntity } from '../entities/note.entity';

export interface INoteRepository {
  save(note: NoteEntity): Promise<void>;
  findByUserId(userId: string): Promise<NoteEntity[]>;
}
