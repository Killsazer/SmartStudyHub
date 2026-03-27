import { NoteComponent, INoteNode } from './note.component';

export class NoteSection extends NoteComponent {
  private children: NoteComponent[] = [];

  constructor(id: string, title: string) {
    super(id, title);
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
      type: 'section', // Маркер контейнера
      title: this.title,
      // Рекурсивно викликаємо toJSON() у всіх нащадків
      children: this.children.map((child) => child.toJSON())
    };
  }
}