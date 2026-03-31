/**
 * ====================================================================
 * Патерн: Command (Поведінковий / Behavioral) — Invoker (Викликач)
 * ====================================================================
 * CommandHistory виконує роль Invoker — зберігає стек виконаних
 * команд та дозволяє відкочувати їх у зворотному порядку (LIFO).
 * Це забезпечує функціональність Undo для будь-яких дій,
 * інкапсульованих як ICommand.
 *
 * Ключові ознаки:
 * - Не знає деталей конкретних команд — працює через інтерфейс ICommand
 * - `push()` — виконує та додає команду в стек
 * - `undoLast()` — витягує останню команду зі стеку та відкочує
 * ====================================================================
 */
import { ICommand } from './command.interface';

export class CommandHistory {
  /** Стек виконаних команд (LIFO — Last In, First Out) */
  private history: ICommand[] = [];

  /** Виконує команду та додає її до стеку історії */
  public push(command: ICommand): void {
    command.execute();
    this.history.push(command);
  }

  /** Витягує останню команду зі стеку та виконує undo */
  public undoLast(): void {
    const command = this.history.pop();
    if (command) {
      command.undo();
    } else {
      console.warn(`[CommandHistory] No commands left to undo in the stack.`);
    }
  }

  /** Повертає кількість команд у стеку */
  public getHistoryLength(): number {
    return this.history.length;
  }
}
