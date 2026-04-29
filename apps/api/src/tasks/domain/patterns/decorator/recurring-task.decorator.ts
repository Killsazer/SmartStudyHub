import { randomUUID } from 'crypto';
import { ITask, TaskStatus, TaskEntity, TaskPriority } from '../../task.entity';

export abstract class TaskDecorator implements ITask {
  constructor(protected readonly wrappee: ITask) {}

  get id(): string { return this.wrappee.id; }
  get title(): string { return this.wrappee.title; }
  get status(): TaskStatus { return this.wrappee.status; }
  get priority(): TaskPriority { return this.wrappee.priority; }
  get userId(): string { return this.wrappee.userId; }
  get deadline(): Date | undefined { return this.wrappee.deadline; }
  get description(): string | undefined { return this.wrappee.description; }
  get subjectId(): string | undefined { return this.wrappee.subjectId; }
  get recurrenceDays(): number | undefined { return this.wrappee.recurrenceDays; }

  completeTask(): ITask | null {
    return this.wrappee.completeTask();
  }

  toJSON(): Record<string, unknown> {
    return this.wrappee.toJSON ? this.wrappee.toJSON() : { ...this.wrappee };
  }
}

export class RecurringTaskDecorator extends TaskDecorator {
  constructor(
    wrappee: ITask,
    private _recurrenceDays: number,
  ) {
    super(wrappee);
  }

  override completeTask(): ITask | null {
    super.completeTask();

    const nextDeadline = this.calculateNextDeadline(this.deadline);
    
    const wrappeeData = this.wrappee.toJSON ? this.wrappee.toJSON() : this.wrappee;

    return new TaskEntity({
      ...wrappeeData,
      id: randomUUID(),
      status: TaskStatus.TODO,
      deadline: nextDeadline,
      recurrenceDays: this._recurrenceDays,
    });
  }
  
  get nextDeadline(): Date {
    return this.calculateNextDeadline(this.deadline);
  }

  override toJSON(): Record<string, unknown> & { nextDeadline: Date } {
    return {
      ...super.toJSON(),
      nextDeadline: this.nextDeadline,
    };
  }

  private calculateNextDeadline(currentDeadline?: Date): Date {
    const nextDate = currentDeadline ? new Date(currentDeadline) : new Date();
    nextDate.setDate(nextDate.getDate() + this._recurrenceDays);
    return nextDate;
  }
}
