/**
 * ====================================================================
 * Патерн: Composite (Структурний / Structural)
 * ====================================================================
 * Дозволяє будувати деревоподібну структуру нотаток з нескінченною
 * вкладеністю. Клієнт працює з окремими блоками (NoteBlock) та
 * секціями-контейнерами (NoteSection) через єдиний інтерфейс
 * NoteComponent, не розрізняючи лист від вузла дерева.
 *
 * Ключові ознаки:
 * - Абстрактний компонент `NoteComponent` — єдиний інтерфейс
 * - Листок (`NoteBlock`) — не має дітей
 * - Вузол (`NoteSection`) — містить дітей, рекурсивно серіалізується
 * - `toJSON()` — рекурсивна серіалізація всього дерева
 * ====================================================================
 */

/** Типізована структура JSON-представлення дерева нотаток */
export interface INoteNode {
  id: string;
  type: 'section' | 'block';
  title: string;
  content?: string;
  subjectId?: string | null;
  children?: INoteNode[];
}

/**
 * Абстрактний компонент — базовий клас для всіх елементів дерева.
 * Визначає спільний інтерфейс для листків і вузлів.
 * Методи add/remove за замовчуванням кидають помилку — листки їх не підтримують.
 */
export abstract class NoteComponent {
  constructor(
    public readonly id: string,
    public title: string,
    public subjectId: string | null = null
  ) {}

  /** Додає дочірній компонент (перевизначається у NoteSection) */
  add(component: NoteComponent): void {
    throw new Error('This component does not support adding children.');
  }

  /** Видаляє дочірній компонент (перевизначається у NoteSection) */
  remove(componentId: string): void {
    throw new Error('This component does not support removing children.');
  }

  /** Рекурсивна серіалізація компонента та всіх дітей у JSON */
  abstract toJSON(): INoteNode;
}