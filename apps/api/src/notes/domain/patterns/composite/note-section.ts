/**
 * ====================================================================
 * Патерн: Composite — Контейнер (Composite Node)
 * ====================================================================
 * NoteSection — вузол дерева нотаток, який може містити дочірні
 * елементи (як NoteBlock, так і інші NoteSection). Підтримує
 * нескінченну вкладеність та рекурсивну серіалізацію через toJSON().
 * ====================================================================
 */
import { NoteComponent, INoteNode } from './note.component';

/**
 * Контейнер Composite — секція, яка містить дочірні компоненти.
 * Може містити будь-яку комбінацію листків та інших контейнерів.
 */
export class NoteSection extends NoteComponent {
  private children: NoteComponent[] = [];

  constructor(id: string, title: string, subjectId: string | null = null) {
    super(id, title, subjectId);
  }

  /** Додає дочірній компонент до секції */
  override add(component: NoteComponent): void {
    this.children.push(component);
  }

  /** Видаляє дочірній компонент за ID */
  override remove(componentId: string): void {
    this.children = this.children.filter((child) => child.id !== componentId);
  }

  /**
   * Рекурсивна серіалізація: кожна дитина також викликає свій toJSON(),
   * що створює повне JSON-представлення всього піддерева.
   */
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