// File: src/domain/patterns/strategy/sort-by-title.strategy.ts
import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity } from '../../entities/task.entity';

export class SortByTitleStrategy implements ITaskSortStrategy {
  sort(tasks: TaskEntity[]): TaskEntity[] {
    return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
  }
}
