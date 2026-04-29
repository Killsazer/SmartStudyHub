import { NoteEntity } from './note.entity';

export interface INoteRepository {
  save(note: NoteEntity): Promise<NoteEntity>;
  findById(id: string): Promise<NoteEntity | null>;
  delete(id: string): Promise<void>;
  getNotesTree(userId: string): Promise<NoteEntity[]>;
}
