import { Injectable } from '@nestjs/common';
import { ICommand } from './command.interface';

@Injectable()
export class CommandHistoryManager {
  // Map: userId - стек команд
  private histories: Map<string, ICommand[]> = new Map();

  async execute(userId: string, command: ICommand): Promise<void> {
    await command.execute();

    // Дістаємо масив команд юзера, або створюємо новий, якщо його ще немає
    let userHistory = this.histories.get(userId);
    if (!userHistory) {
      userHistory = [];
      this.histories.set(userId, userHistory);
    }

    userHistory.push(command);

    if (userHistory.length > 10) {
      userHistory.shift();
    }
  }

    async undo(userId: string): Promise<void> {
    const userHistory = this.histories.get(userId);
    if (!userHistory || userHistory.length === 0) {
      throw new Error('Нічого відміняти!');
    }

    const command = userHistory.pop();
    
    if (command) {
      await command.undo();
    }
  }

}
