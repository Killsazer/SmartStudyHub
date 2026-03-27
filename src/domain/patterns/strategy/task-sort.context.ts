// File: src/domain/patterns/strategy/task-sort.context.ts
import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity } from '../../entities/task.entity';

export class TaskSortContext {
  constructor(private strategy: ITaskSortStrategy) {}

  setStrategy(strategy: ITaskSortStrategy) {
    this.strategy = strategy;
  }

  executeStrategy(tasks: TaskEntity[]): TaskEntity[] {
    return this.strategy.sort(tasks);
  }
}
