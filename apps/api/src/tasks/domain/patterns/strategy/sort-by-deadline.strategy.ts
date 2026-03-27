// File: src/tasks/domain/patterns/strategy/sort-by-deadline.strategy.ts
import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity } from '../../task.entity';

export class SortByDeadlineStrategy implements ITaskSortStrategy {
  sort(tasks: TaskEntity[]): TaskEntity[] {
    return [...tasks].sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.getTime() - b.deadline.getTime();
    });
  }
}
