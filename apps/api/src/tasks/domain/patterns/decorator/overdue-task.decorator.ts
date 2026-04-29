import { ITask, TaskStatus } from '../../task.entity';
import { TaskDecorator } from './recurring-task.decorator'; 

export class OverdueTaskDecorator extends TaskDecorator {
  constructor(protected readonly wrappee: ITask) {
    super(wrappee);
  }

  get isOverdue(): boolean {
    const deadline = this.wrappee.deadline;
    if (!deadline || this.wrappee.status === TaskStatus.DONE) {
      return false;
    }
    return deadline.getTime() < new Date().getTime();
  }

  toJSON(): Record<string, unknown> & { isOverdue: boolean } {
    return {
      ...(super.toJSON()),
      isOverdue: this.isOverdue,
    };
  }
}
