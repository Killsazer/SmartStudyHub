import { NoteEntity } from './note.entity';
import { NoteComponent } from './patterns/composite/note-component';

export interface INoteRepository {
  save(note: NoteEntity): Promise<void>;
  findById(id: string): Promise<NoteEntity | null>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string): Promise<NoteEntity[]>;
  getNotesTree(userId: string): Promise<NoteComponent[]>; 
}
