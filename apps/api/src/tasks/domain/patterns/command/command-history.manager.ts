import { Injectable } from '@nestjs/common';
import { ICommand } from './command.interface';

@Injectable()
export class CommandHistoryManager {
  private histories: Map<string, ICommand[]> = new Map();

  async execute(userId: string, command: ICommand): Promise<void> {
    await command.execute();

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
      throw new Error('Nothing to undo');
    }

    const command = userHistory.pop();
    if (command) {
      await command.undo();
    }
  }
}