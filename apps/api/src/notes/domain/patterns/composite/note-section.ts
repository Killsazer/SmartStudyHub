import { NoteComponent, INoteNode } from './note-component';

export class NoteSection extends NoteComponent {
  private children: NoteComponent[] = [];

  constructor(id: string, title: string, subjectId: string | null = null) {
    super(id, title, subjectId);
  }

  add(component: NoteComponent): void {
    this.children.push(component);
  }

  remove(componentId: string): void {
    this.children = this.children.filter((child) => child.id !== componentId);
  }

  getChildren(): ReadonlyArray<NoteComponent> {
    return this.children;
  }

  override getItemCount(): number {
    return this.children.reduce((sum, child) => sum + child.getItemCount(), 0);
  }

  override getWordCount(): number {
    return this.children.reduce((sum, child) => sum + child.getWordCount(), 0);
  }

  override getEstimatedReadingMinutes(): number {
    return this.children.reduce((sum, child) => sum + child.getEstimatedReadingMinutes(), 0);
  }

  override toJSON(): INoteNode {
    return {
      id: this.id,
      type: 'section',
      title: this.title,
      children: this.children.map((child) => child.toJSON()),
      subjectId: this.subjectId,
      wordCount: this.getWordCount(),
      readingMinutes: this.getEstimatedReadingMinutes(),
    };
  }
}