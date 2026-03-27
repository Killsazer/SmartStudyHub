// File: src/notes/domain/patterns/composite/note-section.ts
import { NoteComponent, INoteNode } from './note.component';

export class NoteSection extends NoteComponent {
  private children: NoteComponent[] = [];

  constructor(id: string, title: string, subjectId: string | null = null) {
    super(id, title, subjectId);
  }

  override add(component: NoteComponent): void {
    this.children.push(component);
  }

  override remove(componentId: string): void {
    this.children = this.children.filter((child) => child.id !== componentId);
  }

  override toJSON(): INoteNode {
    return {
      id: this.id,
      type: 'section',
      title: this.title,
      children: this.children.map((child) => child.toJSON()),
      subjectId: this.subjectId
    };
  }
}