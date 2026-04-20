import { ITaskSortStrategy } from './task-sort.strategies';
import { TaskEntity } from '../../task.entity';

export class TaskSortContext {
  constructor(private readonly strategy: ITaskSortStrategy) {}

  executeStrategy(tasks: TaskEntity[]): TaskEntity[] {
    return this.strategy.sort(tasks);
  }
}