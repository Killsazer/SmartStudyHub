import { ITaskSortStrategy } from './task-sort.strategies';
import { TaskEntity } from '../../task.entity';

export class TaskSortContext {
  constructor(private strategy: ITaskSortStrategy) {}

  setStrategy(strategy: ITaskSortStrategy) {
    this.strategy = strategy;
  }

  executeStrategy(tasks: TaskEntity[]): TaskEntity[] {
    return this.strategy.sort(tasks);
  }
}