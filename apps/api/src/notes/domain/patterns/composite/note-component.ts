import type { INoteVisitor } from '../visitor/note.visitor';

export interface INoteNode {
  id: string;
  type: 'section' | 'block';
  title: string;
  wordCount: number;
  readingMinutes: number;
  content?: string;
  subjectId?: string | null;
  children?: INoteNode[];
}

export abstract class NoteComponent {
  constructor(
    public readonly id: string,
    public title: string,
    public subjectId: string | null = null,
  ) {}

  abstract getItemCount(): number;

  abstract getWordCount(): number;

  abstract getEstimatedReadingMinutes(): number;

  abstract toJSON(): INoteNode;

  abstract accept<T>(visitor: INoteVisitor<T>, depth?: number): T;
}