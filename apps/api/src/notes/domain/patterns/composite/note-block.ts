/**
 * ====================================================================
 * Патерн: Composite — Листок (Leaf)
 * ====================================================================
 * NoteBlock — кінцевий елемент дерева нотаток, що містить текстовий
 * контент. Не може мати дочірніх елементів. Операції add/remove
 * успадковують поведінку базового класу (кидають помилку).
 * ====================================================================
 */
import { NoteComponent, INoteNode } from './note.component';

/**
 * Листок Composite — атомарний блок нотатки з текстовим вмістом.
 * Серіалізується як `type: 'block'` без масиву `children`.
 */
export class NoteBlock extends NoteComponent {
  constructor(
    id: string,
    title: string,
    private content: string,
    subjectId: string | null = null
  ) {
    super(id, title, subjectId);
  }

  /** Серіалізує листок у JSON (без children, бо це кінцевий елемент) */
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