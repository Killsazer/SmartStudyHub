// File: src/notes/domain/patterns/composite/note-block.ts
import { NoteComponent, INoteNode } from './note.component';

export class NoteBlock extends NoteComponent {
  constructor(
    id: string,
    title: string,
    private content: string
  ) {
    super(id, title);
  }

  override toJSON(): INoteNode {
    return {
      id: this.id,
      type: 'block',
      title: this.title,
      content: this.content
    };
  }
}