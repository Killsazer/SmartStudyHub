// File: src/tasks/domain/patterns/strategy/sort-by-priority.strategy.ts
import { ITaskSortStrategy } from './task-sort.strategy';
import { TaskEntity, TaskPriority } from '../../task.entity';

export class SortByPriorityStrategy implements ITaskSortStrategy {
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
