// File: src/tasks/domain/patterns/command/command-history.ts
import { ICommand } from './command.interface';

export class CommandHistory {
  private history: ICommand[] = [];

  public push(command: ICommand): void {
    command.execute();
    this.history.push(command);
  }

  public undoLast(): void {
    const command = this.history.pop();
    if (command) {
      command.undo();
    } else {
      console.warn(`[CommandHistory] No commands left to undo in the stack.`);
    }
  }

  public getHistoryLength(): number {
    return this.history.length;
  }
}
