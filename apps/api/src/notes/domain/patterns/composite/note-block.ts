// File: src/notes/domain/patterns/composite/note-block.ts
import { NoteComponent, INoteNode } from './note.component';

export class NoteBlock extends NoteComponent {
  constructor(
    id: string,
    title: string,
    private content: string,
    subjectId: string | null = null
  ) {
    super(id, title, subjectId);
  }

  override toJSON(): INoteNode {
    return {
      id: this.id,
      type: 'block',
      title: this.title,
      content: this.content,
      subjectId: this.subjectId
    };
  }
}