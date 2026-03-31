/**
 * ====================================================================
 * Патерн: Strategy — Конкретна стратегія (сортування за дедлайном)
 * ====================================================================
 * Сортує завдання за зростанням дедлайну (найближчі — першими).
 * Завдання без дедлайну переміщуються в кінець списку.
 * ====================================================================
 */
import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity } from '../../task.entity';

/** Конкретна стратегія: сортує за дедлайном (ascending, nulls last) */
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
