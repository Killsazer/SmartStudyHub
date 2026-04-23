import { randomUUID } from 'crypto';
import { ITask, TaskStatus, TaskEntity, TaskPriority } from '../../task.entity';

export abstract class TaskDecorator implements ITask {
  constructor(protected wrappee: ITask) {}

  get id(): string { return this.wrappee.id; }
  get title(): string { return this.wrappee.title; }
  set title(value: string) { this.wrappee.title = value; }
  get status(): TaskStatus { return this.wrappee.status; }
  set status(value: TaskStatus) { this.wrappee.status = value; }
  get priority(): TaskPriority { return this.wrappee.priority; }
  set priority(value: TaskPriority) { this.wrappee.priority = value; }
  get userId(): string { return this.wrappee.userId; }
  get deadline(): Date | undefined { return this.wrappee.deadline; }
  get description(): string | undefined { return this.wrappee.description; }
  get subjectId(): string | undefined { return this.wrappee.subjectId; }
  get recurrenceDays(): number | undefined { return this.wrappee.recurrenceDays; }

  completeTask(): ITask | null {
    return this.wrappee.completeTask();
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
    return new TaskEntity({
      ...this.wrappee,
      id: randomUUID(),
      status: TaskStatus.TODO,
      deadline: nextDeadline,
      recurrenceDays: this._recurrenceDays,
    });
  }

  private calculateNextDeadline(currentDeadline?: Date): Date {
    const nextDate = currentDeadline ? new Date(currentDeadline) : new Date();
    nextDate.setDate(nextDate.getDate() + this._recurrenceDays);
    return nextDate;
  }
}
