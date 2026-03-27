// Структура, яку очікуватиме фронтенд (React)
export interface INoteNode {
  id: string;
  type: 'section' | 'block';
  title: string;
  content?: string;          // Тільки для блоків (Leaf)
  children?: INoteNode[];    // Тільки для секцій (Composite)
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

  // Замість render() тепер маємо toJSON(), що повертає структуру даних
  abstract toJSON(): INoteNode;
}