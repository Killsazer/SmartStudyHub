import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity } from '../../entities/task.entity';

export class TaskFeedContext {
  constructor(private strategy: ITaskSortStrategy) {}

  public setStrategy(strategy: ITaskSortStrategy): void {
    this.strategy = strategy;
  }

  public getSortedTasks(tasks: TaskEntity[]): TaskEntity[] {
    if (!this.strategy) {
      throw new Error('Sort strategy is not set.');
    }
    return this.strategy.sort(tasks);
  }
}
