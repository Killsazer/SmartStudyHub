import { NoteComponent, INoteNode } from './note-component';

const WORDS_PER_MINUTE = 200;

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

  override getWordCount(): number {
    const trimmed = this._content.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }

  override getEstimatedReadingMinutes(): number {
    return Math.ceil(this.getWordCount() / WORDS_PER_MINUTE);
  }

  override toJSON(): INoteNode {
    return {
      id: this.id,
      type: 'block',
      title: this.title,
      content: this._content,
      subjectId: this.subjectId,
      wordCount: this.getWordCount(),
      readingMinutes: this.getEstimatedReadingMinutes(),
    };
  }
}