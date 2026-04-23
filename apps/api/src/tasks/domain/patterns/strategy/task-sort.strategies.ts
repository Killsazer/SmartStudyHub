import { TaskEntity, TaskPriority } from '../../task.entity';

export interface ITaskSortStrategy {
  sort(tasks: TaskEntity[]): TaskEntity[];
}

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

export class SortByTitleStrategy implements ITaskSortStrategy {
  sort(tasks: TaskEntity[]): TaskEntity[] {
    return [...tasks].sort((a, b) => a.title.localeCompare(b.title));
  }
}