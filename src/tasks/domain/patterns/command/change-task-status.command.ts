// File: src/tasks/domain/patterns/command/change-task-status.command.ts
import { ICommand } from './command.interface';
import { TaskEntity, TaskStatus } from '../../task.entity';

export class ChangeTaskStatusCommand implements ICommand {
  private previousStatus: TaskStatus | null = null;

  constructor(
    private readonly task: TaskEntity,
    private readonly newStatus: TaskStatus
  ) {}

  execute(): void {
    this.previousStatus = this.task.status;
    this.task.status = this.newStatus;
    console.log(`[ChangeTaskStatusCommand] Task '${this.task.title}' status changed to ${this.newStatus}`);
  }

  undo(): void {
    if (this.previousStatus === null) {
      console.warn(`[ChangeTaskStatusCommand] Cannot undo: Command was never executed.`);
      return;
    }
    this.task.status = this.previousStatus;
    console.log(`[ChangeTaskStatusCommand] Undone: Task '${this.task.title}' reverted back to ${this.previousStatus}`);
  }
}
