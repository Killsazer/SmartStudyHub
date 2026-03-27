import { ICommand } from './command.interface';

export class CommandHistory {
  private history: ICommand[] = [];

  public push(command: ICommand): void {
    // 1. Спочатку виконуємо команду
    command.execute();
    
    // 2. Зберігаємо її у стеку для можливого Undo
    this.history.push(command);
  }

  public undoLast(): void {
    // Витягуємо останню команду
    const command = this.history.pop();
    
    if (command) {
      // Відкочуємо її зміни
      command.undo();
    } else {
      console.warn(`[CommandHistory] No commands left to undo in the stack.`);
    }
  }

  public getHistoryLength(): number {
    return this.history.length;
  }
}
