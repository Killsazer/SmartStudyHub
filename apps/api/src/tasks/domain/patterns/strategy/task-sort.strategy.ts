// File: src/tasks/domain/patterns/strategy/task-sort.strategy.ts
import { TaskEntity } from '../../task.entity';

export interface ITaskSortStrategy {
  sort(tasks: TaskEntity[]): TaskEntity[];
}
