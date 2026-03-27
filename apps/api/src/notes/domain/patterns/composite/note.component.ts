// File: src/notes/domain/patterns/composite/note.component.ts
export interface INoteNode {
  id: string;
  type: 'section' | 'block';
  title: string;
  content?: string;
  children?: INoteNode[];
}

export abstract class NoteComponent {
  constructor(
    public readonly id: string,
    public title: string
  ) {}

  add(component: NoteComponent): void {
    throw new Error('This component does not support adding children.');
  }

  remove(componentId: string): void {
    throw new Error('This component does not support removing children.');
  }

  abstract toJSON(): INoteNode;
}