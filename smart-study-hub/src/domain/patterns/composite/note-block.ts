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
      type: 'block', // Маркер для фронтенду, щоб він знав, який React-компонент рендерити
      title: this.title,
      content: this.content
    };
  }
}