import { ICommand } from './command.interface';
import { TaskEntity, TaskStatus } from '../../entities/task.entity';

export class ChangeTaskStatusCommand implements ICommand {
  private previousStatus: TaskStatus | null = null;

  constructor(
    private readonly task: TaskEntity,
    private readonly newStatus: TaskStatus
  ) {}

  execute(): void {
    // Зберігаємо попередній стан перед зміною
    this.previousStatus = this.task.status;
    
    // Застосовуємо нову зміну
    this.task.status = this.newStatus;
    
    console.log(`[ChangeTaskStatusCommand] Task '${this.task.title}' status changed to ${this.newStatus}`);
  }

  undo(): void {
    if (this.previousStatus === null) {
      console.warn(`[ChangeTaskStatusCommand] Cannot undo: Command was never executed.`);
      return;
    }
    
    // Відкочуємо статус до попереднього значення
    this.task.status = this.previousStatus;
    
    console.log(`[ChangeTaskStatusCommand] Undone: Task '${this.task.title}' reverted back to ${this.previousStatus}`);
  }
}
