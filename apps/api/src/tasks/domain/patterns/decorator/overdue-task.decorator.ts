import { TaskEntity, TaskStatus } from '../../task.entity';

import { TaskDecorator } from './recurring-task.decorator'; 

export class OverdueTaskDecorator extends TaskDecorator {
  constructor(protected readonly wrappee: TaskEntity) {
    super(wrappee);
  }

  get title(): string {
    const baseTitle = this.wrappee.title;
    const deadline = this.wrappee.deadline;
    if (!deadline || this.wrappee.status === TaskStatus.DONE) {
      return baseTitle;
    }

    const isOverdue = deadline.getTime() < new Date().getTime();

    if (isOverdue) {
      return `[ПРОСТРОЧЕНО] ${baseTitle}`;
    }

    return baseTitle;
  }

  set title(value: string) {
    this.wrappee.title = value;
  }
}
