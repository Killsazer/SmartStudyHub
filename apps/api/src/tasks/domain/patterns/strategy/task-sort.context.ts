import { ITaskSortStrategy } from './task-sort.strategies';
import { ITask } from '../../task.entity';

export class TaskSortContext {
  constructor(private readonly strategy: ITaskSortStrategy) {}

  executeStrategy(tasks: ITask[]): ITask[] {
    return this.strategy.sort(tasks);
  }
}