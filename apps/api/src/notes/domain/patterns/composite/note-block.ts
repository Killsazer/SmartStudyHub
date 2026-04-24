import { NoteComponent, INoteNode } from './note-component';

export class NoteBlock extends NoteComponent {
  constructor(
    id: string,
    title: string,
    private _content: string,
    subjectId: string | null = null,
  ) {
    super(id, title, subjectId);
  }

  get content(): string {
    return this._content;
  }

  set content(value: string) {
    this._content = value;
  }

  override getItemCount(): number {
    return 1;
  }

  override toJSON(): INoteNode {
    return {
      id: this.id,
      type: 'block',
      title: this.title,
      content: this._content,
      subjectId: this.subjectId,
    };
  }
}