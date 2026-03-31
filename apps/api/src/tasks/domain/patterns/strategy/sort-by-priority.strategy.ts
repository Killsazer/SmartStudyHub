/**
 * ====================================================================
 * Патерн: Strategy — Конкретна стратегія (сортування за пріоритетом)
 * ====================================================================
 * Сортує завдання за спаданням пріоритету (HIGH → MEDIUM → LOW).
 * Використовує вагову Map для числового порівняння пріоритетів.
 * ====================================================================
 */
import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity, TaskPriority } from '../../task.entity';

/** Конкретна стратегія: сортує за пріоритетом (descending — HIGH першим) */
export class SortByPriorityStrategy implements ITaskSortStrategy {
  /** Вагова Map для перетворення enum → числове значення */
  private readonly priorityWeight: Record<TaskPriority, number> = {
    [TaskPriority.HIGH]: 3,
    [TaskPriority.MEDIUM]: 2,
    [TaskPriority.LOW]: 1,
  };

  sort(tasks: TaskEntity[]): TaskEntity[] {
    return [...tasks].sort((a, b) => {
      const weightA = this.priorityWeight[a.priority] || 0;
      const weightB = this.priorityWeight[b.priority] || 0;
      return weightB - weightA;
    });
  }
}
